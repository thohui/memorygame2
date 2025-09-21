export interface GameSession {
	token: string;
	level: number;
	sequence: number[];
}

export interface GameScore {
	displayName: string;
	score: number;
}

export interface LevelUp {
	level: number;
	step: number;
}

export interface ewSameState {
	level: number;
	sequence: number[];
}

export interface TokenData {
	displayName: string;
}


export const ERRORS = {
	GAME_OVER: "GAME_OVER",
	UNAUTHORIZED: "UNAUTHORIZED",
	INTERNAL_ERROR: "INTERNAL_ERROR"
};

export type ErrorType = typeof ERRORS[keyof typeof ERRORS];

export interface ErrorPayload {
	type: ErrorType,
	error: string;
}


export function createErrorPayload(type: ErrorType, message: string): ErrorPayload {
	return {
		type,
		error: message
	};
}

export class GameServiceError extends Error {

	private errorType: ErrorType;

	constructor(errorType: ErrorType, message: string) {
		super(message);
		this.errorType = errorType;
	}

	public toPayload(): ErrorPayload {
		return createErrorPayload(
			this.errorType,
			this.message
		);

	}

}