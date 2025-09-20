import { GameGrid } from "./GameGrid";
import { GameInfo } from "./GameInfo";
import { GameMessage } from "./GameMessage";

export function GameBoard() {
	return (
		<div className="bg-gray-800 rounded-lg p-6">
			<GameInfo />
			<GameMessage />
			<GameGrid />
		</div>
	);
}