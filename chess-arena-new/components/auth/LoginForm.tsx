"use client";

import Link from "next/link";

export default function LoginForm() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">

      <div className="w-full max-w-md bg-[#141922] border border-gray-800 rounded-2xl p-8">

        <h1 className="text-3xl font-bold text-center">
          Welcome Back
        </h1>

        <p className="text-gray-400 text-center mt-2">
          Login to ChessArena
        </p>

        <form className="mt-8 space-y-5">

          <input
            type="email"
            placeholder="Email"
            className="w-full p-4 rounded-xl bg-[#0B0D12] border border-gray-700 outline-none"
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-4 rounded-xl bg-[#0B0D12] border border-gray-700 outline-none"
          />

          <button
            className="w-full bg-green-500 hover:bg-green-400 text-black font-bold p-4 rounded-xl"
          >
            Login
          </button>

        </form>

        <div className="mt-6 text-center">

          <Link
            href="/auth/forgot-password"
            className="text-green-400"
          >
            Forgot Password?
          </Link>

        </div>

        <div className="text-center mt-6">

          <span className="text-gray-400">
            Don't have an account?
          </span>

          <Link
            href="/auth/signup"
            className="text-green-400 ml-2"
          >
            Sign Up
          </Link>

        </div>

      </div>

    </div>
  );
}