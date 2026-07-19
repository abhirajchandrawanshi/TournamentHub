"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play, Trophy, Users, Swords } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-black to-slate-900 text-white">
      {/* Background Blur */}
      <div className="absolute -top-32 left-0 h-96 w-96 rounded-full bg-emerald-500/20 blur-[140px]" />
      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-blue-500/20 blur-[140px]" />

      {/* Navbar */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link
          href="/"
          className="text-3xl font-extrabold tracking-wide text-emerald-400"
        >
          ChessArena
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <Link href="#" className="hover:text-emerald-400">
            Home
          </Link>

          <Link href="#" className="hover:text-emerald-400">
            Tournaments
          </Link>

          <Link href="#" className="hover:text-emerald-400">
            Leaderboard
          </Link>

          <Link href="#" className="hover:text-emerald-400">
            About
          </Link>
        </div>

        <div className="flex gap-3">
          <button className="rounded-lg border border-white/20 px-5 py-2 hover:bg-white/10">
            Login
          </button>

          <button className="rounded-lg bg-emerald-500 px-5 py-2 font-semibold hover:bg-emerald-600">
            Sign Up
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="mx-auto grid min-h-[85vh] max-w-7xl items-center gap-14 px-6 lg:grid-cols-2">
        {/* Left */}

        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .8 }}
        >
          <span className="rounded-full bg-emerald-500/20 px-4 py-2 text-sm text-emerald-400">
            ♟ India's Competitive Chess Platform
          </span>

          <h1 className="mt-8 text-5xl font-extrabold leading-tight lg:text-7xl">
            Play.
            <span className="text-emerald-400"> Compete.</span>
            <br />
            Win Real Tournaments.
          </h1>

          <p className="mt-6 max-w-xl text-lg text-gray-300">
            Join live chess tournaments, challenge players worldwide,
            climb leaderboards, earn rewards and become the next champion.
          </p>

          <div className="mt-10 flex flex-wrap gap-5">
            <button className="flex items-center gap-2 rounded-xl bg-emerald-500 px-7 py-4 font-semibold hover:bg-emerald-600">
              Get Started
              <ArrowRight size={18} />
            </button>

            <button className="flex items-center gap-2 rounded-xl border border-white/20 px-7 py-4 hover:bg-white/10">
              <Play size={18} />
              Watch Demo
            </button>
          </div>

          {/* Stats */}

          <div className="mt-14 grid grid-cols-3 gap-6">
            <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur">
              <Users className="mb-3 text-emerald-400" />
              <h2 className="text-3xl font-bold">20K+</h2>
              <p className="text-sm text-gray-400">Players</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur">
              <Trophy className="mb-3 text-yellow-400" />
              <h2 className="text-3xl font-bold">120+</h2>
              <p className="text-sm text-gray-400">Tournaments</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur">
              <Swords className="mb-3 text-blue-400" />
              <h2 className="text-3xl font-bold">1M+</h2>
              <p className="text-sm text-gray-400">Matches</p>
            </div>
          </div>
        </motion.div>

        {/* Right */}

        <motion.div
          initial={{ opacity: 0, scale: .8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: .8 }}
          className="flex justify-center"
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-emerald-500/30 blur-[120px]" />

            <div className="relative flex h-[520px] w-[520px] items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur">
              <span className="text-[220px]">
                ♞
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}