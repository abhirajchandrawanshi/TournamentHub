"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import api from "@/lib/axios";

interface RecentGame {
  id: string;
  opponent: string;
  result: "Won" | "Lost" | "Draw";
  mode: string;
  moves: number;
  created_at: string;
}

interface ProfileData {
  id: string;
  name: string;
  username: string;
  rating: number;
  avatar: string | null;
  created_at?: string;
  recent_games?: RecentGame[];
}

export default function ProfilePage() {
  const params = useParams();
  const rawUsername = params?.username as string;
  const username = rawUsername ? decodeURIComponent(rawUsername) : "Player";

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  
  // Edit profile state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await api.get<ProfileData>(`/users/${encodeURIComponent(username)}`);
        if (res.data) {
          setProfile(res.data);
          setEditName(res.data.name || "");
          setEditUsername(res.data.username || "");
        }
      } catch (err) {
        console.error("Profile load note:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [username]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        const myHandle = currentUser.displayName || currentUser.email?.split("@")[0];
        if (
          myHandle?.toLowerCase() === username.toLowerCase() ||
          profile?.id === currentUser.uid
        ) {
          setIsOwnProfile(true);
        }
      }
    });
    return () => unsubscribe();
  }, [username, profile]);

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
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                name: res.data.user.name,
                username: res.data.user.username,
              }
            : null
        );
      }

      setShowEditModal(false);
    } catch (err: any) {
      console.error("Failed to save profile:", err);
      setErrorMsg(err?.response?.data?.detail || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const displayName = profile?.name || username;
  const handleName = profile?.username || username;
  const initials = displayName.slice(0, 2).toUpperCase();
  const rating = profile?.rating || 1200;

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
      <div className="max-w-[800px] mx-auto px-4 py-6">
        {/* Profile Card */}
        <div className="card p-5 flex flex-col sm:flex-row sm:items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-full bg-accent-soft border border-accent flex items-center justify-center text-[22px] font-bold text-accent shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-[20px] font-semibold text-text-strong truncate">{displayName}</h1>
            <p className="text-[13px] text-text-muted">
              @{handleName} &middot; ChessArena member
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            {isOwnProfile ? (
              <button
                onClick={() => setShowEditModal(true)}
                className="btn-outline text-[13px]"
              >
                Edit profile
              </button>
            ) : (
              <Link href="/game" className="btn-primary text-[13px]">
                Challenge
              </Link>
            )}
          </div>
        </div>

        {/* Ratings Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {ratings.map((r) => (
            <div key={r.mode} className="card p-4 text-center">
              <div className="label-eyebrow mb-1">{r.mode}</div>
              <div className="text-[24px] font-bold text-text-strong">{r.value}</div>
            </div>
          ))}
        </div>

        {/* Recent Games */}
        <div className="card p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-border-soft flex items-center justify-between">
            <h2 className="label-eyebrow">Recent Games</h2>
            <Link href="/game" className="text-[12px] text-blue hover:underline">Play match »</Link>
          </div>
          {profile?.recent_games && profile.recent_games.length > 0 ? (
            <div className="divide-y divide-border-soft">
              {profile.recent_games.map((g) => (
                <div key={g.id} className="flex items-center justify-between px-4 py-3 text-[13px] hover:bg-white/[0.03]">
                  <span className={`w-14 font-semibold ${g.result === "Won" ? "text-accent" : g.result === "Lost" ? "text-danger" : "text-text-muted"}`}>
                    {g.result}
                  </span>
                  <span className="flex-1 text-text-strong truncate px-2">vs {g.opponent}</span>
                  <span className="text-text-muted w-28 text-right font-mono">{g.mode}</span>
                  <span className="text-text-muted w-20 text-right">{g.moves} moves</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-[13px] text-text-muted">
              No recent games played yet. Challenge a friend or play AI at <Link href="/game" className="text-accent hover:underline">/game</Link>!
            </div>
          )}
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