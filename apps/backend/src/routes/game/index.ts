import { LeaderboardResponse, NextLevelResponse, StartGameResponse } from "@memorygame/shared";
import { FastifyInstance } from "fastify";
import { z } from "zod";
import { GameService } from "../../services/game";
import { GameServiceError, createErrorPayload } from "../../services/game/error";

// Schema for the start game request body.
const startGameSchema = z.object({
	displayName: z.string().min(1).max(20)
});

// Schema for the next sequence submission request body.
const nextSequenceSchema = z.object({
	sequence: z.array(z.number())
});

export function registerGameRoutes(server: FastifyInstance, gameService: GameService) {

	server.post("/game/start", async (req, reply) => {

		// Check if body is an object
		if (typeof req.body !== "object" || req.body === null) {
			return reply.status(400).send({ error: "Invalid request body" });
		}

		// Parse body.
		const body = startGameSchema.safeParse(req.body);

		// Validate request body
		if (!body.success || !body.data.displayName) {
			return reply.status(400).send({ error: "Invalid request body" });
		}

		const gameSession = await gameService.startSession(body.data.displayName);

		const response: StartGameResponse = {
			token: gameSession.token,
			level: gameSession.level,
			step: gameSession.sequence[gameSession.sequence.length - 1],
			sequenceLength: gameSession.sequence.length
		};

		reply.send(response);

	});


	server.post("/game/next", async (req, reply) => {
		const token = req.headers["authorization"];

		// Check for token.
		if (!token) {
			return reply.status(401).send({ error: "Unauthorized" });
		}

		// Parse body.
		const body = nextSequenceSchema.safeParse(req.body);

		// Validate request body.
		if (!body.success || !body.data.sequence) {
			return reply.status(400).send({ error: "Invalid request body" });
		}

		try {

			const session = await gameService.submitSequence(token, body.data.sequence);

			const response: NextLevelResponse = {
				level: session.level,
				step: session.sequence[session.sequence.length - 1],
				sequenceLength: session.sequence.length
			};

			return reply.send(response);

		} catch (error) {
			if (error instanceof GameServiceError) {
				return reply.status(400).send(error.toPayload());
			} else {
				return reply.status(500).send(createErrorPayload("INTERNAL_ERROR", "Internal server error"));
			}
		}

	});


	server.post("/game/end", async (req, reply) => {

		const token = req.headers["authorization"];

		// Check for token.
		if (!token) {
			return reply.status(401).send(createErrorPayload("UNAUTHORIZED", "Unauthorized"));
		}

		try {

			const score = await gameService.submitScore(token);
			return reply.send(score);

		} catch (error) {
			if (error instanceof GameServiceError) {
				return reply.status(400).send(error.toPayload());
			} else {
				return reply.status(500).send(createErrorPayload("INTERNAL_ERROR", "Internal server error"));
			}

		}

	});

	server.get("/game/leaderboard", async (req, reply) => {


		try {

			const leaderboard = await gameService.getLeaderboard();

			const response: LeaderboardResponse = {
				scores: leaderboard
			};

			return reply.send(response);

		} catch (error) {
			return reply.status(500).send(createErrorPayload("INTERNAL_ERROR", "Internal server error"));
		}

	});

}