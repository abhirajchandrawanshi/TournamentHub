"use client";

import { useState } from "react";
import ChessBoard from "@/components/ChessBoard";
import Link from "next/link";

interface Module {
  id: string;
  title: string;
  desc: string;
  fen: string;
  moves: string[];
  explanation: string;
}

const MODULES: Record<string, Module[]> = {
  basics: [
    {
      id: "pawn",
      title: "The Pawn",
      desc: "Pawns move forward 1 square (or 2 on their first move) and capture diagonally.",
      fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
      moves: ["e2 -> e4"],
      explanation: "Here White advanced the e-pawn two squares to e4. Pawns control diagonal squares ahead (d5 and f5)."
    },
    {
      id: "knight",
      title: "The Knight",
      desc: "Knights move in an 'L' shape (2 squares in one direction, 1 square perpendicular) and can leap over other pieces.",
      fen: "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
      moves: ["Nf3", "Nc6"],
      explanation: "Knights excel in closed positions. Nf3 controls key central squares d4 and e5."
    },
    {
      id: "castling",
      title: "Castling Rule",
      desc: "Castling protects your King and activates your Rook in a single special move.",
      fen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 b kq - 5 4",
      moves: ["O-O"],
      explanation: "White castled Kingside (O-O). The King moved to g1 and the Rook moved to f1."
    }
  ],
  openings: [
    {
      id: "ruy-lopez",
      title: "Ruy Lopez (Spanish Opening)",
      desc: "1.e4 e5 2.Nf3 Nc6 3.Bb5 - One of the oldest and most popular chess openings.",
      fen: "r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3",
      moves: ["1.e4 e5", "2.Nf3 Nc6", "3.Bb5"],
      explanation: "White puts pressure on Black's defender of the e5 pawn (the c6 Knight) while developing quickly."
    },
    {
      id: "sicilian",
      title: "Sicilian Defense",
      desc: "1.e4 c5 - The most aggressive counter-attack against 1.e4.",
      fen: "rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2",
      moves: ["1.e4 c5"],
      explanation: "Black fights for the d4 central square using an asymmetrical c-pawn, leading to dynamic tactical battles."
    }
  ],
  tactics: [
    {
      id: "fork",
      title: "The Knight Fork",
      desc: "Attacking two or more enemy pieces simultaneously with a single knight.",
      fen: "r1bqk2r/pppp1ppp/5N2/4p3/1b2P3/3P1N2/PPP2PPP/R2QKB1R b KQkq - 0 6",
      moves: ["Nf6+"],
      explanation: "The Knight on f6 attacks both the enemy King and Queen at the same time!"
    },
    {
      id: "pin",
      title: "The Absolute Pin",
      desc: "A piece cannot move because it would expose its King to check.",
      fen: "r1bqk1nr/pppp1ppp/2n5/4p3/1b2P3/3P1N2/PPP2PPP/RNBQKB1R w KQkq - 1 4",
      moves: ["Bb4"],
      explanation: "Black's Bishop pins White's c3 Knight or exposes check threats along the diagonal."
    }
  ],
  endgames: [
    {
      id: "king-rook",
      title: "King & Rook Mate",
      desc: "Cut off the enemy King to the edge of the board using your Rook and King in tandem.",
      fen: "8/8/8/4k3/8/8/4R3/4K3 b - - 0 1",
      moves: ["Re2+"],
      explanation: "The Rook delivers a check along the e-file, driving the black King toward the d-file edge."
    }
  ]
};

