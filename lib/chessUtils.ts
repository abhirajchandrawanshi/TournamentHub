import { Chess } from "chess.js";

export function boardToPosition(chess: Chess): Record<string, string> {
  const position: Record<string, string> = {};
  chess.board().forEach((row) => {
    row.forEach((sq) => {
      if (sq) position[sq.square] = `${sq.color}${sq.type.toUpperCase()}`;
    });
  });
  return position;
}

export function legalTargetsFrom(chess: Chess, square: string): string[] {
  return chess.moves({ square: square as never, verbose: true }).map((m) => m.to);
}

export interface MovePairRow {
  number: number;
  white: string;
  black?: string;
}

export function buildMovePairs(startFen: string, sanHistory: string[]): MovePairRow[] {
  const [, activeColor, , , , fullMove] = startFen.split(" ");
  let moveNumber = parseInt(fullMove, 10) || 1;
  const pairs: MovePairRow[] = [];
  let i = 0;

  if (activeColor === "b" && sanHistory.length > 0) {
    pairs.push({ number: moveNumber, white: "\u2026", black: sanHistory[0] });
    i = 1;
    moveNumber++;
  }

  for (; i < sanHistory.length; i += 2) {
    pairs.push({ number: moveNumber, white: sanHistory[i], black: sanHistory[i + 1] });
    moveNumber++;
  }

  return pairs;
}