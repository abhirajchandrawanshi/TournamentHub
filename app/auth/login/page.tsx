"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { authService } from "@/services/auth.service";

export default function LoginPage() {
  const router = useRouter();
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authService.login({ usernameOrEmail, password });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const googleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await authService.googleLogin();
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.response?.data?.message || err?.message || "Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 flex items-start justify-center bg-bg px-4 py-12">
      <div className="w-full max-w-[360px]">
        <h1 className="text-[20px] font-semibold text-text-strong text-center mb-5">
          Sign in
        </h1>

        <form onSubmit={handleSubmit} className="card p-5 flex flex-col gap-3">
          {error && (
            <div className="text-[12px] text-danger bg-danger/10 border border-danger rounded-sm px-3 py-2">
              {error}
            </div>
          )}

          <div>
            <label className="label-eyebrow block mb-1" htmlFor="username">
              Username or email
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              className="w-full bg-bg-input border border-border rounded-sm px-3 py-2 text-[14px] text-text-strong outline-none focus:border-accent transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="label-eyebrow" htmlFor="password">
                Password
              </label>
              <Link href="/auth/forgot-password" className="text-[12px] text-blue hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-bg-input border border-border rounded-sm px-3 py-2 text-[14px] text-text-strong outline-none focus:border-accent transition-colors"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full mt-2 text-center disabled:opacity-60">
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <div className="flex items-center gap-2 my-1">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[11px] text-text-muted">OR</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <button
            type="button"
            onClick={() => googleLogin()}
            disabled={loading}
            className="btn-outline w-full flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <svg width="16" height="16" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.9-2.26 5.36-4.78 7.02l7.73 6c4.51-4.18 7.09-10.36 7.09-17.49z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            <span className="text-[13px]">Continue with Google</span>
          </button>
        </form>

        <p className="text-center text-[13px] text-text-muted mt-4">
          New to ChessArena?{" "}
          <Link href="/auth/signup" className="text-blue hover:underline">
            Register
          </Link>
        </p>
      </div>
    </main>
  );
}