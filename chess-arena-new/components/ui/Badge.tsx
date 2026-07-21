import { ReactNode } from "react";

import { cn } from "@/lib/cn";

interface BadgeProps {
    children: ReactNode;
    className?: string;
}

export default function Badge({ children, className }: BadgeProps) {
    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full border border-[#81b64c]/25 bg-[#81b64c]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[#cce8af]",
                className
            )}
        >
            {children}
        </span>
    );
}
