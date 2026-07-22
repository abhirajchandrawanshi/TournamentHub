const lessons = [
    { title: "Chess basics", desc: "Learn how each piece moves and the rules of the game." },
    { title: "Openings", desc: "Explore the most common openings and their key ideas." },
    { title: "Tactics", desc: "Practice pins, forks, skewers and combinations." },
    { title: "Endgames", desc: "Master the fundamental endgame techniques." },
];

export default function AboutPage() {
    return (
        <main className="flex-1 bg-bg">
            <div className="max-w-[900px] mx-auto px-4 py-6">
                <h1 className="text-[20px] font-semibold text-text-strong mb-1">Learn chess</h1>
                <p className="text-[13px] text-text-muted mb-6 max-w-[560px]">
                    ChessArena is a free, open platform. No registration required to browse, no ads,
                    ever. Practice at your own pace with lessons built for every level.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                    {lessons.map((l) => (
                        <div key={l.title} className="card p-4 hover:border-accent transition-colors">
                            <h2 className="text-[14px] font-semibold text-text-strong mb-1">{l.title}</h2>
                            <p className="text-[13px] text-text-muted">{l.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="card p-5">
                    <h2 className="label-eyebrow mb-2">About ChessArena</h2>
                    <p className="text-[13px] text-text leading-relaxed">
                        ChessArena is a community-built chess platform focused on tournaments, learning,
                        and fair play. The project is open source and run without advertising, funded by
                        player donations.
                    </p>
                </div>
            </div>
        </main>
    );
}