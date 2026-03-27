import { Chess } from "chess.js";
import { WebSocket } from "ws";
import { GAME_OVER, INIT_GAME, MOVE, MovePayload } from "./message";

export class Game {
    public player1: WebSocket;
    public player2: WebSocket;
    private board: Chess;
    private startTime: Date;
    private isFinished = false;

    constructor(player1: WebSocket , player2: WebSocket){
        this.player1 = player1;
        this.player2 = player2
        this.board = new Chess();
        this.startTime = new Date();
        this.player1.send(JSON.stringify({
            type:INIT_GAME,
            payload:{
                color:"white"
            }
        }))
        this.player2.send(JSON.stringify({
            type:INIT_GAME,
            payload: {
                color : "black"
            }
        }))
    }

    hasPlayer(socket: WebSocket) {
        return this.player1 === socket || this.player2 === socket;
    }

    getOpponent(socket: WebSocket) {
        if (socket === this.player1) {
            return this.player2;
        }
        if (socket === this.player2) {
            return this.player1;
        }
        return null;
    }

    makeMove(socket: WebSocket, move: MovePayload) {
        if (this.isFinished) {
            return;
        }

        const turn = this.board.turn();
        if (turn === "w" && socket !== this.player1) {
            return;
        }
        if (turn === "b" && socket !== this.player2) {
            return;
        }

        let appliedMove;
        try {
            appliedMove = this.board.move(move);
        } catch (error) {
            console.log("Invalid move", error);
            return;
        }

        if (!appliedMove) {
            return;
        }

        const payload = {
            move: appliedMove,
            fen: this.board.fen(),
            turn: this.board.turn(),
            isGameOver: this.board.isGameOver(),
        };

        this.player1.send(
            JSON.stringify({
                type: MOVE,
                payload,
            })
        );
        this.player2.send(
            JSON.stringify({
                type: MOVE,
                payload,
            })
        );

        if (this.board.isGameOver()) {
            this.isFinished = true;
            const winner = this.board.isCheckmate()
                ? this.board.turn() === "w"
                    ? "black"
                    : "white"
                : "draw";
            this.player1.send(
                JSON.stringify({
                    type: GAME_OVER,
                    payload: {
                        winner,
                        fen: this.board.fen(),
                    },
                })
            );
            this.player2.send(
                JSON.stringify({
                    type: GAME_OVER,
                    payload: {
                        winner,
                        fen: this.board.fen(),
                    },
                })
            );
        }
    }

    endGameByDisconnect(disconnectedSocket: WebSocket) {
        if (this.isFinished) {
            return;
        }
        const opponent = this.getOpponent(disconnectedSocket);
        this.isFinished = true;
        if (opponent) {
            opponent.send(
                JSON.stringify({
                    type: GAME_OVER,
                    payload: {
                        winner: opponent === this.player1 ? "white" : "black",
                        reason: "opponent_disconnected",
                    },
                })
            );
        }
    }
}