import React, { useEffect, useState } from "react";
import { useGameClient } from "../hooks/useGameClient";
import { useGameState } from "../hooks/useGameState";
import { GameState } from "../lib/client";
import { GameTile } from "./GameTile";

export function GameGrid() {

	const [activeTile, setActiveTile] = React.useState<number | null>(null);

	const gameClient = useGameClient();

	// Animate the sequence when the game state changes
	useEffect(() => {

		const timeoutIds: number[] = [];

		const initialDelay = 500;

		const handleGameUpdate = (data: GameState) => {

			timeoutIds.push(setTimeout(() => {

				const sequence = data.sequence;

				for (let i = 0; i < sequence.length; i++) {

					const tileId = sequence[i];

					setTimeout(() => {
						setActiveTile(tileId);

						// Deactivate tile after short delay
						timeoutIds.push(setTimeout(() => {
							setActiveTile(null);
						}, 500));

					}, i * 1000);

				};

			}, initialDelay));

		};

		gameClient.addEventListener("LEVEL_UP", handleGameUpdate);
		gameClient.addEventListener("GAME_STARTED", handleGameUpdate);

		return () => {
			gameClient.removeEventListener("LEVEL_UP", handleGameUpdate);
			gameClient.removeEventListener("GAME_STARTED", handleGameUpdate);

			timeoutIds.forEach(id => clearTimeout(id));

		};

	}, [setActiveTile, gameClient]);


	const gameState = useGameState();
	const [userSequences, setUserSequences] = useState<number[]>([]);

	useEffect(() => {

	}, [gameState]);

	const handleUserClick = async (id: number) => {

		// Sanity check
		if (!gameState) return;

		// Ignore clicks during animation
		if (activeTile !== null) return;

		const newSequence = [...userSequences, id];
		setUserSequences(newSequence);

		const handleInputError = () => {
			alert("Game Over! Your score: " + gameState.level);
			setUserSequences([]);
		};


		// Check if the new sequence matches the game sequence so far
		for (let i = 0; i < newSequence.length; i++) {
			if (newSequence[i] !== gameState.sequence[i]) {
				handleInputError();
				await gameClient.endGame();
				return;
			}
		}

		// If the sequence length matches the game sequence length, submit it
		if (newSequence.length === gameState.sequence.length) {
			try {
				await gameClient.submitSequence(newSequence);
				setUserSequences([]);
			} catch {
				handleInputError();
			}
		}

	};


	return (
		<div className="grid grid-cols-3 gap-2 w-48 mx-auto mb-4">
			{Array.from({ length: 9 }, (_, i) => {
				const id = i + 1;
				return (
					<GameTile
						key={id}
						active={activeTile === id}
						onClick={() => handleUserClick(id)}
					/>
				);
			})}
		</div>
	);

}