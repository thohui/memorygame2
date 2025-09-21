import { RedisClientType } from "@redis/client";
import { GameScore } from "./types";

const KEY_PREFIX = "lb:";
const LEADERBOARD_KEY = KEY_PREFIX + "global";
const LEADERBOARD_META_KEY = KEY_PREFIX + "meta";

/** Attempt to submit the score to the top 10 leaderboard. */
export async function submitLeaderboardScore(redis: RedisClientType, displayName: string, token: string, score: number) {

	const top10 = await redis.zRangeWithScores(LEADERBOARD_KEY, 0, 10 - 1, { REV: true });

	// Just add the score if there are less than 10 scores
	if (top10.length < 10) {
		await Promise.all([
			redis.zAdd(LEADERBOARD_KEY, [{ score: score, value: token }]),
			redis.hSet(LEADERBOARD_META_KEY, token, displayName)
		]);
	}

	// Only add the score if it is higher than the lowest score in the top 10
	else if (score >= top10[top10.length - 1].score) {
		await Promise.all([
			redis.zAdd(LEADERBOARD_KEY, [{ score: score, value: token }]),
			redis.hSet(LEADERBOARD_META_KEY, token, displayName)
		]);
	}

}

export async function getTop10Scores(redis: RedisClientType): Promise<GameScore[]> {

	// todo: optimize by using a redis pipeline

	const top10 = redis.zRangeWithScores(LEADERBOARD_KEY, 0, 10 - 1, { REV: true });

	const results: GameScore[] = [];

	for (const entry of await top10) {

		const displayName = await redis.hGet(LEADERBOARD_META_KEY, entry.value);

		results.push({
			displayName: displayName || "Unknown",
			score: entry.score
		});

	}

	return results;

}
