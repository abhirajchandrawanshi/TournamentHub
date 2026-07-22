import Link from "next/link";
import { notFound } from "next/navigation";
import ChessBoard from "@/components/ChessBoard";

const allTournaments: Record<
  string,
  { name: string; clock: string; players: number; starts: string; type: string; rounds?: number }
> = {
  "eastern-superblitz": { name: "Eastern SuperBlitz Arena", clock: "3+0", players: 799, starts: "Playing now", type: "Arena" },
  "hourly-bullet": { name: "Hourly Bullet Arena", clock: "1+0", players: 1032, starts: "in 12m", type: "Arena" },
  "titled-blitz": { name: "Titled Blitz Arena", clock: "3+2", players: 88, starts: "in 3h", type: "Arena" },
  "daily-rapid": { name: "Daily Rapid Arena", clock: "10+0", players: 340, starts: "in 6h", type: "Arena" },
  "weekly-classical-swiss": { name: "Weekly Classical Swiss", clock: "15+10", players: 214, starts: "in 1h 30m", type: "Swiss", rounds: 7 },
  "monthly-rapid-swiss": { name: "Monthly Rapid Swiss", clock: "10+5", players: 512, starts: "Tomorrow", type: "Swiss", rounds: 9 },
};

const standings = [
  { rank: 1, name: "GM_Arjun_Mehta", score: 6 },
  { rank: 2, name: "queenside_pawn", score: 5.5 },
  { rank: 3, name: "IM_Kavya92", score: 5 },
  { rank: 4, name: "Prakriti_Singh", score: 4.5 },
];

export default function TournamentDetailPage({ params }: { params: { id: string } }) {
  const tournament = allTournaments[params.id];

  if (!tournament) {
    notFound();
  }

  return (
    <main className="flex-1 bg-bg">
      <div className="max-w-[900px] mx-auto px-4 py-6">
        <Link href="/tournament" className="text-[12px] text-blue hover:underline">
          « Back to tournaments
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-2 mb-5">
          <div>
            <h1 className="text-[20px] font-semibold text-text-strong">{tournament.name}</h1>
            <p className="text-[13px] text-text-muted mt-1">
              {tournament.type} &middot; {tournament.clock} &middot; {tournament.players} players
              {tournament.rounds ? ` \u00b7 ${tournament.rounds} rounds` : ""}
            </p>
          </div>
          <button className="btn-primary text-[13px]">Join tournament</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-5">
          <div className="flex justify-center lg:justify-start">
            <ChessBoard size={320} />
          </div>

          <div className="card p-0 overflow-hidden">
            <div className="px-4 py-3 border-b border-border-soft label-eyebrow">Standings</div>
            <div className="divide-y divide-border-soft">
              {standings.map((s) => (
                <Link
                  key={s.rank}
                  href={`/profile/${s.name}`}
                  className="flex items-center justify-between px-4 py-2.5 text-[13px] hover:bg-white/[0.03]"
                >
                  <span className="flex items-center gap-3">
                    <span className="text-text-muted w-5 font-mono">{s.rank}</span>
                    <span className="text-text-strong">{s.name}</span>
                  </span>
                  <span className="font-mono font-semibold text-text-strong">{s.score}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}