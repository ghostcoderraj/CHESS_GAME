export const INIT_GAME = "init_game"
export const MOVE = "move";
export const GAME_OVER = "game_over"

export type PlayerColor = "white" | "black";

export interface MovePayload {
  from: string;
  to: string;
  promotion?: "q" | "r" | "b" | "n";
}