"use client";

import { Crown } from "lucide-react";

const players = [
  { rank: 1, name: "Aryan Sharma", rating: 2840 },
  { rank: 2, name: "Riya Gupta", rating: 2812 },
  { rank: 3, name: "Aditya Singh", rating: 2798 },
  { rank: 4, name: "Neha Patel", rating: 2760 },
  { rank: 5, name: "Rahul Verma", rating: 2741 },
];

export default function LeaderboardPreview() {
  return (
    <section className="bg-slate-950 py-24 text-white">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="mb-12 text-center text-5xl font-bold">
          Global <span className="text-emerald-400">Leaderboard</span>
        </h2>

        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full">
            <thead className="bg-slate-900">
              <tr>
                <th className="p-5 text-left">Rank</th>
                <th className="text-left">Player</th>
                <th className="text-left">Rating</th>
              </tr>
            </thead>

            <tbody>
              {players.map((player) => (
                <tr
                  key={player.rank}
                  className="border-t border-white/10 hover:bg-white/5"
                >
                  <td className="p-5 flex items-center gap-2">
                    {player.rank === 1 && (
                      <Crown className="text-yellow-400" size={18} />
                    )}
                    #{player.rank}
                  </td>

                  <td>{player.name}</td>

                  <td>{player.rating}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-10 text-center">
          <button className="rounded-xl bg-emerald-500 px-8 py-3 font-semibold hover:bg-emerald-600">
            View Full Leaderboard
          </button>
        </div>
      </div>
    </section>
  );
}