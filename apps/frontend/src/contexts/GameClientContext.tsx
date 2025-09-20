import React from "react";
import { GameClient } from "../lib/client";

export const GameClientContext = React.createContext<GameClient | null>(null);

interface Props {
	gameClient: GameClient;
	children: React.ReactNode;
}

export function GameClientProvider({ children, gameClient }: Props) {
	return (
		<GameClientContext.Provider value={gameClient}>
			{children}
		</GameClientContext.Provider>
	);
}