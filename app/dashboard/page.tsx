"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import api from "@/lib/axios";

interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  rating: number;
  avatar: string | null;
}

export default function DashboardPage() {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthUser(user);
      if (user) {
        try {
          const res = await api.get<{ user: UserProfile }>("/auth/me");
          if (res.data?.user) {
            setProfile(res.data.user);
          }
        } catch (err) {
          console.error("Failed to load user profile:", err);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const username = profile?.username || profile?.name || authUser?.displayName || authUser?.email?.split("@")[0] || "Player";
  const userEmail = profile?.email || authUser?.email || "";
  const rating = profile?.rating || 1500;
  const initials = username.slice(0, 2).toUpperCase();

  const ratings = [
    { mode: "Bullet", value: rating, games: 0 },
    { mode: "Blitz", value: rating, games: 0 },
    { mode: "Rapid", value: rating, games: 0 },
    { mode: "Classical", value: rating, games: 0 },
  ];

  if (loading) {
    return (
      <main className="flex-1 bg-bg flex items-center justify-center p-8 text-[13px] text-text-muted">
        Loading dashboard profile...
      </main>
    );
  }

  return (
    <main className="flex-1 bg-bg">
      <div className="max-w-[1000px] mx-auto px-4 py-6">
        {/* Profile header */}
        <div className="card p-5 flex flex-col sm:flex-row sm:items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-full bg-accent-soft border border-accent flex items-center justify-center text-[22px] font-bold text-accent shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <h1 className="text-[19px] font-semibold text-text-strong">{username}</h1>
            <p className="text-[13px] text-text-muted">{userEmail ? `${userEmail} \u00b7 ` : ""}ChessArena Member</p>
          </div>
          <div className="sm:ml-auto flex gap-2">
            <Link href="/game" className="btn-primary text-[13px]">
              Play Game
            </Link>
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
          <div className="px-4 py-3 border-b border-border-soft flex items-center justify-between">
            <h2 className="label-eyebrow">Recent games</h2>
            <Link href="/game" className="text-[12px] text-blue hover:underline">Start game »</Link>
          </div>
          <div className="p-6 text-center text-[13px] text-text-muted">
            No games recorded yet. Start a new live game at <Link href="/game" className="text-accent font-semibold hover:underline">/game</Link>!
          </div>
        </div>
      </div>
    </main>
  );
}
