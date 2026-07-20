"use client";

import { motion } from "framer-motion";
import {
  Trophy,
  ShieldCheck,
  Wallet,
  Users,
  Clock3,
  Swords,
} from "lucide-react";

const features = [
  {
    icon: Trophy,
    title: "Competitive Tournaments",
    description:
      "Join daily, weekly and premium tournaments with exciting prize pools.",
  },
  {
    icon: Swords,
    title: "Real-Time Chess",
    description:
      "Play live multiplayer chess with instant move synchronization.",
  },
  {
    icon: Wallet,
    title: "Secure Wallet",
    description:
      "Deposit, withdraw and track every transaction securely.",
  },
  {
    icon: Users,
    title: "Global Community",
    description:
      "Challenge players from around the world and improve your rating.",
  },
  {
    icon: ShieldCheck,
    title: "Fair Play",
    description:
      "Advanced anti-cheat monitoring ensures a fair competitive environment.",
  },
  {
    icon: Clock3,
    title: "Multiple Time Controls",
    description:
      "Bullet, Blitz, Rapid and Classical formats for every player.",
  },
];

export default function Features() {
  return (
    <section className="bg-slate-950 py-24 text-white">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-14 text-center"
        >
          <h2 className="text-4xl font-bold md:text-5xl">
            Why Choose{" "}
            <span className="text-emerald-400">ChessArena?</span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-gray-400">
            Built for professional chess players, tournament organizers,
            and competitive gaming enthusiasts.
          </p>
        </motion.div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: index * 0.1,
                  duration: 0.5,
                }}
                className="group rounded-2xl border border-white/10 bg-white/5 p-8 transition hover:-translate-y-2 hover:border-emerald-500 hover:bg-slate-900"
              >
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                  <Icon size={30} />
                </div>

                <h3 className="mb-4 text-2xl font-semibold">
                  {feature.title}
                </h3>

                <p className="leading-7 text-gray-400">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}