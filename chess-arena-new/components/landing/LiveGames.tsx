"use client";

import { motion } from "framer-motion";
import { Clock3, CirclePlay, Users } from "lucide-react";

import Card from "@/components/ui/Card";
import SectionHeading from "@/components/ui/SectionHeading";

const games = [
    {
        playerOne: "A. Sharma",
        playerTwo: "R. Mehta",
        time: "3+2",
        viewers: "2.4k",
        state: "Blitz endgame",
    },
    {
        playerOne: "N. Rao",
        playerTwo: "S. Khan",
        time: "10+0",
        viewers: "1.8k",
        state: "Opening theory",
    },
    {
        playerOne: "M. Das",
        playerTwo: "P. Iyer",
        time: "15+10",
        viewers: "986",
        state: "Strategic middlegame",
    },
];

export default function LiveGames() {
    return (
        <section className="border-t border-white/5 bg-[#0b0b0b] py-20 text-white sm:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <SectionHeading
                    eyebrow="Live games"
                    title={<>Watch current games unfold in real time.</>}
                    description="A clean real-time experience with minimal visual noise, focused on active play and rapid discovery."
                />

                <div className="mt-10 grid gap-5 md:grid-cols-3">
                    {games.map((game, index) => (
                        <motion.div
                            key={game.playerOne + game.playerTwo}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-60px" }}
                            transition={{ duration: 0.35, delay: index * 0.08 }}
                            whileHover={{ y: -4, scale: 1.01 }}
                        >
                            <Card className="h-full p-5">
                                <div className="flex items-center justify-between text-xs text-slate-400">
                                    <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-slate-200">
                                        <CirclePlay size={14} className="text-[#81b64c]" />
                                        Live
                                    </span>
                                    <span className="inline-flex items-center gap-1">
                                        <Users size={14} />
                                        {game.viewers}
                                    </span>
                                </div>

                                <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-5">
                                    <div>
                                        <p className="text-sm text-slate-400">White</p>
                                        <p className="mt-1 text-lg font-semibold text-white">{game.playerOne}</p>
                                    </div>
                                    <div className="rounded-full border border-white/10 bg-[#81b64c]/10 px-3 py-1 text-sm text-[#d8f1b9]">
                                        VS
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-slate-400">Black</p>
                                        <p className="mt-1 text-lg font-semibold text-white">{game.playerTwo}</p>
                                    </div>
                                </div>

                                <div className="mt-5 flex items-center justify-between text-sm text-slate-400">
                                    <span className="inline-flex items-center gap-2">
                                        <Clock3 size={14} className="text-[#81b64c]" />
                                        {game.time}
                                    </span>
                                    <span>{game.state}</span>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
