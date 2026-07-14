"use client";

import React, { useState } from "react";
import Sidebar from "./sidebar";
import TopNav from "./top-nav";
import { X } from "lucide-react";
import { cn } from "@/components/ui/elements";

export default function AppShell({ children }: { children: React.ReactNode }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background">
            {/* Desktop Sidebar (hidden on mobile) */}
            <Sidebar className="hidden md:flex flex-shrink-0" />

            {/* Mobile Drawer Sidebar */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 flex md:hidden">
                    {/* Overlay */}
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
                        onClick={() => setMobileMenuOpen(false)}
                    />

                    {/* Drawer Content */}
                    <div className="relative flex w-full max-w-xs flex-1 flex-col bg-card animate-in slide-in-from-left duration-300">
                        <div className="absolute right-4 top-4">
                            <button
                                type="button"
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground hover:bg-muted"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <Sidebar onLinkClick={() => setMobileMenuOpen(false)} className="w-full h-full border-r-0" />
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex flex-1 flex-col overflow-hidden">
                <TopNav onMenuToggle={() => setMobileMenuOpen(true)} />
                <main className="flex-1 overflow-y-auto px-4 py-8 md:px-8 bg-background relative">
                    <div className="mx-auto max-w-6xl space-y-8 animate-in fade-in duration-200">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
