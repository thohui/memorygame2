import { LeaderboardResponse, NextLevelResponse, StartGameResponse } from "@memorygame/shared";
import axios, { AxiosInstance } from "axios";
import { GameEvent, GameEventBus } from "./event-bus";

export class GameClient {

	private fetcher: AxiosInstance;

	private sessionToken: string | null = null;
	private gameState: GameState | null = null;

	private events: GameEventBus = new GameEventBus();

	constructor(baseUrl: string) {
		this.fetcher = axios.create({ baseURL: baseUrl });
	}

	public async getLeaderboard(): Promise<LeaderboardResponse> {
		const resp = await this.fetcher.get<LeaderboardResponse>("/game/leaderboard");
		return resp.data;
	}

	public async endGame() {

		let score: number | null = null;

		if (!this.sessionToken) {
			throw new Error("No active game session. Please start a game first.");
		}

		try {

			const resp = await this.fetcher.post<{ score: number; }>("/game/end", {}, {
				headers: {
					"Authorization": this.sessionToken
				}
			});

			score = resp.data.score;

		} catch { }

		finally {
			this.sessionToken = null;
			this.gameState = null;
			this.events.emit("GAME_ENDED", { score });
		}

		return score;

	}

	public async submitSequence(sequence: number[]) {

		if (!this.sessionToken) {
			throw new Error("No active game session. Please start a game first.");
		}

		const resp = await this.fetcher.post<NextLevelResponse>("/game/next", { sequence }, {
			headers: {
				"Authorization": this.sessionToken
			}
		});


		const currentSequence = this.gameState?.sequence || [];
		currentSequence.push(resp.data.step);

		console.log(currentSequence);

		this.gameState = { level: resp.data.level, sequence: currentSequence, sequenceLength: resp.data.sequenceLength };
		this.events.emit("LEVEL_UP", this.gameState);

	}

	public async startGame(displayName: string): Promise<void> {
		const resp = await this.fetcher.post<StartGameResponse>("/game/start", { displayName: displayName });
		this.sessionToken = resp.data.token;
		this.gameState = { level: resp.data.level, sequence: [resp.data.step], sequenceLength: resp.data.sequenceLength };
		this.events.emit("GAME_STARTED", this.gameState);
	}

	public addEventListener<T extends keyof GameEvent>(event: T, listener: (payload: GameEvent[T]) => void) {
		this.events.on(event, listener);
	}

	public removeEventListener<T extends keyof GameEvent>(event: T, listener: (payload: GameEvent[T]) => void) {
		this.events.off(event, listener);
	}

	public get currentGameState(): GameState | null {
		return this.gameState;
	}

}


export interface GameState {
	level: number;
	sequence: number[];
	sequenceLength: number;
}
