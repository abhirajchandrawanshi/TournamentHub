import Link from "next/link";

const columns = [
  {
    title: "ChessArena",
    links: [
      { name: "About", href: "/about" },
      { name: "Source code", href: "https://github.com/abhirajchandrawanshi/TournamentHub" },
      { name: "Blog", href: "/about" },
      { name: "Contact", href: "/about" },
    ],
  },
  {
    title: "Play",
    links: [
      { name: "Create a game", href: "/game" },
      { name: "Tournaments", href: "/tournament" },
      { name: "Simultaneous exhibitions", href: "/tournament" },
      { name: "Leaderboard", href: "/leaderboard" },
    ],
  },
  {
    title: "Community",
    links: [
      { name: "Players", href: "/leaderboard" },
      { name: "Teams", href: "/tournament" },
      { name: "Forum", href: "/about" },
      { name: "Streamers", href: "/leaderboard" },
    ],
  },
  {
    title: "About",
    links: [
      { name: "Terms of service", href: "/about" },
      { name: "Privacy", href: "/about" },
      { name: "Ads", href: "/about" },
      { name: "FAQ", href: "/about" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-border-soft bg-bg-card-soft">
      <div className="max-w-[1100px] mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="label-eyebrow mb-3">{col.title}</h4>
            <ul className="space-y-2">
              {col.links.map((l) => (
                <li key={l.name}>
                  <Link href={l.href} className="text-[13px] text-text hover:text-text-strong transition-colors">
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="max-w-[1100px] mx-auto px-4 pb-8 text-[12px] text-text-muted">
        ChessArena is a free, open platform for chess tournaments. Not affiliated with Lichess.
      </div>
    </footer>
  );
}
