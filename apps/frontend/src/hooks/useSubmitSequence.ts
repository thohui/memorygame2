import { useMutation } from "@tanstack/react-query";
import { useGameClient } from "./useGameClient";

export function useSubmitSequence() {
	const gameClient = useGameClient();
	return useMutation({ mutationFn: (sequence: number[]) => gameClient.submitSequence(sequence) });
}