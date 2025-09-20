import { useGameState } from "./useGameState";

export function useHasGameStarted() {
	return !!useGameState();
}