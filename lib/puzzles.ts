export interface Puzzle {
  id: string;
  rating: number;
  playedCount: number;
  timeControl: string;
  white: { name: string; rating: number };
  black: { name: string; rating: number };
  themes: string[];
  fen: string;
  toMove: "w" | "b";
  solution: string[]; // alternating UCI: [yourMove, opponentReply, yourMove, ...]
}

export const PUZZLES: Puzzle[] = [
  {
    id: "dRS2x",
    rating: 2145,
    playedCount: 515,
    timeControl: "3+2 \u2022 Blitz",
    white: { name: "Orlando_Gibbons", rating: 2425 },
    black: { name: "Josim", rating: 2387 },
    themes: ["endgame", "advantage", "bishop"],
    fen: "8/1k6/8/3b4/8/4N2P/5PK1/2r5 b - - 2 56",
    toMove: "b",
    solution: ["d5c4", "e3c4", "c1c4"],
  },
  {
    id: "aK7mQ",
    rating: 1687,
    playedCount: 8342,
    timeControl: "10+0 \u2022 Rapid",
    white: { name: "PawnStormer", rating: 1701 },
    black: { name: "Rani_Kapoor", rating: 1663 },
    themes: ["fork", "middlegame", "short"],
    fen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 4 5",
    toMove: "w",
    solution: ["c3d5"],
  },
  {
    id: "zP4nT",
    rating: 2310,
    playedCount: 1204,
    timeControl: "5+3 \u2022 Blitz",
    white: { name: "Vikrant_S", rating: 2298 },
    black: { name: "Iron_Bishop", rating: 2334 },
    themes: ["mateIn2", "attraction", "sacrifice"],
    fen: "6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1",
    toMove: "w",
    solution: ["d1d8", "g8h7", "d8h8"],
  },
];

export function getPuzzleById(id: string): Puzzle | undefined {
  return PUZZLES.find((p) => p.id === id);
}