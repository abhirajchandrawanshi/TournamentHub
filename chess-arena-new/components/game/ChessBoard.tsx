"use client";

import { useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";

export default function ChessBoard() {
    const [game, setGame] = useState(new Chess());

    function makeMove(from: string, to: string) {
        const gameCopy = new Chess(game.fen());

        const move = gameCopy.move({
            from,
            to,
            promotion: "q",
        });

        if (move === null) return false;

        setGame(gameCopy);

        return true;
    }

    return (
        <div className="bg-[#141922] p-4 rounded-2xl border border-gray-800">
            <Chessboard
                options={{
                    position: game.fen(),
                    onPieceDrop: ({ sourceSquare, targetSquare }) => {
                        return makeMove(sourceSquare, targetSquare ?? sourceSquare);
                    },
                    boardStyle: {
                        width: 650,
                    },
                }}
            />
        </div>
    );
}