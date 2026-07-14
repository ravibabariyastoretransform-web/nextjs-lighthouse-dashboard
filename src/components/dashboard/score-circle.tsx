"use client";

import React from "react";
import { cn } from "@/components/ui/elements";

interface ScoreCircleProps {
    score: number; // 0 to 1
    label: string;
    size?: "sm" | "md" | "lg";
    className?: string;
    animate?: boolean;
}

export default function ScoreCircle({
    score,
    label,
    size = "md",
    className,
    animate = true,
}: ScoreCircleProps) {
    const percent = Math.round(score * 100);

    // Lighthouse Standard Colors
    const getColor = (val: number) => {
        if (val >= 90) return { text: "text-emerald-500", stroke: "stroke-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" };
        if (val >= 50) return { text: "text-amber-500", stroke: "stroke-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" };
        return { text: "text-rose-500", stroke: "stroke-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20" };
    };

    const colors = getColor(percent);

    const sizes = {
        sm: { radius: 24, strokeWidth: 5, fontSize: "text-sm", circumference: 150.8, wrapper: "w-20" },
        md: { radius: 36, strokeWidth: 7, fontSize: "text-2xl", circumference: 226.2, wrapper: "w-28" },
        lg: { radius: 48, strokeWidth: 9, fontSize: "text-4xl", circumference: 301.6, wrapper: "w-36" },
    };

    const currentSize = sizes[size];
    const strokeDashoffset = currentSize.circumference - (percent / 100) * currentSize.circumference;

    return (
        <div className={cn("flex flex-col items-center gap-2", currentSize.wrapper, className)}>
            <div className="relative group cursor-default">
                {/* Glow Ring Effect */}
                <div className={cn("absolute -inset-1 rounded-full blur-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300", colors.bg)} />

                <svg
                    width={currentSize.radius * 2 + currentSize.strokeWidth * 2}
                    height={currentSize.radius * 2 + currentSize.strokeWidth * 2}
                    className="transform -rotate-90 relative"
                    aria-label={`${label} Score: ${percent}%`}
                >
                    {/* Background Circle */}
                    <circle
                        cx={currentSize.radius + currentSize.strokeWidth}
                        cy={currentSize.radius + currentSize.strokeWidth}
                        r={currentSize.radius}
                        fill="transparent"
                        className="stroke-muted"
                        strokeWidth={currentSize.strokeWidth}
                    />
                    {/* Active SVG Gauge Circle */}
                    <circle
                        cx={currentSize.radius + currentSize.strokeWidth}
                        cy={currentSize.radius + currentSize.strokeWidth}
                        r={currentSize.radius}
                        fill="transparent"
                        className={cn("transition-all duration-1000 ease-out", colors.stroke, animate && "animate-dash")}
                        strokeWidth={currentSize.strokeWidth}
                        strokeDasharray={currentSize.circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                    />
                </svg>

                {/* Center Score Number */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className={cn("font-bold tracking-tight", currentSize.fontSize, colors.text)}>
                        {percent}
                    </span>
                </div>
            </div>

            <span className="text-xs font-semibold text-foreground text-center truncate w-full">
                {label}
            </span>
        </div>
    );
}
