import { ReactNode } from "react";

import Badge from "./Badge";

interface SectionHeadingProps {
    eyebrow?: string;
    title: ReactNode;
    description?: ReactNode;
    align?: "left" | "center";
}

export default function SectionHeading({
    eyebrow,
    title,
    description,
    align = "left",
}: SectionHeadingProps) {
    return (
        <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
            {eyebrow ? <Badge>{eyebrow}</Badge> : null}
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                {title}
            </h2>
            {description ? (
                <p className="mt-4 text-base leading-7 text-slate-400 sm:text-lg">
                    {description}
                </p>
            ) : null}
        </div>
    );
}
