import { ChessBoard } from "@/components/ChessBoard"

export const Game = () => {
    return <div className="justify-center flex">
        <div className="pt-8 max-w-screen-lg">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="col-span-4 bg-red-200 w-full">
                    <ChessBoard/>
                </div>
                <div className="col-span-2 bg-green-20 w-full">
                    <button onClick={()=> {
                        navigate("/game")
                    }}>Play</button>
                </div>
            </div>
        </div>
    </div>
}