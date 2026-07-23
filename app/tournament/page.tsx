"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/axios";

interface Tournament {
  id: string;
  name: string;
  clock: string;
  type: string;
  status: string;
  players: number;
  starts: string;
  live: boolean;
}

export default function TournamentPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTournaments() {
      try {
        const res = await api.get<Tournament[]>("/tournaments");
        if (res.data && res.data.length > 0) {
          setTournaments(res.data);
        } else {
          setTournaments([
            { id: "eastern-superblitz", name: "Eastern SuperBlitz Arena", clock: "3+0", type: "Arena", status: "active", players: 799, starts: "Playing now", live: true },
            { id: "hourly-bullet", name: "Hourly Bullet Arena", clock: "1+0", type: "Arena", status: "created", players: 1032, starts: "in 12m", live: false },
            { id: "titled-blitz", name: "Titled Blitz Arena", clock: "3+2", type: "Arena", status: "created", players: 88, starts: "in 3h", live: false },
            { id: "weekly-classical-swiss", name: "Weekly Classical Swiss", clock: "15+10", type: "Swiss", status: "created", players: 214, starts: "in 1h 30m", live: false },
          ]);
        }
      } catch (err) {
        console.error("Failed to load tournaments:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTournaments();
  }, []);

  const arenaTournaments = tournaments.filter((t) => t.type.toLowerCase() === "arena");
  const swissTournaments = tournaments.filter((t) => t.type.toLowerCase() === "swiss");

  return (
    <main className="flex-1 bg-bg">
      <div className="max-w-[900px] mx-auto px-4 py-6">
        <h1 className="text-[20px] font-semibold text-text-strong mb-1">Tournaments</h1>
        <p className="text-[13px] text-text-muted mb-5">
          Join an arena or swiss tournament, or create your own live event.
        </p>

        <div className="flex gap-2 mb-6">
          <Link href="/tournament/create" className="btn-primary text-[13px]">
            Create a tournament
          </Link>
          <Link href="/leaderboard" className="btn-outline text-[13px]">
            View leaderboard
          </Link>
        </div>

        {loading ? (
          <div className="card p-6 text-center text-[13px] text-text-muted">Loading live tournaments...</div>
        ) : (
          <>
            <div className="card p-0 overflow-hidden mb-6">
              <div className="px-4 py-3 border-b border-border-soft flex items-center justify-between">
                <h2 className="label-eyebrow">Arena tournaments</h2>
                <span className="text-[12px] text-text-muted">Winner takes streaks</span>
              </div>
              <div className="divide-y divide-border-soft">
                {arenaTournaments.map((t) => (
                  <Link
                    key={t.id}
                    href={`/tournament/${t.id}`}
                    className="flex items-center justify-between px-4 py-3 text-[13px] hover:bg-white/[0.03]"
                  >
                    <span className="text-text-strong truncate pr-2">{t.name}</span>
                    <span className="flex items-center gap-4 shrink-0 text-text-muted">
                      <span className="font-mono">{t.clock}</span>
                      <span className="hidden sm:inline">{t.players} players</span>
                      <span className={t.live ? "text-accent font-semibold" : "text-text-muted"}>
                        {t.starts}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="card p-0 overflow-hidden">
              <div className="px-4 py-3 border-b border-border-soft">
                <h2 className="label-eyebrow">Swiss tournaments</h2>
              </div>
              <div className="divide-y divide-border-soft">
                {swissTournaments.map((t) => (
                  <Link
                    key={t.id}
                    href={`/tournament/${t.id}`}
                    className="flex items-center justify-between px-4 py-3 text-[13px] hover:bg-white/[0.03]"
                  >
                    <span className="text-text-strong truncate pr-2">{t.name}</span>
                    <span className="flex items-center gap-4 shrink-0 text-text-muted">
                      <span className="font-mono">{t.clock}</span>
                      <span className="hidden sm:inline">{t.players} players</span>
                      <span>{t.starts}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}