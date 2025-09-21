import { GetParameterCommand, SSMClient } from "@aws-sdk/client-ssm";
import { awsLambdaFastify } from "@fastify/aws-lambda";
import { createServer } from "@memorygame/backend/src/server";

const { REDIS_URL } = process.env;
if (!REDIS_URL) throw new Error("Missing REDIS_URL");

let jwtSecretPromise: Promise<string>;

async function getJwtSecret() {
	if (!jwtSecretPromise) {
		const ssm = new SSMClient({});
		jwtSecretPromise = (async () => {
			const r = await ssm.send(
				new GetParameterCommand({
					Name: process.env.JWT_SECRET!,
					WithDecryption: true,
				})
			);
			return r.Parameter?.Value ?? "";
		})();
	}
	return jwtSecretPromise;
}

export const handler = async (event: any, context: any) => {
	const secret = await getJwtSecret();
	const app = await createServer(REDIS_URL!, secret);
	const proxy = awsLambdaFastify(app);
	return proxy(event, context);
};