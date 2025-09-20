interface Props {
	active?: boolean;
	disabled?: boolean;
	onClick?: () => void;
}

export function GameTile({ active, onClick }: Props) {
	return (
		<button
			onClick={onClick}
			className={`
            aspect-square rounded transition-all duration-200
            ${active
					? "bg-blue-500"
					: "bg-gray-600 hover:bg-gray-500"
				}
          `}
		/>
	);
}