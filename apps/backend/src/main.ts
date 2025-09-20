import cors from "@fastify/cors";
import { createClient } from "@redis/client";
import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import Fastify from "fastify";
import { registerGameRoutes } from "./routes/game";
import { GameService } from "./services/game";

const server = Fastify({
	logger: true,
});

server.get("/", async function handler(request, reply) {
	return reply.send("healthy");
});


(async () => {

	try {

		await server.register(cors, {
			origin: true
		});

		const redisClient = createClient({ url: process.env.REDIS_URL! });
		await redisClient.connect();

		const database = drizzle(process.env.DATABASE_URL!);

		const gameService = new GameService(database, redisClient, process.env.JWT_SECRET!);

		registerGameRoutes(server, gameService);
		await server.listen({ port: 3000 });


	} catch (err) {
		server.log.error(err);
		process.exit(1);
	}

})();

