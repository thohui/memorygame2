
import { createServer } from "./server";

const redisUrl: string = process.env.REDIS_URL!;
const jwtSecret: string = process.env.JWT_SECRET!;

(async () => {
	const server = await createServer(redisUrl, jwtSecret);
	server.listen();
})();