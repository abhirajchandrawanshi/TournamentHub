"use client";

import { motion } from "framer-motion";
import { ChevronRight, Crown } from "lucide-react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import SectionHeading from "@/components/ui/SectionHeading";

const players = [
    { rank: 1, name: "Aryan Sharma", rating: 2842, country: "India" },
    { rank: 2, name: "Riya Gupta", rating: 2816, country: "India" },
    { rank: 3, name: "Aditya Singh", rating: 2799, country: "India" },
    { rank: 4, name: "Neha Patel", rating: 2763, country: "India" },
    { rank: 5, name: "Rahul Verma", rating: 2748, country: "India" },
];

export default function Leaderboard() {
    return (
        <section className="border-t border-white/5 bg-[#090909] py-20 text-white sm:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
                    <div>
                        <SectionHeading
                            eyebrow="Leaderboard"
                            title={<>Follow the strongest players on the platform.</>}
                            description="A compact leaderboard preview that feels premium, readable, and built for competitive chess."
                        />
                        <div className="mt-8">
                            <Button href="/leaderboard" variant="primary">
                                View full rankings <ChevronRight size={16} />
                            </Button>
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-60px" }}
                        transition={{ duration: 0.35 }}
                    >
                        <Card className="overflow-hidden">
                            <div className="border-b border-white/10 bg-white/[0.03] px-5 py-4 text-sm text-slate-400">
                                Top rated players this week
                            </div>
                            <div className="divide-y divide-white/10">
                                {players.map((player, index) => (
                                    <div key={player.rank} className="grid grid-cols-[auto_1fr_auto] items-center gap-4 px-5 py-4 transition hover:bg-white/[0.03]">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-sm font-semibold text-white">
                                            {player.rank === 1 ? <Crown size={16} className="text-[#81b64c]" /> : player.rank}
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">{player.name}</p>
                                            <p className="text-sm text-slate-400">{player.country}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-slate-400">Rating</p>
                                            <p className="font-semibold text-[#d8f1b9]">{player.rating}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
