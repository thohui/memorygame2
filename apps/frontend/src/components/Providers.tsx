import { GameClientProvider } from "../contexts/GameClientContext";
import { GameClient } from "../lib/client";

interface Props {
	children: React.ReactNode;
}

const gameClient = new GameClient("http://localhost:3000");

export function Providers({ children }: Props) {
	return (
		<GameClientProvider gameClient={gameClient}>
			{children}
		</GameClientProvider>
	);
}