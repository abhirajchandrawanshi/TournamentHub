const START_POSITION: Record<string, string> = {
  a8: "bR", b8: "bN", c8: "bB", d8: "bQ", e8: "bK", f8: "bB", g8: "bN", h8: "bR",
  a7: "bP", b7: "bP", c7: "bP", d7: "bP", e7: "bP", f7: "bP", g7: "bP", h7: "bP",
  a2: "wP", b2: "wP", c2: "wP", d2: "wP", e2: "wP", f2: "wP", g2: "wP", h2: "wP",
  a1: "wR", b1: "wN", c1: "wB", d1: "wQ", e1: "wK", f1: "wB", g1: "wN", h1: "wR",
};

const PIECE_GLYPH: Record<string, string> = {
  wK: "\u2654", wQ: "\u2655", wR: "\u2656", wB: "\u2657", wN: "\u2658", wP: "\u2659",
  bK: "\u265A", bQ: "\u265B", bR: "\u265C", bB: "\u265D", bN: "\u265E", bP: "\u265F",
};

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const RANKS = [8, 7, 6, 5, 4, 3, 2, 1];

export default function ChessBoard({
  position = START_POSITION,
  size = 480,
  showCoords = true,
}: {
  position?: Record<string, string>;
  size?: number;
  showCoords?: boolean;
}) {
  const square = size / 8;

  return (
    <div
      className="relative select-none shadow-[0_2px_10px_rgba(0,0,0,0.5)]"
      style={{ width: size, height: size }}
    >
      <div className="grid grid-cols-8 grid-rows-8 w-full h-full overflow-hidden rounded-[2px]">
        {RANKS.map((rank) =>
          FILES.map((file) => {
            const isLight = (FILES.indexOf(file) + rank) % 2 === 0;
            const key = `${file}${rank}`;
            const piece = position[key];
            return (
              <div
                key={key}
                className="relative flex items-center justify-center"
                style={{
                  background: isLight ? "var(--color-board-light)" : "var(--color-board-dark)",
                  width: square,
                  height: square,
                }}
              >
                {showCoords && file === "a" && (
                  <span
                    className="absolute top-[2px] left-[3px] text-[10px] font-bold"
                    style={{ color: isLight ? "var(--color-board-dark)" : "var(--color-board-light)" }}
                  >
                    {rank}
                  </span>
                )}
                {showCoords && rank === 1 && (
                  <span
                    className="absolute bottom-[1px] right-[3px] text-[10px] font-bold"
                    style={{ color: isLight ? "var(--color-board-dark)" : "var(--color-board-light)" }}
                  >
                    {file}
                  </span>
                )}
                {piece && (
                  <span
                    style={{
                      fontSize: square * 0.78,
                      lineHeight: 1,
                      color: piece[0] === "w" ? "#fbfbfb" : "#232323",
                      filter:
                        piece[0] === "w"
                          ? "drop-shadow(0 1px 1px rgba(0,0,0,0.55))"
                          : "drop-shadow(0 1px 1px rgba(0,0,0,0.25))",
                    }}
                  >
                    {PIECE_GLYPH[piece]}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
