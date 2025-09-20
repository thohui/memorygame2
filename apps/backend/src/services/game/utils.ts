const MAX_TILE_SIZE = 9;

export function generateRandomStep(): number {
	return Math.floor(Math.random() * 100) % MAX_TILE_SIZE;
}