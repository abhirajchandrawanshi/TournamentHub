"use client";

import { useState } from "react";
import Link from "next/link";

const modes = ["Bullet", "Blitz", "Rapid", "Classical"] as const;

const playersByMode: Record<(typeof modes)[number], { rank: number; name: string; rating: number; title: string | null }[]> = {
  Bullet: [
    { rank: 1, name: "rook_runner", rating: 2810, title: "FM" },
    { rank: 2, name: "GM_Arjun_Mehta", rating: 2790, title: "GM" },
    { rank: 3, name: "Prakriti_Singh", rating: 1842, title: null },
  ],
  Blitz: [
    { rank: 1, name: "GM_Arjun_Mehta", rating: 2891, title: "GM" },
    { rank: 2, name: "queenside_pawn", rating: 2764, title: "IM" },
    { rank: 3, name: "IM_Kavya92", rating: 2701, title: "IM" },
    { rank: 4, name: "Prakriti_Singh", rating: 1967, title: null },
  ],
  Rapid: [
    { rank: 1, name: "knight_errant", rating: 2598, title: "FM" },
    { rank: 2, name: "Prakriti_Singh", rating: 2011, title: null },
    { rank: 3, name: "endgame_wizard", rating: 1980, title: null },
  ],
  Classical: [
    { rank: 1, name: "IM_Kavya92", rating: 2510, title: "IM" },
    { rank: 2, name: "bishop_pair", rating: 1955, title: null },
    { rank: 3, name: "Prakriti_Singh", rating: 1888, title: null },
  ],
};

export default function LeaderboardPage() {
  const [activeMode, setActiveMode] = useState<(typeof modes)[number]>("Blitz");
  const players = playersByMode[activeMode];

  return (
    <main className="flex-1 bg-bg">
      <div className="max-w-[700px] mx-auto px-4 py-6">
        <h1 className="text-[20px] font-semibold text-text-strong mb-1">Leaderboard</h1>
        <p className="text-[13px] text-text-muted mb-5">Top rated players on ChessArena.</p>

        <div className="flex gap-2 mb-5 flex-wrap">
          {modes.map((m) => (
            <button
              key={m}
              onClick={() => setActiveMode(m)}
              className={`text-[13px] px-3 py-1.5 rounded-sm border transition-colors ${
                m === activeMode
                  ? "bg-accent-soft border-accent text-accent font-semibold"
                  : "border-border text-text-muted hover:text-text-strong"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="card p-0 overflow-hidden">
          <div className="divide-y divide-border-soft">
            {players.map((p) => (
              <Link
                key={p.rank}
                href={`/profile/${p.name}`}
                className="flex items-center gap-3 px-4 py-2.5 text-[13px] hover:bg-white/[0.03]"
              >
                <span className="w-6 text-text-muted font-mono">{p.rank}</span>
                {p.title && (
                  <span className="text-accent font-bold text-[11px] shrink-0">{p.title}</span>
                )}
                <span className="flex-1 text-text-strong truncate">{p.name}</span>
                <span className="font-mono text-text-strong font-semibold">{p.rating}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}