"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gauge, History, Settings, RefreshCw, Layers } from "lucide-react";
import { cn } from "@/components/ui/elements";

interface SidebarProps {
    className?: string;
    onLinkClick?: () => void;
}

export default function Sidebar({ className, onLinkClick }: SidebarProps) {
    const pathname = usePathname();

    const menuItems = [
        {
            name: "Dashboard",
            href: "/",
            icon: Gauge,
            active: pathname === "/" || pathname?.startsWith("/reports/"),
        },
        {
            name: "Audit History",
            href: "/history",
            icon: History,
            active: pathname === "/history",
        },
        {
            name: "Settings",
            href: "/settings",
            icon: Settings,
            active: pathname === "/settings",
        },
    ];

    return (
        <aside
            className={cn(
                "flex h-full w-64 flex-col border-r border-border bg-card/60 backdrop-blur-md text-foreground",
                className
            )}
        >
            {/* Brand Header */}
            <div className="flex h-16 items-center gap-2.5 px-6 border-b border-border">
                <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/30">
                    <Layers className="h-5 w-5 animate-pulse" />
                    <div className="absolute -inset-0.5 rounded-lg bg-primary/20 blur-sm -z-10" />
                </div>
                <div className="flex flex-col">
                    <span className="font-bold tracking-tight text-sm text-foreground leading-none">
                        Lighthouse
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">
                        Analytics Suite
                    </span>
                </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 space-y-1.5 px-4 py-6">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onLinkClick}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer relative group",
                                item.active
                                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                                    : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                            )}
                        >
                            <Icon className={cn("h-4.5 w-4.5 shrink-0 transition-transform duration-200 group-hover:scale-105",
                                item.active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")}
                            />
                            <span>{item.name}</span>
                            {item.active && (
                                <div className="absolute right-2.5 h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer Info */}
            <div className="p-4 border-t border-border bg-muted/20">
                <div className="flex items-center gap-3 rounded-lg bg-card/40 p-3 border border-border/50 text-xs">
                    <div className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-medium text-foreground">Lighthouse CLI Ready</span>
                        <span className="text-[10px] text-muted-foreground leading-none mt-0.5">Local Engine Online</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}
