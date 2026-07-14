"use client";

import React, { useState, useEffect } from "react";
import { Gauge, Sparkles, AlertCircle, RefreshCw, Send, HelpCircle, HardDrive } from "lucide-react";
import { AuditReport } from "@/types/lighthouse";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Input } from "@/components/ui/elements";
import ReportViewer from "./report-viewer";

const AUDIT_STEPS = [
    "Connecting to target host and initializing viewport...",
    "Loading document resources and stylesheet maps...",
    "Spawning Chrome process and executing FCP timers...",
    "Measuring Largest Contentful Paint (LCP) layout shifts...",
    "Analyzing DOM nodes and validation of ARIA properties...",
    "Harvesting SEO tags and analyzing structured schemas...",
    "Generating audit vectors and rendering analytics console..."
];

interface DashboardClientProps {
    initialLatestReport: AuditReport | null;
}

export default function DashboardClient({ initialLatestReport }: DashboardClientProps) {
    const [url, setUrl] = useState("");
    const [simulated, setSimulated] = useState(true); // Default to simulated for frictionless trial
    const [isRunning, setIsRunning] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [activeReport, setActiveReport] = useState<AuditReport | null>(initialLatestReport);

    // Simulation loading steps interval
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isRunning) {
            timer = setInterval(() => {
                setCurrentStep((prev) => {
                    if (prev >= AUDIT_STEPS.length - 1) {
                        return prev; // hold at last step until request completes
                    }
                    return prev + 1;
                });
            }, simulated ? 600 : 2500); // speed up simulation loaded animations
        } else {
            setCurrentStep(0);
        }
        return () => clearInterval(timer);
    }, [isRunning, simulated]);

    const handleRunAudit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url.trim()) return;

        setIsRunning(true);
        setError(null);
        setCurrentStep(0);

        try {
            const response = await fetch("/api/audit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ url: url.trim(), simulated }),
            });

            const data = await response.json();
            if (!response.ok || !data.success) {
                throw new Error(data.error || "An error occurred while compiling the audit.");
            }

            setActiveReport(data.report);
            setUrl(""); // Reset form
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to finalize the audit. Ensure the server is online.");
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Page Header banner */}
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-xl md:text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
                        <Gauge className="h-6 w-6 text-primary" />
                        Lighthouse Audit Engine
                    </h2>
                    <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                        Optimize your web application for speed, accessibility, SEO rankings and adherence to best practices.
                    </p>
                </div>
            </div>

            {/* Audit Form Interface */}
            <Card className="shadow-lg border-primary/10 relative overflow-hidden">
                {/* Decorative corner glows */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-16 -mt-16" />
                <CardContent className="p-6">
                    <form onSubmit={handleRunAudit} className="space-y-4">
                        <div className="flex flex-col md:flex-row gap-4 items-end">
                            {/* Input field */}
                            <div className="flex-1 space-y-1.5 w-full">
                                <label htmlFor="audit-url" className="text-xs font-bold text-foreground block">
                                    Target Website URL
                                </label>
                                <div className="relative">
                                    <Input
                                        id="audit-url"
                                        type="text"
                                        required
                                        placeholder="e.g. https://nextjs.org or github.com"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        disabled={isRunning}
                                        className="pr-10 h-11"
                                    />
                                    <div className="absolute right-3.5 top-3.5 text-muted-foreground">
                                        <Send className="h-4.5 w-4.5" />
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons & options */}
                            <div className="flex gap-3 w-full md:w-auto">
                                {/* Engine Selector */}
                                <div className="flex flex-col justify-end w-48 shrink-0">
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-2 block">
                                        Execution Mode
                                    </span>
                                    <div className="flex bg-secondary p-1 rounded-lg border border-border/80 h-11 items-center">
                                        <button
                                            type="button"
                                            onClick={() => setSimulated(true)}
                                            disabled={isRunning}
                                            className={`flex-1 text-[11px] font-bold rounded-md py-1.5 transition-all cursor-pointer ${simulated
                                                    ? "bg-card text-foreground shadow-xs"
                                                    : "text-muted-foreground hover:text-foreground"
                                                }`}
                                        >
                                            Simulated
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setSimulated(false)}
                                            disabled={isRunning}
                                            className={`flex-1 text-[11px] font-bold rounded-md py-1.5 transition-all cursor-pointer ${!simulated
                                                    ? "bg-card text-foreground shadow-xs"
                                                    : "text-muted-foreground hover:text-foreground"
                                                }`}
                                        >
                                            Lighthouse
                                        </button>
                                    </div>
                                </div>

                                {/* Audit Trigger */}
                                <Button
                                    type="submit"
                                    disabled={isRunning || !url.trim()}
                                    className="w-full md:w-36 h-11 shrink-0 gap-2 font-bold cursor-pointer"
                                >
                                    {isRunning ? (
                                        <>
                                            <RefreshCw className="h-4 w-4 animate-spin" />
                                            <span>Auditing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="h-4 w-4" />
                                            <span>Run Audit</span>
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Hint text regarding execution */}
                        <p className="text-[10px] text-muted-foreground italic">
                            {simulated
                                ? "Simulated Engine evaluates URLs deterministically using seeded calculations. Does not require Google Chrome."
                                : "Next.js Lighthouse CLI Engine spawns native Headless Chrome. Chrome must be accessible in shell environment paths."
                            }
                        </p>
                    </form>
                </CardContent>
            </Card>

            {/* Error Display */}
            {error && (
                <Card className="border-rose-500/20 bg-rose-500/[0.03]">
                    <CardContent className="p-4 flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                        <div>
                            <h5 className="font-bold text-rose-500 text-sm">Audit Engine Failure</h5>
                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{error}</p>
                            <div className="flex gap-3 mt-3">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => { setSimulated(true); setError(null); }}
                                    className="h-8 text-[11px] border-rose-500/20 hover:bg-rose-500/10 hover:text-rose-600 cursor-pointer"
                                >
                                    Toggle Simulated Engine
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setError(null)}
                                    className="h-8 text-[11px]"
                                >
                                    Dismiss
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Loading Overlay */}
            {isRunning && (
                <Card className="border-primary/20 bg-primary/[0.02] py-12 px-6 text-center animate-in fade-in duration-300 relative overflow-hidden">
                    <div className="absolute inset-0 bg-linear-to-r from-primary/5 via-transparent to-primary/5 animate-pulse" />
                    <div className="max-w-md mx-auto space-y-6 relative">
                        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground mx-auto shadow-xl shadow-primary/30">
                            <RefreshCw className="h-7 w-7 animate-spin" />
                            <div className="absolute -inset-1 rounded-2xl bg-primary/20 blur-md -z-10 animate-ping duration-1000" />
                        </div>

                        <div className="space-y-2">
                            <h4 className="text-lg font-black text-foreground">Performing Lighthouse Audit</h4>
                            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                                Executing performance vectors. This might take up to 25 seconds for initial viewport crawls...
                            </p>
                        </div>

                        {/* Visual Progress bar */}
                        <div className="space-y-2.5">
                            <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden border border-border/80">
                                <div
                                    className="h-full bg-primary rounded-full transition-all duration-700 ease-out"
                                    style={{ width: `${Math.round(((currentStep + 1) / AUDIT_STEPS.length) * 100)}%` }}
                                />
                            </div>
                            <div className="text-xs font-semibold text-primary transition-all duration-300 h-4">
                                {AUDIT_STEPS[currentStep]}
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* active report renderer */}
            {!isRunning && activeReport && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom duration-300">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-foreground">Audit Results</h3>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-md border border-border/40 font-mono">
                            <HardDrive className="h-3.5 w-3.5" />
                            ID: {activeReport.id}
                        </div>
                    </div>
                    <ReportViewer report={activeReport} />
                </div>
            )}

            {/* Empty State when no reports run at all */}
            {!isRunning && !activeReport && (
                <Card className="py-16 px-6 text-center border-dashed">
                    <CardContent className="max-w-md mx-auto space-y-4 pt-6">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground mx-auto border border-border">
                            <HelpCircle className="h-6 w-6" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-base font-bold text-foreground">No Audit Compiled</h4>
                            <p className="text-xs text-muted-foreground">
                                Enter a target URL and select an execution engine above to run your first Lighthouse crawl and compile metrics.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
