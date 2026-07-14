"use client";

import React from "react";
import { Sun, Moon, Menu } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/elements";

interface TopNavProps {
    onMenuToggle: () => void;
}

export default function TopNav({ onMenuToggle }: TopNavProps) {
    const { theme, toggleTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border bg-card/60 backdrop-blur-md px-6 text-foreground">
            {/* Left side: Hamburger on mobile, page descriptor */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onMenuToggle}
                    className="md:hidden"
                    aria-label="Toggle Menu"
                >
                    <Menu className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-md font-bold tracking-tight text-foreground md:text-lg">
                        Analytics Console
                    </h1>
                </div>
            </div>

            {/* Right side: Preferences, Theme Switcher, Quick Stats */}
            <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground mr-2 bg-muted/40 px-2.5 py-1 rounded-md border border-border/40">
                    <span className="font-semibold text-foreground">System Date:</span>
                    <span>{mounted ? new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : ""}</span>
                </div>

                {/* Dark/Light Mode toggle */}
                <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleTheme}
                    title="Toggle Theme"
                    className="rounded-lg h-9 w-9 border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                >
                    {theme === "light" ? (
                        <Moon className="h-4 w-4 transition-transform hover:-rotate-12" />
                    ) : (
                        <Sun className="h-4 w-4 transition-transform hover:rotate-45" />
                    )}
                </Button>
            </div>
        </header>
    );
}
