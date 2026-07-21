"use client";

import { Crown, CheckCircle2, XCircle } from "lucide-react";
import type { MovePairRow } from "@/lib/chessUtils";

export type PuzzleStatus = "playing" | "correct" | "wrong" | "solved";

export default function PuzzleMoveList({
  movePairs,
  status,
  sideToMove,
  onHint,
  onShowSolution,
  onNextPuzzle,
}: {
  movePairs: MovePairRow[];
  status: PuzzleStatus;
  sideToMove: "w" | "b";
  onHint: () => void;
  onShowSolution: () => void;
  onNextPuzzle?: () => void;
}) {
  const lastPairIndex = movePairs.length - 1;

  return (
    <div className="flex flex-col gap-3">
      <div className="card flex-1 overflow-hidden flex flex-col">
        <div className="overflow-y-auto max-h-[280px] text-[13px]">
          {movePairs.map((pair, i) => {
            const isLastPair = i === lastPairIndex;
            const highlightBlack = isLastPair && pair.black !== undefined;
            const highlightWhite = isLastPair && !highlightBlack;
            return (
              <div key={i} className="grid grid-cols-[32px_1fr_1fr] px-3 py-1.5 odd:bg-white/[0.02]">
                <span className="text-text-muted">{pair.number}.</span>
                <span className={`font-mono ${highlightWhite ? "text-accent font-semibold" : "text-text-strong"}`}>{pair.white}</span>
                <span className={`font-mono ${highlightBlack ? "text-accent font-semibold" : "text-text-strong"}`}>{pair.black ?? ""}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card p-3">
        {status === "playing" && (
          <div className="flex items-center gap-2.5">
            <Crown size={20} className="text-accent shrink-0" />
            <div>
              <div className="text-[14px] text-text-strong font-semibold">Your turn</div>
              <div className="text-[12px] text-text-muted">Find the best move for {sideToMove === "w" ? "white" : "black"}.</div>
            </div>
          </div>
        )}
        {status === "correct" && (
          <div className="flex items-center gap-2.5">
            <CheckCircle2 size={20} className="text-accent shrink-0" />
            <div className="text-[14px] text-accent font-semibold">Good move, keep going!</div>
          </div>
        )}
        {status === "wrong" && (
          <div className="flex items-center gap-2.5">
            <XCircle size={20} className="text-danger shrink-0" />
            <div className="text-[14px] text-danger font-semibold">That&apos;s not it, try again.</div>
          </div>
        )}
        {status === "solved" && (
          <div className="flex items-center gap-2.5">
            <CheckCircle2 size={20} className="text-accent shrink-0" />
            <div className="text-[14px] text-accent font-semibold">Puzzle solved!</div>
          </div>
        )}

        <div className="flex gap-4 mt-3 text-[13px]">
          {status !== "solved" && (
            <>
              <button onClick={onHint} className="text-blue hover:underline">Get a hint</button>
              <button onClick={onShowSolution} className="text-blue hover:underline">View the solution</button>
            </>
          )}
          {status === "solved" && onNextPuzzle && (
            <button onClick={onNextPuzzle} className="btn-primary text-[13px] !py-1.5 !px-3">Next puzzle</button>
          )}
        </div>
      </div>
    </div>
  );
}