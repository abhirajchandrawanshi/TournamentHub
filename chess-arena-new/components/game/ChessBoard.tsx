"use client";

import { useMemo } from "react";

export default function ChessBoard() {
    const boardRows = useMemo(
        () => [
            ["♜", "♞", "♝", "♛", "♚", "♝", "♞", "♜"],
            ["♟", "♟", "♟", "♟", "♟", "♟", "♟", "♟"],
            ["", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", ""],
            ["♙", "♙", "♙", "♙", "♙", "♙", "♙", "♙"],
            ["♖", "♘", "♗", "♕", "♔", "♗", "♘", "♖"],
        ],
        []
    );

    return (
        <div className="mx-auto w-full max-w-[840px] rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(250,204,21,0.15),_transparent_55%)] p-3 shadow-[0_25px_80px_rgba(0,0,0,0.35)] sm:p-4">
            <div className="overflow-hidden rounded-[22px] border border-white/10 bg-[#0f172a] p-2 shadow-inner shadow-black/30">
                <div className="grid aspect-square w-full grid-cols-8 overflow-hidden rounded-[16px] border border-white/10 bg-[#2f4b3e]">
                    {boardRows.flat().map((cell, index) => (
                        <div
                            key={`${cell}-${index}`}
                            className={`flex aspect-square items-center justify-center text-2xl font-medium sm:text-3xl lg:text-4xl ${(Math.floor(index / 8) + index) % 2 === 0 ? "bg-[#e6e6d5] text-[#0f172a]" : "bg-[#2f4b3e] text-[#f8fafc]"
                                }`}
                        >
                            {cell}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}