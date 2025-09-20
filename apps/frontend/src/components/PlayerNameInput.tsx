import React from "react";
import { useGameClient } from "../hooks/useGameClient";
import { useHasGameStarted } from "../hooks/useHasGameStarted";

export function PlayerNameInput() {

	// TODO: Add validation for name input and perhaps move to a form library.
	const [name, setName] = React.useState("Anonymous");
	const gameClient = useGameClient();

	const gameStarted = useHasGameStarted();

	const handleSubmit = () => {
		gameClient.startGame(name);
	};

	return (
		<div className="bg-gray-800 rounded-lg p-6 text-center">
			<h2 className="text-white mb-4">Enter Your Name</h2>

			<div className="mb-4">
				<input
					type="text"
					value={name}
					onChange={(e) => setName(e.target.value)}
					placeholder="Your display name"
					className="px-3 py-2 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:bg-gray-600"
					maxLength={20}
				/>
			</div>
			<button
				className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				onClick={handleSubmit}
				disabled={gameStarted}
			>
				Start Game
			</button>
		</div>
	);
}