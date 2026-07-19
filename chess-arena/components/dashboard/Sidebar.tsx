"use client";

import Link from "next/link";

const menu = [
  { name: "Dashboard", href: "/dashboard/player" },
  { name: "Tournaments", href: "/tournament" },
  { name: "Wallet", href: "/wallet" },
  { name: "Profile", href: "/profile" },
  { name: "Leaderboard", href: "/leaderboard" },
];

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-[#141922] border-r border-gray-800 p-6">

      <h1 className="text-2xl font-bold text-green-400 mb-10">
        ChessArena
      </h1>

      <nav className="space-y-3">
        {menu.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="block p-3 rounded-lg hover:bg-green-500 hover:text-black transition"
          >
            {item.name}
          </Link>
        ))}
      </nav>

    </aside>
  );
}