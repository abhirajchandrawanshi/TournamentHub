"use client";


import { useEffect, useState } from "react";
import { Palette } from "lucide-react";
import { BOARD_THEMES, DEFAULT_THEME_ID, getTheme } from "@/lib/chessThemes";
const STORAGE_KEY = "chessarena-board-theme";

function applyTheme(id: string) {
    const theme = getTheme(id);
    const root = document.documentElement;
    root.style.setProperty("--color-board-light", theme.light);
    root.style.setProperty("--color-board-dark", theme.dark);
    root.style.setProperty("--color-board-selected", theme.selected);
    root.style.setProperty("--color-board-lastmove", theme.lastMove);
}

export default function ThemeSwitcher() {
    const [open, setOpen] = useState(false);
    const [activeId, setActiveId] = useState(DEFAULT_THEME_ID);

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY) ?? DEFAULT_THEME_ID;
        setActiveId(saved);
        applyTheme(saved);
    }, []);

    function selectTheme(id: string) {
        setActiveId(id);
        applyTheme(id);
        localStorage.setItem(STORAGE_KEY, id);
        setOpen(false);
    }

    return (
        <div className="relative">
            <button onClick={() => setOpen((v) => !v)} className="btn-outline text-[13px] flex items-center gap-1.5 !py-1.5 !px-3">
                <Palette size={14} />
                Board theme
            </button>

            {open && (
                <div className="absolute right-0 mt-1.5 w-56 card p-2 z-20 shadow-[0_4px_16px_rgba(0,0,0,0.4)]">
                    <div className="label-eyebrow px-1 pb-1.5">Choose a theme</div>
                    <div className="grid grid-cols-2 gap-1.5">
                        {BOARD_THEMES.map((theme) => (
                            <button
                                key={theme.id}
                                onClick={() => selectTheme(theme.id)}
                                className={`flex flex-col items-center gap-1 p-1.5 rounded-sm border transition-colors ${activeId === theme.id ? "border-accent" : "border-transparent hover:border-border"
                                    }`}
                            >
                                <div className="grid grid-cols-2 grid-rows-2 w-9 h-9 overflow-hidden rounded-[2px]">
                                    <div style={{ background: theme.light }} />
                                    <div style={{ background: theme.dark }} />
                                    <div style={{ background: theme.dark }} />
                                    <div style={{ background: theme.light }} />
                                </div>
                                <span className="text-[11px] text-text truncate w-full text-center">{theme.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}