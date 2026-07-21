import Link from "next/link";

export default function SignupPage() {
  return (
    <main className="flex-1 flex items-start justify-center bg-bg px-4 py-12">
      <div className="w-full max-w-[360px]">
        <h1 className="text-[20px] font-semibold text-text-strong text-center mb-1">
          Join ChessArena
        </h1>
        <p className="text-[13px] text-text-muted text-center mb-5">
          Free forever. No ads, ever.
        </p>

        <form className="card p-5 flex flex-col gap-3">
          <div>
            <label className="label-eyebrow block mb-1" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              className="w-full bg-bg-input border border-border rounded-sm px-3 py-2 text-[14px] text-text-strong outline-none focus:border-accent transition-colors"
            />
          </div>

          <div>
            <label className="label-eyebrow block mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="w-full bg-bg-input border border-border rounded-sm px-3 py-2 text-[14px] text-text-strong outline-none focus:border-accent transition-colors"
            />
          </div>

          <div>
            <label className="label-eyebrow block mb-1" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              className="w-full bg-bg-input border border-border rounded-sm px-3 py-2 text-[14px] text-text-strong outline-none focus:border-accent transition-colors"
            />
          </div>

          <label className="flex items-start gap-2 text-[12px] text-text-muted mt-1">
            <input type="checkbox" className="accent-[var(--color-accent)] mt-0.5" />
            I agree to the Terms of Service and confirm I'm human.
          </label>

          <button type="submit" className="btn-primary w-full mt-2 text-center">
            Register
          </button>
        </form>

        <p className="text-center text-[13px] text-text-muted mt-4">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-blue hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
