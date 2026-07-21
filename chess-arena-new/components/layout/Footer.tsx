import Link from "next/link";

import Container from "@/components/ui/Container";

const footerLinks = [
    { label: "Home", href: "/" },
    { label: "Play", href: "/game" },
    { label: "Tournament", href: "/tournament" },
    { label: "Leaderboard", href: "/leaderboard" },
    { label: "About", href: "/about" },
];

export default function Footer() {
    return (
        <footer className="border-t border-white/10 bg-[#090909] text-slate-400">
            <Container className="py-14">
                <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
                    <div>
                        <p className="text-lg font-semibold text-white">ChessArena</p>
                        <p className="mt-4 max-w-md text-sm leading-7 text-slate-400">
                            A minimal chess platform with a modern interface, focused competition, and a premium product feel.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">Explore</h3>
                        <div className="mt-4 grid gap-3 text-sm">
                            {footerLinks.map((item) => (
                                <Link key={item.href} href={item.href} className="transition hover:text-white">
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">Design</h3>
                        <div className="mt-4 space-y-3 text-sm leading-7 text-slate-400">
                            <p>Responsive layout</p>
                            <p>Dark, minimal aesthetic</p>
                            <p>Reusable UI components</p>
                            <p>Framer Motion interactions</p>
                        </div>
                    </div>
                </div>

                <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
                    <p>© {new Date().getFullYear()} ChessArena. All rights reserved.</p>
                    <p>Built for focused play and competitive clarity.</p>
                </div>
            </Container>
        </footer>
    );
}
