import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950 text-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 py-10 md:flex-row">
        <div>
          <h2 className="text-3xl font-bold text-emerald-400">
            ChessArena
          </h2>

          <p className="mt-3 text-gray-400">
            India's Competitive Chess Platform.
          </p>
        </div>

        <div className="flex gap-8">
          <Link href="/">Home</Link>
          <Link href="/tournaments">Tournament</Link>
          <Link href="/leaderboard">Leaderboard</Link>
          <Link href="/login">Login</Link>
        </div>

        <div className="text-sm text-gray-500">
          © 2026 ChessArena. All rights reserved.
        </div>
      </div>
    </footer>
  );
}