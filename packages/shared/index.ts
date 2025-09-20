export interface NextLevelResponse {
	level: number;
	step: number;
	sequenceLength: number;
}

export interface StartGameResponse {
	token: string;
	level: number;
	step: number;
	sequenceLength: number;
}

export interface LeaderboardResponse {
	scores: { displayName: string; score: number; }[];
}