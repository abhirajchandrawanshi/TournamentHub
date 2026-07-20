import Link from "next/link";
import { ReactNode } from "react";

import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
    children: ReactNode;
    href?: string;
    type?: "button" | "submit" | "reset";
    variant?: ButtonVariant;
    size?: ButtonSize;
    className?: string;
    onClick?: () => void;
}

const baseStyles =
    "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#81b64c]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0b0b]";

const variantStyles: Record<ButtonVariant, string> = {
    primary: "bg-[#81b64c] text-black shadow-lg shadow-[#81b64c]/20 hover:-translate-y-0.5 hover:bg-[#90c35f]",
    secondary: "bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:-translate-y-0.5",
    ghost: "bg-transparent text-slate-200 border border-white/10 hover:bg-white/5 hover:text-white",
};

const sizeStyles: Record<ButtonSize, string> = {
    sm: "px-4 py-2 text-sm",
    md: "px-5 py-3 text-sm",
    lg: "px-6 py-3.5 text-base",
};

export default function Button({
    children,
    href,
    type = "button",
    variant = "primary",
    size = "md",
    className,
    onClick,
}: ButtonProps) {
    const styles = cn(baseStyles, variantStyles[variant], sizeStyles[size], className);

    if (href) {
        return (
            <Link href={href} className={styles} onClick={onClick as never}>
                {children}
            </Link>
        );
    }

    return (
        <button type={type} className={styles} onClick={onClick}>
            {children}
        </button>
    );
}
