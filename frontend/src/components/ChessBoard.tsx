import { Color, PieceSymbol, Square } from "chess.js";
import { useState } from "react";
import { MOVE } from "@/lib/messages";

type BoardSquare = {
  square: Square;
  type: PieceSymbol;
  color: Color;
} | null;

const PIECE_TO_UNICODE: Record<Color, Record<PieceSymbol, string>> = {
  w: {
    p: "♙",
    r: "♖",
    n: "♘",
    b: "♗",
    q: "♕",
    k: "♔",
  },
  b: {
    p: "♟",
    r: "♜",
    n: "♞",
    b: "♝",
    q: "♛",
    k: "♚",
  },
};

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;

const coordinatesToSquare = (row: number, col: number): Square => {
  const file = FILES[col];
  const rank = 8 - row;
  return `${file}${rank}` as Square;
};

export const ChessBoard = ({
  board,
  socket,
  canMove,
}: {
  board: BoardSquare[][];
  socket: WebSocket;
  canMove: boolean;
}) => {
  const [from, setFrom] = useState<null | Square>(null);

  const sendMove = (fromSquare: Square, toSquare: Square) => {
    socket.send(
      JSON.stringify({
        type: MOVE,
        payload: {
          from: fromSquare,
          to: toSquare,
        },
      })
    );
  };

  return (
    <div className="inline-block border-2 border-slate-700">
      {board.map((row, i) => {
        return (
          <div key={i} className="flex">
            {row.map((square, j) => {
              const squareColor = (i + j) % 2 === 0 ? "bg-green-500" : "bg-slate-100";
              const isSelected = from === square?.square;
              return (
                <button
                  type="button"
                  onClick={() => {
                    if (!canMove) {
                      return;
                    }
                    const clickedSquare = coordinatesToSquare(i, j);
                    if (!from) {
                      if (!square) {
                        return;
                      }
                      setFrom(clickedSquare);
                      return;
                    }
                    if (from === clickedSquare) {
                      setFrom(null);
                      return;
                    }
                    sendMove(from, clickedSquare);
                    setFrom(null);
                  }}
                  key={j}
                  className={`w-12 h-12 md:w-16 md:h-16 ${squareColor} ${
                    isSelected ? "ring-4 ring-yellow-300" : ""
                  }`}
                >
                  <div className="w-full h-full flex items-center justify-center text-2xl md:text-4xl">
                    {square ? PIECE_TO_UNICODE[square.color][square.type] : ""}
                  </div>
                </button>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

