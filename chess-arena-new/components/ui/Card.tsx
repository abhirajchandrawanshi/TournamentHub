import { ReactNode } from "react";

import { cn } from "@/lib/cn";

interface CardProps {
    children: ReactNode;
    className?: string;
}

export default function Card({ children, className }: CardProps) {
    return (
        <div
            className={cn(
                "rounded-xl border border-white/10 bg-[#181818] shadow-[0_12px_40px_rgba(0,0,0,0.24)]",
                className
            )}
        >
            {children}
        </div>
    );
}
