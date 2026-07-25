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
  entry_fee?: number;
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

  const [brackets, setBrackets] = useState<any>(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    async function fetchDetail() {
      if (!tournamentId) return;
      try {
        const res = await api.get<TournamentDetail>(`/tournaments/${tournamentId}`);
        setTournament(res.data);
        const bracketRes = await api.get(`/tournaments/${tournamentId}/brackets`);
        setBrackets(bracketRes.data);
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
      const detailRes = await api.get<TournamentDetail>(`/tournaments/${tournamentId}`);
      setTournament(detailRes.data);
      const bracketRes = await api.get(`/tournaments/${tournamentId}/brackets`);
      setBrackets(bracketRes.data);
    } catch (err: any) {
      console.error(err);
      setMessage(err?.response?.data?.detail || "Please sign in to join this tournament.");
    } finally {
      setJoining(false);
    }
  }

  async function handleStartTournament() {
    if (!tournamentId) return;
    setStarting(true);
    try {
      await api.post(`/tournaments/${tournamentId}/start`);
      const detailRes = await api.get<TournamentDetail>(`/tournaments/${tournamentId}`);
      setTournament(detailRes.data);
      const bracketRes = await api.get(`/tournaments/${tournamentId}/brackets`);
      setBrackets(bracketRes.data);
    } catch (err: any) {
      console.error("Error starting tournament:", err);
    } finally {
      setStarting(false);
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
      <div className="max-w-[950px] mx-auto px-4 py-6">
        <Link href="/tournament" className="text-[12px] text-blue hover:underline">
          « Back to tournaments
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-2 mb-5">
          <div>
            <h1 className="text-[20px] font-semibold text-text-strong">{tournament?.name || tournamentId}</h1>
            <p className="text-[13px] text-text-muted mt-1 flex items-center gap-2">
              <span>{tournament?.type || "Arena"} &middot; {tournament?.clock || "3+0"} &middot; {tournament?.participants?.length || 0} players</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${tournament?.entry_fee && tournament.entry_fee > 0 ? "bg-accent/10 text-accent" : "bg-bg-input text-text-muted"}`}>
                {tournament?.entry_fee && tournament.entry_fee > 0 ? `₹${tournament.entry_fee} Entry Fee` : "Free Entry"}
              </span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${tournament?.status === "active" ? "bg-accent text-bg" : "bg-bg-input text-text-muted"}`}>
                {tournament?.status === "active" ? "LIVE IN PROGRESS" : "UPCOMING"}
              </span>
            </p>
          </div>
          <div className="flex gap-2">
            {tournament?.status !== "active" && (
              <button
                onClick={handleStartTournament}
                disabled={starting || (tournament?.participants?.length || 0) < 2}
                className="btn-outline text-[13px] border-accent text-accent disabled:opacity-50"
              >
                {starting ? "Generating Brackets..." : "⚡ Start Tournament"}
              </button>
            )}
            <button
              onClick={handleJoin}
              disabled={joining}
              className="btn-primary text-[13px] disabled:opacity-60"
            >
              {joining ? "Joining..." : tournament?.entry_fee && tournament.entry_fee > 0 ? `Join (₹${tournament.entry_fee})` : "Join tournament"}
            </button>
          </div>
        </div>

        {message && (
          <div className="mb-4 text-[12px] p-3 rounded-sm border bg-accent/10 border-accent text-accent flex items-center justify-between">
            <span>{message}</span>
            <Link href="/wallet" className="btn-outline text-[11px] !py-1 !px-2 shrink-0 ml-2">
              Go to Wallet »
            </Link>
          </div>
        )}

        {/* Tournament Brackets Diagram & Match Schedule */}
        {brackets?.matches && brackets.matches.length > 0 && (
          <div className="card p-4 mb-6">
            <h3 className="text-[14px] font-semibold text-text-strong mb-3 flex items-center gap-2">
              <span>🏆 Tournament Brackets & Scheduled Matches</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {brackets.matches.map((m: any, idx: number) => (
                <div key={m.game_id || idx} className="bg-bg-input/60 border border-border p-3 rounded-sm flex flex-col justify-between">
                  <div className="flex justify-between items-center text-[11px] text-text-muted mb-2 font-mono">
                    <span>Match #{idx + 1}</span>
                    <span className={m.status === "active" ? "text-accent font-semibold" : "text-text-muted"}>
                      {m.status === "active" ? "Live Playing" : m.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="space-y-1 text-[13px] mb-3">
                    <div className={`flex justify-between items-center p-1.5 rounded-xs ${m.winner === m.white ? "bg-accent/10 font-bold" : ""}`}>
                      <span className="text-text-strong font-medium">⚪ {m.white}</span>
                      {m.winner === m.white && <span className="text-accent text-[11px]">WINNER</span>}
                    </div>
                    <div className={`flex justify-between items-center p-1.5 rounded-xs ${m.winner === m.black ? "bg-accent/10 font-bold" : ""}`}>
                      <span className="text-text-strong font-medium">⚫ {m.black}</span>
                      {m.winner === m.black && <span className="text-accent text-[11px]">WINNER</span>}
                    </div>
                  </div>
                  <Link
                    href={`/game?gameId=${m.game_id}`}
                    className="btn-primary text-[12px] py-1 text-center w-full block"
                  >
                    {m.status === "active" ? "Play Match ⚔️" : "View Match 👁️"}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-5">
          <div className="flex justify-center lg:justify-start">
            <ChessBoard size={320} />
          </div>

          <div className="card p-0 overflow-hidden">
            <div className="px-4 py-3 border-b border-border-soft label-eyebrow flex justify-between">
              <span>Participants & Standings</span>
              <span>Points</span>
            </div>
            <div className="divide-y divide-border-soft">
              {brackets?.standings && brackets.standings.length > 0 ? (
                brackets.standings.map((p: any, index: number) => (
                  <div
                    key={p.id || index}
                    className="flex items-center justify-between px-4 py-2.5 text-[13px] hover:bg-white/[0.03]"
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-text-muted w-5 font-mono">{index + 1}</span>
                      <span className="text-text-strong">{p.name}</span>
                      <span className="text-[11px] text-text-muted font-mono">({p.rating || 1500})</span>
                    </span>
                    <div className="flex items-center gap-3 font-mono">
                      <span className="text-[11px] text-text-muted">{p.wins}W - {p.losses}L</span>
                      <span className="font-semibold text-accent">{p.points} pts</span>
                    </div>
                  </div>
                ))
              ) : tournament?.participants && tournament.participants.length > 0 ? (
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