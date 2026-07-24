"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X, Search, User as UserIcon, LogOut, LayoutDashboard } from "lucide-react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

const navItems = [
  { name: "Play", href: "/game" },
  { name: "Puzzles", href: "/puzzle" },
  { name: "Tournaments", href: "/tournament" },
  { name: "Leaderboard", href: "/leaderboard" },
  { name: "Learn", href: "/learn" },
];

export default function Navbar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setDropdownOpen(false);
      router.push("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const username = user?.displayName || user?.email?.split("@")[0] || "User";
  const userInitials = username.slice(0, 2).toUpperCase();

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
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 px-2.5 py-1 rounded-sm border border-border hover:border-accent transition-colors bg-bg-input text-text-strong"
              >
                <div className="w-6 h-6 rounded-full bg-accent-soft border border-accent flex items-center justify-center text-[11px] font-bold text-accent">
                  {userInitials}
                </div>
                <span className="text-[13px] font-medium max-w-[120px] truncate">{username}</span>
              </button>

              {dropdownOpen && (
                <div
                  className="absolute right-0 mt-1 w-48 bg-surface border border-border rounded-sm shadow-lg py-1 z-50 text-[13px]"
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-border-soft">
                    <p className="font-semibold text-text-strong truncate">{username}</p>
                    <p className="text-[11px] text-text-muted truncate">{user.email}</p>
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-text hover:bg-white/[0.05] hover:text-text-strong"
                  >
                    <LayoutDashboard size={14} />
                    Dashboard
                  </Link>
                  <Link
                    href={`/profile/${username}`}
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-text hover:bg-white/[0.05] hover:text-text-strong"
                  >
                    <UserIcon size={14} />
                    My Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2 px-3 py-2 text-danger hover:bg-danger/10 border-t border-border-soft mt-1"
                  >
                    <LogOut size={14} />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/auth/login" className="btn-outline text-[13px] !py-1.5 !px-3">
                Sign in
              </Link>
              <Link href="/auth/signup" className="btn-primary text-[13px] !py-1.5 !px-3">
                Register
              </Link>
            </>
          )}
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
              {user ? (
                <div className="flex flex-col w-full gap-2">
                  <Link
                    href={`/profile/${username}`}
                    onClick={() => setOpen(false)}
                    className="btn-outline text-[13px] text-center"
                  >
                    Profile ({username})
                  </Link>
                  <button onClick={handleLogout} className="btn-primary text-[13px] text-center !bg-danger">
                    Sign out
                  </button>
                </div>
              ) : (
                <>
                  <Link href="/auth/login" className="btn-outline text-[13px] flex-1 text-center">
                    Sign in
                  </Link>
                  <Link href="/auth/signup" className="btn-primary text-[13px] flex-1 text-center">
                    Register
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
