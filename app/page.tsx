import Link from "next/link";
import ChessBoard from "@/components/ChessBoard";

const openTournaments = [
  { name: "Eastern SuperBlitz Arena", clock: "3+0", players: 799, starts: "Playing now" },
  { name: "Weekly Classical Swiss", clock: "15+10", players: 214, starts: "in 1h 30m" },
  { name: "Hourly Bullet Arena", clock: "1+0", players: 1032, starts: "in 12m" },
  { name: "Titled Blitz Arena", clock: "3+2", players: 88, starts: "in 3h" },
];

export default function Home() {
  return (
    <main className="flex-1 bg-bg">
      <div className="max-w-[1100px] mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-8">
        {/* Board */}
        <div className="flex justify-center lg:justify-start">
          <ChessBoard size={420} />
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-5 min-w-0">
          <div>
            <h1 className="text-[22px] font-semibold text-text-strong leading-snug">
              ChessArena is a free, open chess platform.
            </h1>
            <p className="text-[13px] text-text-muted mt-1">
              Really. No registration required to look around. No ads, ever.{" "}
              <Link href="/about" className="text-blue hover:underline">
                About ChessArena...
              </Link>
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Link
              href="/game"
              className="card px-4 py-3 hover:border-accent transition-colors"
            >
              <div className="text-[13px] font-semibold text-text-strong">Create a game</div>
              <div className="text-[12px] text-text-muted mt-0.5">Play a friend or random</div>
            </Link>
            <Link
              href="/game"
              className="card px-4 py-3 hover:border-accent transition-colors"
            >
              <div className="text-[13px] font-semibold text-text-strong">Challenge a friend</div>
              <div className="text-[12px] text-text-muted mt-0.5">Invite by username</div>
            </Link>
            <Link
              href="/game"
              className="card px-4 py-3 hover:border-accent transition-colors"
            >
              <div className="text-[13px] font-semibold text-text-strong">Play the computer</div>
              <div className="text-[12px] text-text-muted mt-0.5">8 difficulty levels</div>
            </Link>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="label-eyebrow">Open tournaments</h2>
              <Link href="/tournament" className="text-[12px] text-blue hover:underline">
                More »
              </Link>
            </div>
            <div className="divide-y divide-border-soft">
              {openTournaments.map((t) => (
                <Link
                  key={t.name}
                  href="/tournament"
                  className="flex items-center justify-between py-2.5 text-[13px] hover:bg-white/[0.03] -mx-1 px-1 rounded-sm"
                >
                  <span className="text-text-strong truncate pr-2">{t.name}</span>
                  <span className="flex items-center gap-4 shrink-0 text-text-muted">
                    <span className="font-mono">{t.clock}</span>
                    <span className="hidden sm:inline">{t.players} players</span>
                    <span
                      className={
                        t.starts === "Playing now"
                          ? "text-accent font-semibold"
                          : "text-text-muted"
                      }
                    >
                      {t.starts}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="card p-4">
              <div className="label-eyebrow mb-1">Puzzle of the day</div>
              <p className="text-[13px] text-text">
                White to play and win material in three moves.
              </p>
              <Link href="/game" className="text-blue text-[13px] hover:underline mt-1 inline-block">
                Click to solve »
              </Link>
            </div>
            <div className="card p-4">
              <div className="label-eyebrow mb-1">Support ChessArena</div>
              <p className="text-[13px] text-text">
                We run on donations. Keep this platform free and ad-free for everyone.
              </p>
              <Link href="/about" className="text-blue text-[13px] hover:underline mt-1 inline-block">
                Become a patron »
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
