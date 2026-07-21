"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";

import Button from "@/components/ui/Button";

export default function CTA() {
    return (
        <section className="border-t border-white/5 bg-[#0b0b0b] py-20 text-white sm:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.35 }}
                    className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(129,182,76,0.18),_transparent_38%),linear-gradient(180deg,_rgba(255,255,255,0.04),_rgba(255,255,255,0.02))] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.25)] sm:p-10"
                >
                    <div className="max-w-3xl">
                        <p className="text-sm uppercase tracking-[0.28em] text-[#bfe69b]">Get started</p>
                        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                            Ready to play with a sharper, cleaner chess experience?
                        </h2>
                        <p className="mt-4 text-base leading-7 text-slate-400">
                            Build your account, jump into live games, and explore tournaments in a product that feels intentional from the first click.
                        </p>
                    </div>

                    <div className="mt-8 flex flex-wrap gap-3">
                        <Button href="/game" variant="primary" size="lg">
                            <Play size={16} /> Play now
                        </Button>
                        <Button href="/tournament" variant="secondary" size="lg">
                            Explore tournaments <ArrowRight size={16} />
                        </Button>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
