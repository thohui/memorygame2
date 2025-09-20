import { useContext } from "react";
import { GameClientContext } from "../contexts/GameClientContext";

export function useGameClient() {

	const ctx = useContext(GameClientContext);

	if (!ctx) {
		throw new Error("GameClientContext is not initialized");
	}

	return ctx;

}