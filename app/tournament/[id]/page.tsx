"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import ChessBoard from "@/components/ChessBoard";
import api from "@/lib/axios";

interface Participant {
  id: string;
  name: string;
  username: string;
  rating: number;
  avatar: string | null;
}

interface TournamentDetail {
  id: string;
  name: string;
  clock: string;
  type: string;
  status: string;
  creator_id: string;
  participants: Participant[];
}

export default function TournamentDetailPage() {
  const params = useParams();
  const tournamentId = params?.id as string;
  const [tournament, setTournament] = useState<TournamentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchDetail() {
      if (!tournamentId) return;
      try {
        const res = await api.get<TournamentDetail>(`/tournaments/${tournamentId}`);
        setTournament(res.data);
      } catch (err) {
        console.error("Failed to load tournament detail:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [tournamentId]);

  async function handleJoin() {
    if (!tournamentId) return;
    setJoining(true);
    setMessage("");
    try {
      const res = await api.post(`/tournaments/${tournamentId}/join`);
      setMessage(res.data?.message || "Successfully joined!");
      // Refresh details
      const detailRes = await api.get<TournamentDetail>(`/tournaments/${tournamentId}`);
      setTournament(detailRes.data);
    } catch (err: any) {
      console.error(err);
      setMessage(err?.response?.data?.detail || "Please sign in to join this tournament.");
    } finally {
      setJoining(false);
    }
  }

  if (loading) {
    return (
      <main className="flex-1 bg-bg flex items-center justify-center p-8 text-[13px] text-text-muted">
        Loading tournament data...
      </main>
    );
  }

  return (
    <main className="flex-1 bg-bg">
      <div className="max-w-[900px] mx-auto px-4 py-6">
        <Link href="/tournament" className="text-[12px] text-blue hover:underline">
          « Back to tournaments
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-2 mb-5">
          <div>
            <h1 className="text-[20px] font-semibold text-text-strong">{tournament?.name || tournamentId}</h1>
            <p className="text-[13px] text-text-muted mt-1">
              {tournament?.type || "Arena"} &middot; {tournament?.clock || "3+0"} &middot; {tournament?.participants?.length || 0} players
            </p>
          </div>
          <button
            onClick={handleJoin}
            disabled={joining}
            className="btn-primary text-[13px] disabled:opacity-60"
          >
            {joining ? "Joining..." : "Join tournament"}
          </button>
        </div>

        {message && (
          <div className="mb-4 text-[12px] text-accent bg-accent/10 border border-accent rounded-sm px-3 py-2">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-5">
          <div className="flex justify-center lg:justify-start">
            <ChessBoard size={320} />
          </div>

          <div className="card p-0 overflow-hidden">
            <div className="px-4 py-3 border-b border-border-soft label-eyebrow">Participants & Standings</div>
            <div className="divide-y divide-border-soft">
              {tournament?.participants && tournament.participants.length > 0 ? (
                tournament.participants.map((p, index) => (
                  <Link
                    key={p.id || index}
                    href={`/profile/${p.username || p.name}`}
                    className="flex items-center justify-between px-4 py-2.5 text-[13px] hover:bg-white/[0.03]"
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-text-muted w-5 font-mono">{index + 1}</span>
                      <span className="text-text-strong">{p.name || p.username}</span>
                    </span>
                    <span className="font-mono font-semibold text-text-strong">{p.rating || 1500}</span>
                  </Link>
                ))
              ) : (
                <div className="p-4 text-[13px] text-text-muted text-center">No participants yet. Click Join to be the first!</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}