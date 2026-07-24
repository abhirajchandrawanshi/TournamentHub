"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged, updateProfile, User } from "firebase/auth";
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

  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthUser(user);
      if (user) {
        try {
          const res = await api.get<{ user: UserProfile }>("/auth/me");
          if (res.data?.user) {
            setProfile(res.data.user);
            setEditName(res.data.user.name || user.displayName || "");
            setEditUsername(res.data.user.username || user.email?.split("@")[0] || "");
          }
        } catch (err) {
          console.error("Failed to load user profile:", err);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg("");

    try {
      // 1. Update Backend DB
      const res = await api.put("/auth/me", {
        name: editName,
        username: editUsername,
      });

      // 2. Update Firebase Auth Profile
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: editName || editUsername,
        });
      }

      if (res.data?.user) {
        setProfile(res.data.user);
      }

      setShowEditModal(false);
    } catch (err: any) {
      console.error("Failed to save profile:", err);
      setErrorMsg(err?.response?.data?.detail || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const username = profile?.username || profile?.name || authUser?.displayName || authUser?.email?.split("@")[0] || "Player";
  const userEmail = profile?.email || authUser?.email || "";
  const rating = profile?.rating || 1200;
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
            <button
              onClick={() => setShowEditModal(true)}
              className="btn-outline text-[13px]"
            >
              Edit profile
            </button>
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

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="card w-full max-w-[420px] p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[16px] font-semibold text-text-strong">Edit Profile</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-text-muted hover:text-text-strong text-[18px]"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="mb-3 p-2.5 bg-danger/10 border border-danger/30 rounded-sm text-danger text-[12px]">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div>
                <label className="label-eyebrow block mb-1">Display Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-bg-input border border-border rounded-sm px-3 py-2 text-[14px] text-text-strong outline-none focus:border-accent"
                  placeholder="e.g. Adi Sharma"
                />
              </div>

              <div>
                <label className="label-eyebrow block mb-1">Username (@handle)</label>
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full bg-bg-input border border-border rounded-sm px-3 py-2 text-[14px] text-text-strong outline-none focus:border-accent"
                  placeholder="e.g. adi_sharma"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="btn-outline flex-1 text-[13px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary flex-1 text-[13px] disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
