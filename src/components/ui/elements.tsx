"use client";

import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Tailwind className merge helper
export function cn(...inputs: any[]) {
    return twMerge(clsx(inputs));
}

// ==========================================
// CARD COMPONENTS
// ==========================================
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    glass?: boolean;
}

export function Card({ className, glass, ...props }: CardProps) {
    return (
        <div
            className={cn(
                "rounded-xl border border-border bg-card text-card-foreground shadow-xs transition-all duration-200",
                glass && "backdrop-blur-md bg-card/60",
                className
            )}
            {...props}
        />
    );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    return <h3 className={cn("font-semibold leading-none tracking-tight text-lg text-foreground", className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
    return <p className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("p-6 pt-0", className)} {...props} />;
}

// ==========================================
// BUTTON COMPONENTS
// ==========================================
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "destructive" | "ghost" | "link";
    size?: "sm" | "md" | "lg" | "icon";
}

export function Button({
    className,
    variant = "primary",
    size = "md",
    ...props
}: ButtonProps) {
    return (
        <button
            className={cn(
                "inline-flex items-center justify-center rounded-lg font-medium transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-98",
                // Variants
                variant === "primary" && "bg-primary text-primary-foreground shadow-xs hover:bg-primary/95 hover:shadow-md",
                variant === "secondary" && "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                variant === "outline" && "border border-border bg-background hover:bg-muted hover:text-accent-foreground",
                variant === "destructive" && "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                variant === "ghost" && "hover:bg-muted hover:text-accent-foreground",
                variant === "link" && "text-primary underline-offset-4 hover:underline",
                // Sizes
                size === "sm" && "h-8 px-3 text-xs",
                size === "md" && "h-10 px-4 py-2 text-sm",
                size === "lg" && "h-11 px-8 text-base",
                size === "icon" && "h-10 w-10 p-0",
                className
            )}
            {...props}
        />
    );
}

// ==========================================
// INPUT COMPONENTS
// ==========================================
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { }

export function Input({ className, type = "text", ...props }: InputProps) {
    return (
        <input
            type={type}
            className={cn(
                "flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 focus:border-primary/50 transition-colors",
                className
            )}
            {...props}
        />
    );
}

// ==========================================
// BADGE COMPONENTS
// ==========================================
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: "default" | "secondary" | "success" | "warning" | "destructive" | "outline";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2",
                // Variants
                variant === "default" && "bg-primary/10 text-primary border border-primary/20",
                variant === "secondary" && "bg-secondary text-secondary-foreground border border-border",
                variant === "success" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25",
                variant === "warning" && "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25",
                variant === "destructive" && "bg-destructive/10 text-destructive border border-destructive/20",
                variant === "outline" && "text-foreground border border-border",
                className
            )}
            {...props}
        />
    );
}

// ==========================================
// PROGRESS COMPONENTS
// ==========================================
export interface ProgressProps {
    value: number; // 0 to 100
    className?: string;
    indicatorClassName?: string;
}

export function Progress({ value, className, indicatorClassName }: ProgressProps) {
    // Clamp value between 0 and 100
    const clamped = Math.max(0, Math.min(100, value));

    // Custom color based on LH rating
    const colorClass =
        clamped >= 90 ? "bg-emerald-500" :
            clamped >= 50 ? "bg-amber-500" :
                "bg-rose-500";

    return (
        <div className={cn("relative h-2 w-full overflow-hidden rounded-full bg-secondary", className)}>
            <div
                className={cn("h-full w-full flex-1 transition-all duration-500 ease-out", colorClass, indicatorClassName)}
                style={{ transform: `translateX(-${100 - clamped}%)` }}
            />
        </div>
    );
}

// ==========================================
// TABLE COMPONENTS
// ==========================================
export function Table({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) {
    return (
        <div className="relative w-full overflow-auto">
            <table className={cn("w-full caption-bottom text-sm", className)} {...props} />
        </div>
    );
}

export function TableHeader({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
    return <thead className={cn("[&_tr]:border-b border-border bg-muted/40", className)} {...props} />;
}

export function TableBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
    return <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />;
}

export function TableRow({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
    return (
        <tr
            className={cn(
                "border-b border-border transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
                className
            )}
            {...props}
        />
    );
}

export function TableHead({ className, ...props }: React.HTMLAttributes<HTMLTableHeaderCellElement>) {
    return (
        <th
            className={cn(
                "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
                className
            )}
            {...props}
        />
    );
}

export function TableCell({ className, ...props }: React.HTMLAttributes<HTMLTableDataCellElement>) {
    return (
        <td
            className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
            {...props}
        />
    );
}
