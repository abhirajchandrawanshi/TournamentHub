const modes = ["Bullet", "Blitz", "Rapid", "Classical"];

const players = [
  { rank: 1, name: "GM_Arjun_Mehta", rating: 2891, title: "GM" },
  { rank: 2, name: "queenside_pawn", rating: 2764, title: "IM" },
  { rank: 3, name: "IM_Kavya92", rating: 2701, title: "IM" },
  { rank: 4, name: "rook_runner", rating: 2650, title: "FM" },
  { rank: 5, name: "knight_errant", rating: 2598, title: "FM" },
  { rank: 6, name: "Prakriti_Singh", rating: 2011, title: null },
  { rank: 7, name: "endgame_wizard", rating: 1980, title: null },
  { rank: 8, name: "bishop_pair", rating: 1955, title: null },
];

export default function LeaderboardPage() {
  return (
    <main className="flex-1 bg-bg">
      <div className="max-w-[700px] mx-auto px-4 py-6">
        <h1 className="text-[20px] font-semibold text-text-strong mb-1">Leaderboard</h1>
        <p className="text-[13px] text-text-muted mb-5">Top rated players on ChessArena.</p>

        <div className="flex gap-2 mb-5 flex-wrap">
          {modes.map((m, i) => (
            <button
              key={m}
              className={`text-[13px] px-3 py-1.5 rounded-sm border transition-colors ${
                i === 1
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
              <div
                key={p.rank}
                className="flex items-center gap-3 px-4 py-2.5 text-[13px] hover:bg-white/[0.03]"
              >
                <span className="w-6 text-text-muted font-mono">{p.rank}</span>
                {p.title && (
                  <span className="text-accent font-bold text-[11px] shrink-0">{p.title}</span>
                )}
                <span className="flex-1 text-text-strong truncate">{p.name}</span>
                <span className="font-mono text-text-strong font-semibold">{p.rating}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}