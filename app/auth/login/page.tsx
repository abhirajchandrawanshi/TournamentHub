import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="flex-1 flex items-start justify-center bg-bg px-4 py-12">
      <div className="w-full max-w-[360px]">
        <h1 className="text-[20px] font-semibold text-text-strong text-center mb-5">
          Sign in
        </h1>

        <form className="card p-5 flex flex-col gap-3">
          <div>
            <label className="label-eyebrow block mb-1" htmlFor="username">
              Username or email
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
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
              className="w-full bg-bg-input border border-border rounded-sm px-3 py-2 text-[14px] text-text-strong outline-none focus:border-accent transition-colors"
            />
          </div>

          <label className="flex items-center gap-2 text-[13px] text-text-muted mt-1">
            <input type="checkbox" className="accent-[var(--color-accent)]" />
            Remember me
          </label>

          <button type="submit" className="btn-primary w-full mt-2 text-center">
            Sign in
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
