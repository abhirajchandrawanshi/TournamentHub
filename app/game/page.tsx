import ChessBoard from "@/components/ChessBoard";

const moves = [
  ["e4", "e5"], ["Nf3", "Nc6"], ["Bb5", "a6"], ["Ba4", "Nf6"],
  ["O-O", "Be7"], ["Re1", "b5"], ["Bb3", "d6"], ["c3", "O-O"],
];

function PlayerRow({
  name,
  rating,
  color,
  clock,
  active,
}: {
  name: string;
  rating: number;
  color: "w" | "b";
  clock: string;
  active?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-3 py-2.5 card">
      <div className="flex items-center gap-2 min-w-0">
        <span
          className="w-3 h-3 rounded-full border border-border-soft shrink-0"
          style={{ background: color === "w" ? "#f0eeec" : "#232323" }}
        />
        <span className="text-[14px] text-text-strong truncate">{name}</span>
        <span className="text-[12px] text-text-muted shrink-0">({rating})</span>
      </div>
      <span
        className={`font-mono text-[18px] px-2.5 py-1 rounded-sm shrink-0 ${
          active ? "bg-accent text-[#10230a] font-semibold" : "bg-bg-input text-text"
        }`}
      >
        {clock}
      </span>
    </div>
  );
}

export default function GamePage() {
  return (
    <main className="flex-1 bg-bg">
      <div className="max-w-[1000px] mx-auto px-3 py-4 grid grid-cols-1 lg:grid-cols-[minmax(0,520px)_300px] gap-4 justify-center">
        {/* Board column */}
        <div className="flex flex-col gap-2 items-center lg:items-stretch">
          <PlayerRow name="GM_Arjun_Mehta" rating={2412} color="b" clock="04:52" />
          <div className="flex justify-center">
            <ChessBoard size={480} />
          </div>
          <PlayerRow name="Prakriti_Singh" rating={1967} color="w" clock="05:00" active />

          <div className="flex gap-2 mt-1">
            <button className="btn-outline text-[13px] flex-1">Offer draw</button>
            <button className="btn-outline text-[13px] flex-1 !border-danger !text-danger">
              Resign
            </button>
          </div>
        </div>

        {/* Side panel */}
        <div className="flex flex-col gap-3 min-w-0">
          <div className="card p-3">
            <div className="label-eyebrow mb-2">Rated &middot; Blitz &middot; 5+3</div>
            <div className="text-[13px] text-text">
              Move <span className="text-text-strong font-semibold">8</span> &middot; White to
              play
            </div>
          </div>

          <div className="card flex-1 overflow-hidden flex flex-col">
            <div className="px-3 py-2 border-b border-border-soft label-eyebrow">Moves</div>
            <div className="overflow-y-auto max-h-[260px] text-[13px]">
              {moves.map(([w, b], i) => (
                <div
                  key={i}
                  className="grid grid-cols-[28px_1fr_1fr] px-3 py-1.5 odd:bg-white/[0.02]"
                >
                  <span className="text-text-muted">{i + 1}.</span>
                  <span className="text-text-strong font-mono">{w}</span>
                  <span className="text-text-strong font-mono">{b}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-3">
            <div className="label-eyebrow mb-2">Chat</div>
            <div className="text-[13px] text-text-muted italic mb-2">
              GM_Arjun_Mehta: good luck, have fun
            </div>
            <input
              placeholder="Send a message"
              className="w-full bg-bg-input border border-border rounded-sm px-2.5 py-1.5 text-[13px] text-text-strong outline-none focus:border-accent"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
