"use client";

import Link from "next/link";

const navItems = [
  { name: "Home", href: "/" },
  { name: "Tournaments", href: "/tournament" },
  { name: "Leaderboard", href: "/leaderboard" },
  { name: "About", href: "/about" },
];

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0B0D12]/90 backdrop-blur border-b border-gray-800">
      <div className="max-w-7xl mx-auto h-16 flex items-center justify-between px-6">
        <Link
          href="/"
          className="text-2xl font-bold text-green-400 tracking-wide"
        >
          ChessArena
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-gray-300 hover:text-green-400 transition"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/auth/login"
            className="px-5 py-2 rounded-lg border border-green-500 text-green-400 hover:bg-green-500 hover:text-black transition"
          >
            Login
          </Link>

          <Link
            href="/auth/signup"
            className="px-5 py-2 rounded-lg bg-green-500 text-black font-semibold hover:bg-green-400 transition"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </header>
  );
}