export default function LearnPage() {
  const [activeCategory, setActiveCategory] = useState<string>("basics");
  const [activeLessonIndex, setActiveLessonIndex] = useState<number>(0);

  const lessons = MODULES[activeCategory] || MODULES.basics;
  const currentLesson = lessons[activeLessonIndex] || lessons[0];

  return (
    <main className="flex-1 bg-bg">
      <div className="max-w-[1000px] mx-auto px-4 py-8">
        {/* Header */}
        <h1 className="text-[22px] font-semibold text-text-strong mb-1">Learn chess</h1>
        <p className="text-[13px] text-text-muted mb-6">
          ChessArena is a free, open platform. Practice at your own pace with lessons built for every level.
        </p>

        {/* 4 Category Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => { setActiveCategory("basics"); setActiveLessonIndex(0); }}
            className={`card p-4 text-left transition-all hover:border-accent ${
              activeCategory === "basics" ? "border-accent bg-accent/5" : ""
            }`}
          >
            <h3 className="text-[15px] font-semibold text-text-strong mb-1">Chess basics</h3>
            <p className="text-[13px] text-text-muted">
              Learn how each piece moves and the rules of the game.
            </p>
          </button>

          <button
            onClick={() => { setActiveCategory("openings"); setActiveLessonIndex(0); }}
            className={`card p-4 text-left transition-all hover:border-accent ${
              activeCategory === "openings" ? "border-accent bg-accent/5" : ""
            }`}
          >
            <h3 className="text-[15px] font-semibold text-text-strong mb-1">Openings</h3>
            <p className="text-[13px] text-text-muted">
              Explore the most common openings and their key ideas.
            </p>
          </button>

          <button
            onClick={() => { setActiveCategory("tactics"); setActiveLessonIndex(0); }}
            className={`card p-4 text-left transition-all hover:border-accent ${
              activeCategory === "tactics" ? "border-accent bg-accent/5" : ""
            }`}
          >
            <h3 className="text-[15px] font-semibold text-text-strong mb-1">Tactics</h3>
            <p className="text-[13px] text-text-muted">
              Practice pins, forks, skewers and combinations.
            </p>
          </button>

          <button
            onClick={() => { setActiveCategory("endgames"); setActiveLessonIndex(0); }}
            className={`card p-4 text-left transition-all hover:border-accent ${
              activeCategory === "endgames" ? "border-accent bg-accent/5" : ""
            }`}
          >
            <h3 className="text-[15px] font-semibold text-text-strong mb-1">Endgames</h3>
            <p className="text-[13px] text-text-muted">
              Master the fundamental endgame techniques.
            </p>
          </button>
        </div>

        {/* Interactive Lesson Workspace */}
        <div className="card p-5 mb-8">
          <div className="flex flex-col lg:flex-row gap-6 items-center lg:items-start">
            <div className="shrink-0">
              <ChessBoard size={380} showCoords />
            </div>

            <div className="flex-1 flex flex-col justify-between min-h-[380px]">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  {lessons.map((l, idx) => (
                    <button
                      key={l.id}
                      onClick={() => setActiveLessonIndex(idx)}
                      className={`text-[12px] px-3 py-1 rounded-sm border transition-colors ${
                        idx === activeLessonIndex
                          ? "bg-accent-soft border-accent text-accent font-semibold"
                          : "border-border text-text-muted hover:text-text-strong"
                      }`}
                    >
                      Lesson {idx + 1}: {l.title}
                    </button>
                  ))}
                </div>

                <h2 className="text-[18px] font-semibold text-text-strong mb-2">
                  {currentLesson.title}
                </h2>
                <p className="text-[13px] text-text mb-4">
                  {currentLesson.desc}
                </p>

                <div className="p-3 bg-bg-input border border-border-soft rounded-sm mb-4">
                  <span className="label-eyebrow block mb-1">Key Moves</span>
                  <div className="font-mono text-[14px] text-accent font-semibold">
                    {currentLesson.moves.join("  \u00b7  ")}
                  </div>
                </div>

                <div className="text-[13px] text-text-muted leading-relaxed">
                  {currentLesson.explanation}
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-border-soft">
                <button
                  disabled={activeLessonIndex === 0}
                  onClick={() => setActiveLessonIndex((prev) => Math.max(0, prev - 1))}
                  className="btn-outline text-[13px] disabled:opacity-40"
                >
                  « Previous Lesson
                </button>
                <button
                  disabled={activeLessonIndex === lessons.length - 1}
                  onClick={() => setActiveLessonIndex((prev) => Math.min(lessons.length - 1, prev + 1))}
                  className="btn-primary text-[13px] disabled:opacity-40"
                >
                  Next Lesson »
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* About ChessArena Box */}
        <div className="card p-5 bg-bg-card-soft">
          <h2 className="label-eyebrow mb-2">ABOUT CHESSARENA</h2>
          <p className="text-[13px] text-text-muted leading-relaxed">
            ChessArena is a community-built chess platform focused on tournaments, learning, and fair play. The project is open source and run without advertising, funded by player donations.
          </p>
        </div>
      </div>
    </main>
  );
}
