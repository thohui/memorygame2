import cors from "@fastify/cors";
import { createClient } from "@redis/client";
import "dotenv/config";
import Fastify from "fastify";
import { registerGameRoutes } from "./routes/game";
import { GameService } from "./services/game";

export async function createServer(redisUrl: string, jwtSecret: string) {


	const server = Fastify({
		logger: true,
	});

	server.get("/", async function handler(request, reply) {
		return reply.send("healthy");
	});

	await server.register(cors, {
		origin: true
	});

	const redisClient = createClient({ url: redisUrl });
	await redisClient.connect();

	const gameService = new GameService(redisClient, jwtSecret);
	registerGameRoutes(server, gameService);

	return server;

};
