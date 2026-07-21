import { Target, Flame } from "lucide-react";
import type { Puzzle } from "@/lib/puzzles";

export default function PuzzleInfoPanel({ puzzle, ratingRevealed }: { puzzle: Puzzle; ratingRevealed: boolean }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="card p-3 flex gap-3 items-start">
        <Target size={20} className="text-accent shrink-0 mt-0.5" />
        <div className="text-[13px] leading-relaxed">
          <div className="text-text-strong font-semibold">
            Puzzle <span className="text-accent">#{puzzle.id}</span>
          </div>
          <div className="text-text-muted">Rating: {ratingRevealed ? puzzle.rating : "hidden"}</div>
          <div className="text-text-muted">Played {puzzle.playedCount.toLocaleString()} times</div>
        </div>
      </div>

      <div className="card p-3 flex gap-3 items-start">
        <Flame size={20} className="text-danger shrink-0 mt-0.5" />
        <div className="text-[13px] leading-relaxed w-full min-w-0">
          <div className="text-text-strong font-semibold mb-1">From game {puzzle.timeControl}</div>
          <div className="flex items-center gap-1.5 text-text truncate">
            <span className="w-2.5 h-2.5 rounded-full bg-white border border-border-soft shrink-0" />
            {puzzle.white.name} <span className="text-text-muted">({puzzle.white.rating})</span>
          </div>
          <div className="flex items-center gap-1.5 text-text truncate">
            <span className="w-2.5 h-2.5 rounded-full bg-[#232323] border border-border-soft shrink-0" />
            {puzzle.black.name} <span className="text-text-muted">({puzzle.black.rating})</span>
          </div>
        </div>
      </div>

      <div className="card p-3">
        <div className="text-[13px] text-text-strong font-semibold mb-1.5">Puzzle Themes</div>
        <div className="flex flex-wrap gap-1.5">
          {puzzle.themes.map((theme) => (
            <span key={theme} className="text-[11px] px-2 py-1 rounded-sm bg-accent-soft text-accent border border-accent/30">
              {theme}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}