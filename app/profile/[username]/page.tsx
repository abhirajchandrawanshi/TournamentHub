"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import api from "@/lib/axios";

interface ProfileData {
  username: string;
  name: string;
  rating: number;
  avatar?: string | null;
}

export default function ProfilePage() {
  const params = useParams();
  const rawUsername = params?.username as string;
  const username = rawUsername ? decodeURIComponent(rawUsername) : "Player";

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await api.get<ProfileData[] | ProfileData>("/leaderboard");
        if (Array.isArray(res.data)) {
          const match = res.data.find(
            (u) => u.username?.toLowerCase() === username.toLowerCase() || u.name?.toLowerCase() === username.toLowerCase()
          );
          if (match) setProfile(match);
        }
      } catch (err) {
        console.error("Profile load note:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [username]);

  const initials = username.slice(0, 2).toUpperCase();
  const rating = profile?.rating || 1500;

  const ratings = [
    { mode: "Bullet", value: rating },
    { mode: "Blitz", value: rating },
    { mode: "Rapid", value: rating },
    { mode: "Classical", value: rating },
  ];

  if (loading) {
    return (
      <main className="flex-1 bg-bg flex items-center justify-center p-8 text-[13px] text-text-muted">
        Loading user profile...
      </main>
    );
  }

  return (
    <main className="flex-1 bg-bg">
      <div className="max-w-[700px] mx-auto px-4 py-6">
        <div className="card p-5 flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-full bg-accent-soft border border-accent flex items-center justify-center text-[20px] font-bold text-accent shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <h1 className="text-[19px] font-semibold text-text-strong truncate">{profile?.name || username}</h1>
            <p className="text-[13px] text-text-muted">@{username} &middot; ChessArena member</p>
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