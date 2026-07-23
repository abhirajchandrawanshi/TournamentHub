"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/axios";

interface LeaderboardUser {
  rank: number;
  id: string;
  name: string;
  username: string;
  rating: number;
  avatar: string | null;
  title: string | null;
}

const modes = ["Blitz", "Bullet", "Rapid", "Classical"] as const;

export default function LeaderboardPage() {
  const [activeMode, setActiveMode] = useState<(typeof modes)[number]>("Blitz");
  const [players, setPlayers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      try {
        const res = await api.get<LeaderboardUser[]>("/leaderboard");
        if (res.data && res.data.length > 0) {
          setPlayers(res.data);
        } else {
          // Default fallbacks if empty database
          setPlayers([
            { rank: 1, id: "1", name: "GM Arjun Mehta", username: "GM_Arjun_Mehta", rating: 2891, avatar: null, title: "GM" },
            { rank: 2, id: "2", name: "Rook Runner", username: "rook_runner", rating: 2810, avatar: null, title: "FM" },
            { rank: 3, id: "3", name: "Queenside Pawn", username: "queenside_pawn", rating: 2764, avatar: null, title: "IM" },
            { rank: 4, id: "4", name: "Kavya Singh", username: "IM_Kavya92", rating: 2701, avatar: null, title: "IM" },
            { rank: 5, id: "5", name: "Prakriti Singh", username: "Prakriti_Singh", rating: 1967, avatar: null, title: null },
          ]);
        }
      } catch (err) {
        console.error("Failed to load leaderboard:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, [activeMode]);

  return (
    <main className="flex-1 bg-bg">
      <div className="max-w-[700px] mx-auto px-4 py-6">
        <h1 className="text-[20px] font-semibold text-text-strong mb-1">Leaderboard</h1>
        <p className="text-[13px] text-text-muted mb-5">Top rated players on ChessArena live backend.</p>

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
          {loading ? (
            <div className="p-6 text-center text-[13px] text-text-muted">Loading live leaderboard...</div>
          ) : (
            <div className="divide-y divide-border-soft">
              {players.map((p) => (
                <Link
                  key={p.rank}
                  href={`/profile/${p.username || p.name}`}
                  className="flex items-center gap-3 px-4 py-2.5 text-[13px] hover:bg-white/[0.03]"
                >
                  <span className="w-6 text-text-muted font-mono">{p.rank}</span>
                  {p.title && (
                    <span className="text-accent font-bold text-[11px] shrink-0">{p.title}</span>
                  )}
                  <span className="flex-1 text-text-strong truncate">{p.name || p.username}</span>
                  <span className="font-mono text-text-strong font-semibold">{p.rating}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}