export interface GameSession {
	token: string;
	level: number;
	sequence: number[];
}

export interface GameScore {
	displayName: string;
	score: number;
}

export interface TokenData {
	displayName: string;
}