"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Search } from "lucide-react";

const navItems = [
  { name: "Play", href: "/game" },
  { name: "Puzzles", href: "/puzzle" },
  { name: "Tournaments", href: "/tournament" },
  { name: "Leaderboard", href: "/leaderboard" },
  { name: "Learn", href: "/about" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-bg-header border-b border-border-soft">
      <div className="flex h-[52px] items-center px-3 md:px-4 gap-1">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5 pr-2 md:pr-4">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" className="shrink-0">
            <path
              d="M12 2 L4 6 L4 12 C4 17 7.5 20.5 12 22 C16.5 20.5 20 17 20 12 L20 6 Z"
              fill="var(--color-accent)"
            />
            <path d="M9 9 L15 15 M15 9 L9 15" stroke="#10230a" strokeWidth="1.6" />
          </svg>
          <span className="text-[19px] font-semibold text-text-strong tracking-tight hidden sm:block">
            chess<span className="text-accent">arena</span>.org
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center h-full">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="h-full flex items-center px-3 text-[14px] text-text hover:text-text-strong hover:bg-white/[0.04] transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="flex-1" />

        {/* Search */}
        <button
          aria-label="Search"
          className="hidden sm:flex items-center gap-2 h-8 px-2.5 rounded-sm border border-border text-text-muted hover:text-text-strong hover:border-text-muted transition-colors mr-2"
        >
          <Search size={14} />
          <span className="text-[13px]">Search</span>
        </button>

        {/* Auth actions */}
        <div className="hidden sm:flex items-center gap-2">
          <Link href="/auth/login" className="btn-outline text-[13px] !py-1.5 !px-3">
            Sign in
          </Link>
          <Link href="/auth/signup" className="btn-primary text-[13px] !py-1.5 !px-3">
            Register
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-text-strong p-1"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border-soft bg-bg-header">
          <nav className="flex flex-col px-3 py-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setOpen(false)}
                className="py-2.5 text-[14px] text-text border-b border-border-soft last:border-0"
              >
                {item.name}
              </Link>
            ))}
            <div className="flex gap-2 pt-3 pb-1">
              <Link href="/auth/login" className="btn-outline text-[13px] flex-1 text-center">
                Sign in
              </Link>
              <Link href="/auth/signup" className="btn-primary text-[13px] flex-1 text-center">
                Register
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
