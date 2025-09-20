import { useQuery } from "@tanstack/react-query";
import { useGameClient } from "./useGameClient";

export function useLeaderBoard() {
	const gameClient = useGameClient();
	return useQuery({
		queryKey: ["leaderboard"], queryFn: async () => {
			return gameClient.getLeaderboard();
		}
	});
}