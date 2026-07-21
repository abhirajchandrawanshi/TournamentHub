"use client";

import { motion } from "framer-motion";
import { CalendarDays, Clock3, Trophy, Users } from "lucide-react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import SectionHeading from "@/components/ui/SectionHeading";

const tournaments = [
  { name: "Blitz Arena", prize: "₹10,000", players: "128 players", time: "10 min", status: "LIVE" },
  { name: "Rapid Masters", prize: "₹25,000", players: "256 players", time: "Starts in 30m", status: "UPCOMING" },
  { name: "Classic Knockout", prize: "₹50,000", players: "512 players", time: "30+20", status: "LIVE" },
];

export default function LiveTournament() {
  return (
    <section className="border-t border-white/5 bg-[#0b0b0b] py-20 text-white sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Featured tournament"
          title={<>A live event surface that stays simple and clear.</>}
          description="Tournament cards are compact, readable, and optimized for quick scanning across desktop and mobile."
        />

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {tournaments.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.35, delay: index * 0.08 }}
              whileHover={{ y: -4, scale: 1.01 }}
            >
              <Card className="h-full p-6">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  <span className={`rounded-full px-3 py-1 ${item.status === "LIVE" ? "bg-[#81b64c]/10 text-[#d8f1b9]" : "bg-white/5 text-slate-300"}`}>
                    {item.status}
                  </span>
                  <span className="inline-flex items-center gap-1 normal-case tracking-normal">
                    <Clock3 size={14} /> {item.time}
                  </span>
                </div>

                <h3 className="mt-6 text-2xl font-semibold text-white">{item.name}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-400">
                  A polished event card that keeps key details visible without overwhelming the layout.
                </p>

                <div className="mt-6 space-y-3 text-sm text-slate-300">
                  <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                    <span className="inline-flex items-center gap-2"><Trophy size={16} className="text-[#81b64c]" /> Prize pool</span>
                    <strong className="text-white">{item.prize}</strong>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                    <span className="inline-flex items-center gap-2"><Users size={16} className="text-[#81b64c]" /> Players</span>
                    <strong className="text-white">{item.players}</strong>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                    <span className="inline-flex items-center gap-2"><CalendarDays size={16} className="text-[#81b64c]" /> Format</span>
                    <strong className="text-white">{item.time}</strong>
                  </div>
                </div>

                <div className="mt-6">
                  <Button href="/tournament" variant="primary" size="md" className="w-full">
                    Join event
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}