"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Chess } from "chess.js";
import ChessBoard from "@/components/ChessBoard";
import PuzzleMoveList, { type PuzzleStatus } from "@/components/PuzzleMoveList";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { boardToPosition, buildMovePairs, legalTargetsFrom } from "@/lib/chessUtils";
import { PUZZLES, type Puzzle } from "@/lib/puzzles";

function PuzzleInfoPanel({ puzzle, ratingRevealed }: { puzzle: Puzzle; ratingRevealed: boolean }) {
  return (
    <section className="rounded-lg border border-border bg-surface p-3 text-text">
      <div className="text-sm font-semibold">Puzzle Info</div>
      <div className="mt-2 text-sm">ID: {puzzle.id}</div>
      <div className="text-sm">Status: {ratingRevealed ? "Rating revealed" : "Rating hidden"}</div>
    </section>
  );
}

function uciToMove(uci: string) {
  return { from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci.length > 4 ? uci.slice(4) : undefined };
}

export default function PuzzlePage() {
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const puzzle: Puzzle = PUZZLES[puzzleIndex];

  const chessRef = useRef(new Chess(puzzle.fen));
  const [position, setPosition] = useState(() => boardToPosition(chessRef.current));
  const [selected, setSelected] = useState<string | null>(null);
  const [legalTargets, setLegalTargets] = useState<string[]>([]);
  const [lastMove, setLastMove] = useState<[string, string] | null>(null);
  const [hintSquare, setHintSquare] = useState<string | null>(null);
  const [solutionStep, setSolutionStep] = useState(0);
  const [status, setStatus] = useState<PuzzleStatus>("playing");
  const [sanHistory, setSanHistory] = useState<string[]>([]);

  const loadPuzzle = useCallback((index: number) => {
    const next = PUZZLES[index];
    chessRef.current = new Chess(next.fen);
    setPosition(boardToPosition(chessRef.current));
    setSelected(null);
    setLegalTargets([]);
    setLastMove(null);
    setHintSquare(null);
    setSolutionStep(0);
    setStatus("playing");
    setSanHistory([]);
  }, []);

  useEffect(() => {
    loadPuzzle(puzzleIndex);
  }, [puzzleIndex, loadPuzzle]);

  function playUci(uci: string) {
    const { from, to, promotion } = uciToMove(uci);
    const chess = chessRef.current;
    const move = chess.move({ from, to, promotion: promotion ?? "q" });
    if (!move) return null;
    setPosition(boardToPosition(chess));
    setLastMove([from, to]);
    setSanHistory((h) => [...h, move.san]);
    return move;
  }

  function playOpponentReplyIfAny(nextStep: number) {
    const reply = puzzle.solution[nextStep];
    if (!reply) { setStatus("solved"); return; }
    setTimeout(() => {
      playUci(reply);
      const afterStep = nextStep + 1;
      setSolutionStep(afterStep);
      setStatus(afterStep >= puzzle.solution.length ? "solved" : "playing");
    }, 450);
  }

  function handleSquareClick(square: string) {
    if (status === "solved") return;
    const chess = chessRef.current;
    const piece = position[square];

    if (!selected) {
      if (piece && piece[0] === chess.turn()) {
        setSelected(square);
        setLegalTargets(legalTargetsFrom(chess, square));
      }
      return;
    }

    if (square === selected) { setSelected(null); setLegalTargets([]); return; }

    if (piece && piece[0] === chess.turn()) {
      setSelected(square);
      setLegalTargets(legalTargetsFrom(chess, square));
      return;
    }

    if (!legalTargets.includes(square)) { setSelected(null); setLegalTargets([]); return; }

    const expected = puzzle.solution[solutionStep];
    const pawnPromoting = piece === `${chess.turn()}P` && (square[1] === "1" || square[1] === "8");
    const attemptedUci = `${selected}${square}${pawnPromoting ? "q" : ""}`;

    setSelected(null);
    setLegalTargets([]);

    if (attemptedUci.slice(0, 4) === expected.slice(0, 4)) {
      playUci(expected);
      const nextStep = solutionStep + 1;
      setStatus("correct");
      setSolutionStep(nextStep);
      playOpponentReplyIfAny(nextStep);
    } else {
      setStatus("wrong");
      setTimeout(() => setStatus("playing"), 900);
    }
  }

  function handleHint() {
    const expected = puzzle.solution[solutionStep];
    if (!expected) return;
    setHintSquare(expected.slice(0, 2));
    setTimeout(() => setHintSquare(null), 1500);
  }

  function handleShowSolution() {
    let step = solutionStep;
    function playNext() {
      const uci = puzzle.solution[step];
      if (!uci) { setStatus("solved"); return; }
      playUci(uci);
      step += 1;
      setSolutionStep(step);
      setTimeout(playNext, 600);
    }
    playNext();
  }

  function handleNextPuzzle() {
    setPuzzleIndex((i) => (i + 1) % PUZZLES.length);
  }

  const movePairs = buildMovePairs(puzzle.fen, sanHistory);

  return (
    <main className="flex-1 bg-bg">
      <div className="max-w-[1000px] mx-auto px-3 py-4 grid grid-cols-1 lg:grid-cols-[220px_minmax(0,480px)_280px] gap-4 justify-center">
        <div className="hidden lg:block">
          <PuzzleInfoPanel puzzle={puzzle} ratingRevealed={status === "solved"} />
        </div>

        <div className="flex flex-col gap-2 items-center">
          <div className="flex justify-between w-full max-w-[480px]">
            <span className="label-eyebrow">Puzzle #{puzzle.id}</span>
            <ThemeSwitcher />
          </div>
          <ChessBoard
            size={480}
            position={position}
            interactive
            orientation={puzzle.toMove === "w" ? "white" : "black"}
            selectedSquare={selected}
            legalTargets={legalTargets}
            lastMove={lastMove}
            hintSquare={hintSquare}
            onSquareClick={handleSquareClick}
          />
          <div className="lg:hidden w-full max-w-[480px]">
            <PuzzleInfoPanel puzzle={puzzle} ratingRevealed={status === "solved"} />
          </div>
        </div>

        <PuzzleMoveList
          movePairs={movePairs}
          status={status}
          sideToMove={chessRef.current.turn()}
          onHint={handleHint}
          onShowSolution={handleShowSolution}
          onNextPuzzle={handleNextPuzzle}
        />
      </div>
    </main>
  );
}