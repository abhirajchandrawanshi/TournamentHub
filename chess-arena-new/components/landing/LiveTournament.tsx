"use client";

import { motion } from "framer-motion";
import { Calendar, Trophy, Users, ArrowRight } from "lucide-react";

const tournaments = [
  {
    id: 1,
    title: "Sunday Blitz Championship",
    prize: "₹10,000",
    entry: "₹99",
    players: 128,
    status: "LIVE",
  },
  {
    id: 2,
    title: "Rapid Masters Cup",
    prize: "₹25,000",
    entry: "₹199",
    players: 256,
    status: "UPCOMING",
  },
  {
    id: 3,
    title: "Arena Knockout",
    prize: "₹50,000",
    entry: "₹499",
    players: 512,
    status: "LIVE",
  },
];

export default function LiveTournament() {
  return (
    <section className="bg-black py-24 text-white">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="text-4xl font-bold md:text-5xl">
            Live <span className="text-emerald-400">Tournaments</span>
          </h2>

          <p className="mt-4 text-gray-400">
            Join ongoing competitions and win exciting rewards.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {tournaments.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="rounded-2xl border border-white/10 bg-slate-900 p-6 transition hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/10"
            >
              <div className="mb-5 flex items-center justify-between">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    item.status === "LIVE"
                      ? "bg-red-500/20 text-red-400"
                      : "bg-blue-500/20 text-blue-400"
                  }`}
                >
                  {item.status}
                </span>

                <Calendar className="text-gray-400" size={18} />
              </div>

              <h3 className="mb-6 text-2xl font-bold">{item.title}</h3>

              <div className="space-y-4 text-gray-300">
                <div className="flex items-center gap-3">
                  <Trophy className="text-yellow-400" size={18} />
                  Prize Pool: <strong>{item.prize}</strong>
                </div>

                <div className="flex items-center gap-3">
                  <Users className="text-emerald-400" size={18} />
                  Players: <strong>{item.players}</strong>
                </div>

                <div>
                  Entry Fee: <strong>{item.entry}</strong>
                </div>
              </div>

              <button className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 font-semibold transition hover:bg-emerald-600">
                Join Tournament
                <ArrowRight size={18} />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}