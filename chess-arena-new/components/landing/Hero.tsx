"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play, Sparkles, Trophy, Users } from "lucide-react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

const floatingCards = [
  { title: "Rating", value: "+42", description: "after your last match" },
  { title: "Players online", value: "18.5k", description: "active right now" },
  { title: "Active tournaments", value: "124", description: "across all time controls" },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-white/5 bg-[radial-gradient(circle_at_top_left,_rgba(129,182,76,0.18),_transparent_28%),linear-gradient(135deg,_#0e0e0e_0%,_#0b0b0b_55%,_#070707_100%)] py-16 text-white sm:py-18 lg:py-20">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:42px_42px] opacity-30" />
      <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-[#81b64c]/15 blur-[120px]" />
      <div className="absolute right-0 top-24 h-72 w-72 rounded-full bg-white/10 blur-[140px]" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[0.98fr_1.02fr] lg:px-8">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#81b64c]/25 bg-[#81b64c]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[#d7efb9]">
            <Sparkles size={14} />
            Modern chess platform
          </div>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Play Chess.
            <span className="block text-[#81b64c]">Compete.</span>
            <span className="block">Become Champion.</span>
          </h1>

          <p className="mt-5 max-w-xl text-base leading-8 text-slate-400 sm:text-lg">
            Play tournaments against players worldwide with a modern chess platform built for speed, clarity, and serious competition.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Button href="/game" variant="primary" size="lg">
              <Play size={16} /> Play Now
            </Button>
            <Button href="/tournament" variant="secondary" size="lg">
              Explore Tournaments <ArrowRight size={16} />
            </Button>
          </div>

          <div className="mt-7 flex flex-wrap gap-3 text-sm text-slate-400">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
              <Trophy size={14} className="text-[#81b64c]" /> Ranked tournaments
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
              <Users size={14} className="text-[#81b64c]" /> Live players worldwide
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.96, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative">
          <div className="relative mx-auto max-w-[640px] rounded-[28px] border border-white/10 bg-[#181818] p-4 shadow-[0_20px_80px_rgba(0,0,0,0.4)] sm:p-5">
            <div className="grid gap-3 sm:grid-cols-[1.05fr_0.95fr]">
              <Card className="p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Featured game</p>
                <p className="mt-2 text-xl font-semibold text-white">Rapid Arena Final</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">Top board action with live tracking and fast progression.</p>
              </Card>
              <Card className="p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Current status</p>
                <p className="mt-2 text-xl font-semibold text-[#d7efb9]">Live</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">1,240 players online</p>
              </Card>
            </div>

            <div className="mt-4 rounded-[24px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(129,182,76,0.12),_transparent_48%),linear-gradient(180deg,_rgba(255,255,255,0.03),_rgba(255,255,255,0.02))] p-3">
              <div className="grid grid-cols-8 gap-1 rounded-[18px] border border-white/10 bg-[#0f0f0f] p-2 shadow-inner shadow-black/30">
                {Array.from({ length: 64 }).map((_, index) => {
                  const row = Math.floor(index / 8);
                  const col = index % 8;
                  const light = (row + col) % 2 === 0;
                  return <div key={index} className={`aspect-square rounded-[6px] ${light ? "bg-[#d8d8c5]" : "bg-[#475e4f]"}`} />;
                })}
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {floatingCards.map((card, index) => (
                <motion.div key={card.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + index * 0.08 }}>
                  <Card className="p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{card.title}</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{card.value}</p>
                    <p className="mt-1 text-sm text-slate-400">{card.description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}