import { GameState } from ".";

export interface GameEvent {
	GAME_STARTED: GameState;
	LEVEL_UP: GameState;
	GAME_ENDED: { score: number | null; };
}

export type GameEventListener<T extends GameEventType> = (payload: GameEvent[T]) => void;
export type GameEventType = keyof GameEvent;

export class GameEventBus {

	private listeners: Map<GameEventType, GameEventListener<any>[]> = new Map();

	public on<T extends GameEventType>(event: T, listener: GameEventListener<T>) {
		if (!this.listeners.has(event)) {
			this.listeners.set(event, []);
		}
		this.listeners.get(event)!.push(listener);
	}

	public off<T extends GameEventType>(event: T, listener: GameEventListener<T>) {
		if (!this.listeners.has(event)) return;
		const listeners = this.listeners.get(event)!.filter(l => l !== listener);
		this.listeners.set(event, listeners);
	}


	public emit<T extends GameEventType>(event: T, payload: GameEvent[T]) {
		if (!this.listeners.has(event)) return;
		for (const listener of this.listeners.get(event)!) {
			listener(payload);
		}
	}

}