"use client";

import { motion } from "framer-motion";
import { Flame, ShieldCheck, Sparkles, Swords, Trophy, Users } from "lucide-react";

import Card from "@/components/ui/Card";
import SectionHeading from "@/components/ui/SectionHeading";

const features = [
    {
        icon: Swords,
        title: "Fast competitive play",
        description: "Smooth, low-friction chess sessions designed for blitz, rapid, and longer formats.",
    },
    {
        icon: Trophy,
        title: "Tournament-first design",
        description: "Built around events, ladders, and structured competition rather than cluttered dashboards.",
    },
    {
        icon: Users,
        title: "Global player base",
        description: "A social, active platform where players can discover opponents and live events quickly.",
    },
    {
        icon: ShieldCheck,
        title: "Fair play mindset",
        description: "Clear user flows and strong interface hierarchy help keep the experience focused and readable.",
    },
    {
        icon: Sparkles,
        title: "Modern interactions",
        description: "Subtle motion, premium spacing, and card-based layouts keep the experience polished.",
    },
    {
        icon: Flame,
        title: "Always active",
        description: "Live activity surfaces keep the platform feeling current and competitive at all times.",
    },
];

export default function Features() {
    return (
        <section className="border-t border-white/5 bg-[#0b0b0b] py-20 text-white sm:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <SectionHeading
                    eyebrow="Why choose us"
                    align="center"
                    title={<>Minimal by design. Competitive by default.</>}
                    description="A professional chess platform should feel fast, confident, and distraction-free."
                />

                <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;

                        return (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-60px" }}
                                transition={{ duration: 0.35, delay: index * 0.06 }}
                                whileHover={{ y: -4, scale: 1.01 }}
                            >
                                <Card className="h-full p-6">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#81b64c]/20 bg-[#81b64c]/10 text-[#bfe69b]">
                                        <Icon size={22} />
                                    </div>
                                    <h3 className="mt-5 text-xl font-semibold text-white">{feature.title}</h3>
                                    <p className="mt-3 text-sm leading-7 text-slate-400">{feature.description}</p>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
