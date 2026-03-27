import { Color, PieceSymbol, Square } from 'chess.js'
import { useState } from 'react';


export const ChessBoard = ({ board , socket}: {
    board: ({
        square: Square;
        type: PieceSymbol;
        color: Color;
    } | null)[][];
    socket: WebSocket;
}) => {
    const [from , setFrom] = useState(null);
    const [to, setTo] = useState(null)
    return <div className='text-white-200'>
        {board.map((row, i) => {
            return <div key={i} className='flex'>
                {row.map((square,j) => {
                return <div onClick={() => {
                    if (!from) {
                        setFrom(square);
                    }else{
                        setTo(square);
                        socket.send(JSON.stringify({
                            type:"move",
                            payload: {
                                from: from.square,
                                to: square.square
                            }
                        }))
                    }
                }} key={j} className={`w-16 h-16 ${(i + j) % 2 === 0 ? 'bg-green-500' :
                    'bg-white'}`}>
                        <div className='w-full justify-center flex h-full'>
                            <div className='h-full justify-center flex flex-col'>
                                {square ? square.type : ""}
                            </div>
                        </div>
                </div>
        })}
            </div>
        })}
    </div>
}

