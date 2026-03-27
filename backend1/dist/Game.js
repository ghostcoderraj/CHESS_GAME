"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const chess_js_1 = require("chess.js");
const message_1 = require("./message");
class Game {
    constructor(player1, player2) {
        this.isFinished = false;
        this.player1 = player1;
        this.player2 = player2;
        this.board = new chess_js_1.Chess();
        this.startTime = new Date();
        this.player1.send(JSON.stringify({
            type: message_1.INIT_GAME,
            payload: {
                color: "white"
            }
        }));
        this.player2.send(JSON.stringify({
            type: message_1.INIT_GAME,
            payload: {
                color: "black"
            }
        }));
    }
    hasPlayer(socket) {
        return this.player1 === socket || this.player2 === socket;
    }
    getOpponent(socket) {
        if (socket === this.player1) {
            return this.player2;
        }
        if (socket === this.player2) {
            return this.player1;
        }
        return null;
    }
    makeMove(socket, move) {
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
        }
        catch (error) {
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
        this.player1.send(JSON.stringify({
            type: message_1.MOVE,
            payload,
        }));
        this.player2.send(JSON.stringify({
            type: message_1.MOVE,
            payload,
        }));
        if (this.board.isGameOver()) {
            this.isFinished = true;
            const winner = this.board.isCheckmate()
                ? this.board.turn() === "w"
                    ? "black"
                    : "white"
                : "draw";
            this.player1.send(JSON.stringify({
                type: message_1.GAME_OVER,
                payload: {
                    winner,
                    fen: this.board.fen(),
                },
            }));
            this.player2.send(JSON.stringify({
                type: message_1.GAME_OVER,
                payload: {
                    winner,
                    fen: this.board.fen(),
                },
            }));
        }
    }
    endGameByDisconnect(disconnectedSocket) {
        if (this.isFinished) {
            return;
        }
        const opponent = this.getOpponent(disconnectedSocket);
        this.isFinished = true;
        if (opponent) {
            opponent.send(JSON.stringify({
                type: message_1.GAME_OVER,
                payload: {
                    winner: opponent === this.player1 ? "white" : "black",
                    reason: "opponent_disconnected",
                },
            }));
        }
    }
}
exports.Game = Game;
