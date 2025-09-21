import { CfnOutput, Duration, Stack, StackProps } from "aws-cdk-lib";
import * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2";
import * as integrations from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as elasticache from "aws-cdk-lib/aws-elasticache";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as node from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";

export class InfraStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // vps, only private subnets
    const vpc = new ec2.Vpc(this, "Vpc", { maxAzs: 2, natGateways: 0 });

    // secuirity groups for lambda and redis
    const lambdaSg = new ec2.SecurityGroup(this, "LambdaSg", { vpc });
    const redisSg = new ec2.SecurityGroup(this, "RedisSg", { vpc });
    redisSg.addIngressRule(lambdaSg, ec2.Port.tcp(6379), "Lambda to Redis");

    // redis
    const subnetGroup = new elasticache.CfnSubnetGroup(this, "RedisSubnets", {
      cacheSubnetGroupName: "redis-subnets",
      description: "Private subnets for Redis",
      subnetIds: vpc.selectSubnets({ subnetType: ec2.SubnetType.PRIVATE_ISOLATED }).subnetIds,
    });

    const redis = new elasticache.CfnCacheCluster(this, "Redis", {
      engine: "redis",
      cacheNodeType: "cache.t4g.micro",
      numCacheNodes: 1,
      cacheSubnetGroupName: subnetGroup.cacheSubnetGroupName!,
      vpcSecurityGroupIds: [redisSg.securityGroupId],
    });

    redis.addDependency(subnetGroup);

    // needed for lambda to access secret parameter (SSM) and decrypt (KMS)
    new ec2.InterfaceVpcEndpoint(this, "SsmVpcEndpoint", {
      vpc,
      service: ec2.InterfaceVpcEndpointAwsService.SSM,
      subnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
    });
    new ec2.InterfaceVpcEndpoint(this, "KmsVpcEndpoint", {
      vpc,
      service: ec2.InterfaceVpcEndpointAwsService.KMS,
      subnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
    });

    // lambda
    const lambdaFunction = new node.NodejsFunction(this, "MemoryGame", {
      entry: "src/handler.ts",
      runtime: lambda.Runtime.NODEJS_20_X,
      architecture: lambda.Architecture.ARM_64,
      timeout: Duration.seconds(10),
      memorySize: 512,
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      securityGroups: [lambdaSg],
      environment: {
        NODE_ENV: "production",
        REDIS_URL: `redis://${redis.attrRedisEndpointAddress}:6379`,
        JWT_SECRET: "/memorygame/jwt",          // created in cli
      },
    });

    lambdaFunction.addToRolePolicy(new iam.PolicyStatement({
      actions: ["kms:Decrypt"],
      resources: ["*"],
      conditions: {
        StringEquals: {
          "kms:ViaService": `ssm.${this.region}.amazonaws.com`
        }
      }
    }));

    lambdaFunction.addToRolePolicy(new iam.PolicyStatement({
      actions: ["ssm:GetParameter"],
      resources: [
        `arn:aws:ssm:${this.region}:${this.account}:parameter/memorygame/jwt`
      ],
    }));

    // http api + lambda integration
    const httpApi = new apigwv2.HttpApi(this, "HttpApi", {
      defaultIntegration: new integrations.HttpLambdaIntegration("Proxy", lambdaFunction),
    });

    // the domain is hosted in Cloudflare
    const domainName = "api.thohui.dev";

    const cert = new acm.Certificate(this, "ApiCert", {
      domainName,
      validation: acm.CertificateValidation.fromDns(),
    });

    const apiDomain = new apigwv2.DomainName(this, "HttpApiDomain", {
      domainName,
      certificate: cert,
    });

    new apigwv2.ApiMapping(this, "ApiMapping", {
      api: httpApi,
      domainName: apiDomain,
      stage: httpApi.defaultStage!,
    });

    // output values that i need to add to Cloudflare
    new CfnOutput(this, "HttpApiUrl", { value: httpApi.apiEndpoint });
    new CfnOutput(this, "CloudflareCNAME_Name", { value: domainName });
    new CfnOutput(this, "CloudflareCNAME_Target", { value: apiDomain.regionalDomainName });
    new CfnOutput(this, "CloudflareCNAME_TTL", { value: "Auto or 300s" });
  }

}
