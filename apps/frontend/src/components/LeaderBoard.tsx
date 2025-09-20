import { useLeaderBoard } from "../hooks/useLeaderBoard";

export function LeaderBoard() {
	const { data } = useLeaderBoard();
	return (
		<div className="bg-gray-800  rounded-lg p-4">
			<h2 className="text-white mb-3">Top levels achieved	</h2>
			<div className="space-y-2 text-sm">
				{data?.scores?.map((score) => (
					<LeaderBoardEntry
						key={score.displayName + score.score}
						displayName={score.displayName}
						score={score.score}
					/>
				)
				)}
			</div>
		</div>
	);
}

interface LeaderBoardEntryProps {
	displayName: string;
	score: number;
}

function LeaderBoardEntry({ displayName, score }: LeaderBoardEntryProps) {
	return (
		<div className="flex justify-between text-white">
			<span>{displayName}</span>
			<span>{score}</span>
		</div>
	);
}