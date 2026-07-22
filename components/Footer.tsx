const columns = [
  {
    title: "ChessArena",
    links: ["About", "Source code", "Blog", "Contact"],
  },
  {
    title: "Play",
    links: ["Create a game", "Tournaments", "Simultaneous exhibitions", "Leaderboard"],
  },
  {
    title: "Community",
    links: ["Players", "Teams", "Forum", "Streamers"],
  },
  {
    title: "About",
    links: ["Terms of service", "Privacy", "Ads", "FAQ"],
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
                <li key={l}>
                  <a href="#" className="text-[13px] text-text hover:text-text-strong">
                    {l}
                  </a>
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
