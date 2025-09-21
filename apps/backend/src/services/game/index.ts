import { RedisClientType } from "@redis/client";
import jwt from "jsonwebtoken";
import { getTop10Scores, submitLeaderboardScore } from "./leaderboard";
import { ERRORS, GameScore, GameServiceError, GameSession, TokenData } from "./types";
import { generateRandomStep } from "./utils";

/** Service to manage game sessions, including starting sessions, validating sequences, and more. */
export class GameService {

	private redisClient: RedisClientType;
	private jwtSecret: string;

	constructor(redisClient: RedisClientType, jwtSecret: string) {
		this.redisClient = redisClient;
		this.jwtSecret = jwtSecret;
	}

	/** Start the game session for a player. */
	public async startSession(displayName: string): Promise<GameSession> {

		const sessionToken = jwt.sign({ displayName }, this.jwtSecret, { expiresIn: "30m" });

		const session: GameSession = {
			token: sessionToken,
			level: 1,
			sequence: [generateRandomStep()],
		};

		await this.redisClient.set(sessionKey(sessionToken), JSON.stringify(session), { expiration: { type: "EX", value: 1800 } });

		return session;

	}

	/** Verify the provided JWT token. */
	private verifyToken(sessionToken: string): TokenData | null {

		try {
			return jwt.verify(sessionToken, this.jwtSecret) as TokenData;
		} catch {
			return null;
		}

	}

	private async deleteSession(token: string): Promise<void> {
		try {
			await this.redisClient.del(sessionKey(token));
		} catch {
			throw new GameServiceError(ERRORS.INTERNAL_ERROR, "Failed to retrieve session");
		}
	}

	/** Attempt to get the session through redis */
	private async getSession(token: string): Promise<GameSession> {

		try {

			// Verify token
			if (!this.verifyToken(token)) {
				throw new GameServiceError(ERRORS.INTERNAL_ERROR, "Invalid token");
			}

			const sessionData = await this.redisClient.get(sessionKey(token));

			if (!sessionData) {
				throw new GameServiceError(ERRORS.INTERNAL_ERROR, "Session not found");
			}

			return JSON.parse(sessionData) as GameSession;

		} catch (error) {
			throw new GameServiceError(ERRORS.INTERNAL_ERROR, "Failed to retrieve session");
		}

	}


	/** Validate a sequence of numbers */
	public async submitSequence(sessionToken: string, sequence: number[]): Promise<GameSession> {

		const session = await this.getSession(sessionToken);

		const sessionSequence = session.sequence;

		// Check if the lengths match
		if (sequence.length !== sessionSequence.length) {
			await this.deleteSession(sessionToken);
			throw new GameServiceError(ERRORS.GAME_OVER, "Sequence length does not match");
		}

		// Check if all elements match
		for (let i = 0; i < sequence.length; i++) {
			if (sequence[i] !== sessionSequence[i]) {
				await this.deleteSession(sessionToken);
				throw new GameServiceError(ERRORS.GAME_OVER, "Sequence does not match");
			}
		}

		const upgradedSession: GameSession = {
			token: session.token,
			level: session.level + 1,
			sequence: [...sessionSequence, generateRandomStep()],
		};

		await this.redisClient.set(sessionKey(sessionToken), JSON.stringify(upgradedSession));

		return upgradedSession;

	}

	/** Submit a session"s score. */
	public async submitScore(sessionToken: string): Promise<GameScore> {

		const tokenData = this.verifyToken(sessionToken);

		if (!tokenData) {
			throw new GameServiceError(ERRORS.INTERNAL_ERROR, "Invalid token");
		}

		try {

			const session = await this.getSession(sessionToken);

			await Promise.all([
				submitLeaderboardScore(this.redisClient, tokenData.displayName, sessionToken, session.sequence.length),
				this.deleteSession(sessionToken)
			]);

			return {
				displayName: tokenData.displayName,
				score: session.sequence.length
			};

		} catch {
			throw new GameServiceError(ERRORS.INTERNAL_ERROR, "Failed to submit score");
		}

	}

	public getLeaderboard = async (): Promise<GameScore[]> => getTop10Scores(this.redisClient);

}

// Simple helper function to generate the Redis key for a session
const sessionKey = (token: string) => `session:${token}`;