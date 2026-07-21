"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import Button from "@/components/ui/Button";

const links = [
    { name: "Home", href: "/" },
    { name: "Play", href: "/game" },
    { name: "Tournament", href: "/tournament" },
    { name: "Leaderboard", href: "/leaderboard" },
    { name: "About", href: "/about" },
];

export default function MobileMenu({ close }: { close: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="border-t border-white/10 bg-[#0b0b0b] lg:hidden"
        >
            <div className="mx-auto grid max-w-7xl gap-2 px-4 py-4 sm:px-6 lg:px-8">
                {links.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={close}
                        className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
                    >
                        {item.name}
                    </Link>
                ))}

                <div className="mt-2 grid grid-cols-2 gap-3">
                    <Button href="/auth/login" variant="ghost" size="sm" className="w-full" onClick={close}>
                        Login
                    </Button>
                    <Button href="/auth/signup" variant="primary" size="sm" className="w-full" onClick={close}>
                        Register
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}