import Link from "next/link";
import { notFound } from "next/navigation";

const mockUsers = [
  "GM_Arjun_Mehta",
  "queenside_pawn",
  "IM_Kavya92",
  "rook_runner",
  "knight_errant",
  "Prakriti_Singh",
  "endgame_wizard",
  "bishop_pair",
];

const ratings = [
  { mode: "Bullet", value: 1842 },
  { mode: "Blitz", value: 1967 },
  { mode: "Rapid", value: 2011 },
  { mode: "Classical", value: 1888 },
];

export default function ProfilePage({ params }: { params: { username: string } }) {
  const username = decodeURIComponent(params.username);

  if (!mockUsers.includes(username)) {
    notFound();
  }

  return (
    <main className="flex-1 bg-bg">
      <div className="max-w-[700px] mx-auto px-4 py-6">
        <div className="card p-5 flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-full bg-accent-soft border border-accent flex items-center justify-center text-[20px] font-bold text-accent shrink-0">
            {username.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h1 className="text-[19px] font-semibold text-text-strong truncate">{username}</h1>
            <p className="text-[13px] text-text-muted">ChessArena member</p>
          </div>
          <Link href="/game" className="btn-primary text-[13px] ml-auto shrink-0">
            Challenge
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {ratings.map((r) => (
            <div key={r.mode} className="card p-3 text-center">
              <div className="label-eyebrow">{r.mode}</div>
              <div className="text-[22px] font-bold text-text-strong mt-1">{r.value}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}