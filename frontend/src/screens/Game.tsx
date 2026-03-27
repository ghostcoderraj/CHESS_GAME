import { Button } from "@/components/Button";
import { ChessBoard } from "@/components/ChessBoard"
import { useSocket } from "@/hooks/useSocket";
import { useEffect , useState } from "react";
import { Chess, Color } from "chess.js";
import { GAME_OVER, INIT_GAME, MOVE } from "@/lib/messages";

export const Game = () => {
    const socket = useSocket();
    const [chess, setChess] = useState(new Chess());
    const [board , setBoard] = useState(chess.board());
    const [playerColor, setPlayerColor] = useState<Color | null>(null);
    const [status, setStatus] = useState("Click Play to find an opponent.");
    const [hasStarted, setHasStarted] = useState(false);
    const [gameOverMessage, setGameOverMessage] = useState<string | null>(null);


    useEffect(() => {
        if (!socket) {
            return;
        }
        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            console.log(message);
            switch (message.type) {
                case INIT_GAME:
                    {
                        const newChess = new Chess();
                        setChess(newChess);
                        setBoard(newChess.board());
                        setHasStarted(true);
                        setGameOverMessage(null);
                        const color = message.payload?.color === "black" ? "b" : "w";
                        setPlayerColor(color);
                        setStatus(
                            `Game started. You are ${color === "w" ? "White" : "Black"}.`
                        );
                    }
                    break;
                case MOVE:
                    {
                        const newChess = new Chess();
                        if (message.payload?.fen) {
                            newChess.load(message.payload.fen);
                        } else {
                            break;
                        }
                        setChess(newChess);
                        setBoard(newChess.board());
                        const turnText = newChess.turn() === "w" ? "White" : "Black";
                        setStatus(`Turn: ${turnText}`);
                    }
                    break;
                case GAME_OVER:
                    {
                        const winner = message.payload?.winner;
                        const reason = message.payload?.reason;
                        if (winner === "draw") {
                            setGameOverMessage("Game over: Draw");
                        } else if (winner === "white" || winner === "black") {
                            setGameOverMessage(`Game over: ${winner} wins`);
                        } else if (reason === "opponent_disconnected") {
                            setGameOverMessage("Game over: Opponent disconnected");
                        } else {
                            setGameOverMessage("Game over");
                        }
                        setStatus("Match ended. Click Play to start again.");
                        setHasStarted(false);
                    }
                    break;
                
            }
        }
    },[socket])

    if(!socket) return <div>Connecting............</div>

    const canMove = hasStarted && !gameOverMessage && (
      (playerColor === "w" && chess.turn() === "w") ||
      (playerColor === "b" && chess.turn() === "b")
    );


    return <div className="justify-center flex">
        <div className="pt-8 max-w-screen-lg">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="col-span-4 w-full flex justify-center">
                    <ChessBoard socket = {socket} board= {board} canMove={canMove}/>
                </div>
                <div className="col-span-2 bg-slate-900 text-white rounded p-6 w-full flex justify-center">
                    <div className="pt-4 text-center">
                        <p className="mb-3">{status}</p>
                        <p className="mb-3">
                            You: {playerColor ? (playerColor === "w" ? "White" : "Black") : "Not assigned"}
                        </p>
                        {gameOverMessage ? <p className="mb-4 text-yellow-300">{gameOverMessage}</p> : null}
                        <Button onClick={()=> {
                            socket.send(JSON.stringify({
                                type: INIT_GAME
                            }))
                            setStatus("Waiting for opponent...");
                            setGameOverMessage(null);
                        }}>Play</Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
}