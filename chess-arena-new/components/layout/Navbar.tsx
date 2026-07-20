"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Trophy, X } from "lucide-react";
import { useEffect, useState } from "react";

import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";

const navItems = [
    { name: "Home", href: "/" },
    { name: "Play", href: "/game" },
    { name: "Tournament", href: "/tournament" },
    { name: "Leaderboard", href: "/leaderboard" },
    { name: "About", href: "/about" },
];

export default function Navbar() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 12);
        onScroll();
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        setOpen(false);
    }, [pathname]);

    return (
        <header className={`fixed inset-x-0 top-0 z-50 border-b border-white/5 transition-all duration-300 ${scrolled ? "bg-[#0b0b0b]/92 shadow-lg shadow-black/20 backdrop-blur-xl" : "bg-[#0b0b0b]/80 backdrop-blur-xl"}`}>
            <Container>
                <div className="flex h-20 items-center justify-between gap-4">
                    <Link href="/" className="group flex items-center gap-3 text-white">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#81b64c]/30 bg-[#81b64c]/10 shadow-[0_0_30px_rgba(129,182,76,0.18)] transition group-hover:border-[#81b64c]/50 group-hover:bg-[#81b64c]/15">
                            <Trophy className="text-[#81b64c]" size={20} />
                        </div>
                        <div className="leading-tight">
                            <p className="text-lg font-semibold tracking-wide sm:text-xl">ChessArena</p>
                            <p className="text-[10px] uppercase tracking-[0.32em] text-slate-400">Live chess hub</p>
                        </div>
                    </Link>

                    <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 lg:flex">
                        {navItems.map((item) => {
                            const active = pathname === item.href;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`relative rounded-full px-4 py-2 text-sm font-medium transition ${active ? "bg-[#81b64c]/15 text-[#d8f1b9]" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}
                                >
                                    {item.name}
                                    {active && <motion.span layoutId="navbar-active" className="absolute inset-0 -z-10 rounded-full border border-[#81b64c]/25 bg-[#81b64c]/10" />}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="hidden items-center gap-3 lg:flex">
                        <Button href="/auth/login" variant="ghost" size="sm">Login</Button>
                        <Button href="/auth/signup" variant="primary" size="sm">Register</Button>
                    </div>

                    <button
                        onClick={() => setOpen((value) => !value)}
                        className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 p-2 text-white transition hover:bg-white/10 lg:hidden"
                        aria-label="Toggle navigation menu"
                        aria-expanded={open}
                    >
                        {open ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </Container>

            <AnimatePresence>
                {open ? (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.18 }}
                        className="border-t border-white/10 bg-[#0b0b0b]/98 lg:hidden"
                    >
                        <Container className="py-4">
                            <div className="grid gap-2 rounded-3xl border border-white/10 bg-white/[0.03] p-3">
                                {navItems.map((item) => {
                                    const active = pathname === item.href;

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${active ? "bg-[#81b64c]/15 text-[#d8f1b9]" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}
                                        >
                                            {item.name}
                                        </Link>
                                    );
                                })}

                                <div className="mt-2 grid grid-cols-2 gap-3">
                                    <Button href="/auth/login" variant="ghost" size="sm" className="w-full">Login</Button>
                                    <Button href="/auth/signup" variant="primary" size="sm" className="w-full">Register</Button>
                                </div>
                            </div>
                        </Container>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </header>
    );
}
