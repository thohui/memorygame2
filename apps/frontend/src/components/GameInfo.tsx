import { useGameState } from "../hooks/useGameState";

export function GameInfo() {
	const gameState = useGameState();
	return (
		<div className="flex justify-center gap-8 mb-4 text-white text-sm">
			<span>Level {gameState?.level ?? 1}</span>
		</div>
	);

}