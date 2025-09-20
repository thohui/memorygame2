import { useSyncExternalStore } from "react";
import { useGameClient } from "./useGameClient";

export function useGameState() {

	const gameClient = useGameClient();

	const subscribe = (onStoreChange: () => void) => {
		gameClient.addEventListener("GAME_STARTED", onStoreChange);
		gameClient.addEventListener("LEVEL_UP", onStoreChange);
		gameClient.addEventListener("GAME_ENDED", onStoreChange);
		return () => {
			gameClient.removeEventListener("GAME_STARTED", onStoreChange);
			gameClient.removeEventListener("LEVEL_UP", onStoreChange);
			gameClient.removeEventListener("GAME_ENDED", onStoreChange);
		};
	};

	return useSyncExternalStore(subscribe, () => gameClient.currentGameState);

}