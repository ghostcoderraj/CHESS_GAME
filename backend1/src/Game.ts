import { Chess, Move } from "chess.js";
import { WebSocket } from "ws";
import { GAME_OVER, MOVE} from "./message";

export class Game {
    public player1: WebSocket;
    public player2: WebSocket;
    private board: Chess; 
    private startTime: Date;

    constructor(player1: WebSocket , player2: WebSocket){
        this.player1 = player1;
        this.player2 = player2
        this.board = new Chess();
        this.startTime = new Date();
    }

    makeMove(socket:WebSocket , move: {
        from:string;
        to:string
    }) {
        // validate the type of move using zod
        if(this.board.moves.length % 2 === 0 && socket !== this.player1) {
            return
        }
        if(this.board.moves.length % 2 === 1 && socket !== this.player2){
            return;
        }
        // validation here
        // Is it this users move
        // Is the move valid
        try{
        this.board.move(move)
        }catch(e){
            //
        }

        //update the board
        //push the move

        //check if the game is over
        if(this.board.isGameOver()){
            this.player1.emit(JSON.stringify({
                type:GAME_OVER,
                payload:{
                    winner:this.board.turn() === "w" ? "black" :"white"
                }
            }))
            return
        }

        if(this.board.moves.length % 2 === 0) {
            this.player2.emit(JSON.stringify({
                type:MOVE,
                payload:move
            }))
        }else {
            this.player1.emit(JSON.stringify({
                type:MOVE,
                payload:move
            }))
        }

        //Send the updated board to both players
    }
}