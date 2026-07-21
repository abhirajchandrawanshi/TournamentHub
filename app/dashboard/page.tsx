const ratings = [
  { mode: "Bullet", value: 1842, games: 1204 },
  { mode: "Blitz", value: 1967, games: 3410 },
  { mode: "Rapid", value: 2011, games: 512 },
  { mode: "Classical", value: 1888, games: 96 },
];

const recentGames = [
  { opponent: "IM_Kavya92", result: "Won", mode: "Blitz 5+3", moves: 41, when: "2h ago" },
  { opponent: "rook_runner", result: "Lost", mode: "Bullet 1+0", moves: 28, when: "5h ago" },
  { opponent: "GM_Arjun", result: "Draw", mode: "Rapid 10+0", moves: 63, when: "1d ago" },
  { opponent: "queenside_pawn", result: "Won", mode: "Blitz 3+2", moves: 35, when: "1d ago" },
  { opponent: "knight_errant", result: "Won", mode: "Classical 15+10", moves: 54, when: "2d ago" },
];

function resultColor(r: string) {
  if (r === "Won") return "text-accent";
  if (r === "Lost") return "text-danger";
  return "text-text-muted";
}

export default function DashboardPage() {
  return (
    <main className="flex-1 bg-bg">
      <div className="max-w-[1000px] mx-auto px-4 py-6">
        {/* Profile header */}
        <div className="card p-5 flex flex-col sm:flex-row sm:items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-full bg-accent-soft border border-accent flex items-center justify-center text-[22px] font-bold text-accent shrink-0">
            PS
          </div>
          <div className="min-w-0">
            <h1 className="text-[19px] font-semibold text-text-strong">Prakriti_Singh</h1>
            <p className="text-[13px] text-text-muted">Member since Jan 2025 &middot; India</p>
          </div>
          <div className="sm:ml-auto flex gap-2">
            <button className="btn-outline text-[13px]">Edit profile</button>
            <button className="btn-primary text-[13px]">Challenge</button>
          </div>
        </div>

        {/* Ratings */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {ratings.map((r) => (
            <div key={r.mode} className="card p-3 text-center">
              <div className="label-eyebrow">{r.mode}</div>
              <div className="text-[24px] font-bold text-text-strong mt-1">{r.value}</div>
              <div className="text-[11px] text-text-muted mt-0.5">{r.games} games</div>
            </div>
          ))}
        </div>

        {/* Recent games */}
        <div className="card p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-border-soft">
            <h2 className="label-eyebrow">Recent games</h2>
          </div>
          <div className="divide-y divide-border-soft">
            {recentGames.map((g, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-4 py-2.5 text-[13px] hover:bg-white/[0.03]"
              >
                <span className={`w-14 shrink-0 font-semibold ${resultColor(g.result)}`}>
                  {g.result}
                </span>
                <span className="flex-1 text-text-strong truncate px-2">vs {g.opponent}</span>
                <span className="hidden sm:block text-text-muted w-32 shrink-0">{g.mode}</span>
                <span className="hidden sm:block text-text-muted w-16 shrink-0 text-right">
                  {g.moves} moves
                </span>
                <span className="text-text-muted w-16 shrink-0 text-right">{g.when}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
