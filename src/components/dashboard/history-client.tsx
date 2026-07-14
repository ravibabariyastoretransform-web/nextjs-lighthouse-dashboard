"use client";

import React, { useState } from "react";
import {
    Search, Filter, ArrowLeft, RefreshCw, Archive, CheckCircle2,
    Trash2, Layers, TrendingUp, Sparkles, AlertCircle, Calendar, Eye
} from "lucide-react";
import { AuditReport } from "@/types/lighthouse";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Input, Badge } from "@/components/ui/elements";
import ScoreCircle from "./score-circle";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { ApiEndpoints } from "@/utils/api";

// Convert raw category score to a rating class
const getRating = (score: number) => {
    if (score >= 0.9) return "success";
    if (score >= 0.5) return "warning";
    return "destructive";
};

interface HistoryClientProps {
    initialReports: AuditReport[];
}

export default function HistoryClient({ initialReports }: HistoryClientProps) {
    const [reports, setReports] = useState<AuditReport[]>(initialReports);
    const [search, setSearch] = useState("");
    const [scoreFilter, setScoreFilter] = useState<"all" | "excellent" | "average" | "poor">("all");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [compareMode, setCompareMode] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this audit report?")) return;
        setIsDeleting(id);
        try {
            const { data } = await ApiEndpoints.deleteAudit(id);
            if (data.success) {
                setReports((prev) => prev.filter((r) => r.id !== id));
                setSelectedIds((prev) => prev.filter((item) => item !== id));
            } else {
                alert(data.error || "Failed to delete report.");
            }
        } catch (e: any) {
            console.error(e);
            alert(e.response?.data?.error || "Error contacting the delete endpoint.");
        } finally {
            setIsDeleting(null);
        }
    };

    // Toggle report ID in comparison list
    const toggleSelectReport = (id: string) => {
        setSelectedIds((prev) => {
            if (prev.includes(id)) {
                return prev.filter((item) => item !== id);
            }
            // Limit to 3 reports for side-by-side layout readability
            if (prev.length >= 3) {
                alert("You can select up to 3 reports for comparison.");
                return prev;
            }
            return [...prev, id];
        });
    };

    // Filters logic
    const filteredReports = reports.filter((r) => {
        const matchesSearch = r.url.toLowerCase().includes(search.toLowerCase());

        // Evaluate overall category rating
        const overall = r.scores.overall;
        if (scoreFilter === "excellent") return matchesSearch && overall >= 0.9;
        if (scoreFilter === "average") return matchesSearch && overall >= 0.5 && overall < 0.9;
        if (scoreFilter === "poor") return matchesSearch && overall < 0.5;

        return matchesSearch;
    });

    // Fetch report objects chosen for compare
    const reportsToCompare = reports.filter((r) => selectedIds.includes(r.id)).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()); // chronological

    // Calculate comparative differentials for selected web vitals.
    // We compare elements relative to the oldest report (index 0) in the selection list.
    const getDiffText = (currentVal: number, baselineVal: number, type: 'time' | 'ratio' | 'score') => {
        const diff = currentVal - baselineVal;
        if (diff === 0) return { text: "No change", color: "text-muted-foreground" };

        // For timing metrics (LCP, TBT, FCP) & layout shifts (CLS): lower is better
        if (type === 'time' || type === 'ratio') {
            const isBetter = diff < 0;
            const formattedDiff = type === 'time'
                ? `${Math.abs(diff / 1000).toFixed(2)}s`
                : `${Math.abs(diff).toFixed(3)}`;
            return {
                text: isBetter ? `-${formattedDiff} (faster)` : `+${formattedDiff} (slower)`,
                color: isBetter ? "text-emerald-500 font-bold" : "text-rose-500 font-bold"
            };
        } else {
            // For score metrics: higher is better
            const isBetter = diff > 0;
            const pct = Math.round(diff * 100);
            return {
                text: isBetter ? `+${pct}% (gain)` : `${pct}% (regression)`,
                color: isBetter ? "text-emerald-500 font-bold" : "text-rose-500 font-bold"
            };
        }
    };

    // Render comparative table
    if (compareMode && reportsToCompare.length >= 2) {
        const baseline = reportsToCompare[0];

        return (
            <div className="space-y-6">
                {/* Compare Header */}
                <div className="flex items-center gap-4 bg-card p-4 rounded-xl border border-border">
                    <Button variant="outline" size="sm" onClick={() => setCompareMode(false)} className="gap-2 cursor-pointer">
                        <ArrowLeft className="h-4 w-4" />
                        Back to History
                    </Button>
                    <div>
                        <h3 className="font-bold text-foreground text-base">Comparing {reportsToCompare.length} Audits</h3>
                        <p className="text-xs text-muted-foreground">
                            Baseline report is: <span className="font-mono">{baseline.url}</span> ({mounted ? new Date(baseline.timestamp).toLocaleDateString() : "..."})
                        </p>
                    </div>
                </div>

                {/* Comparison Dashboard Columns */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {reportsToCompare.map((rep, idx) => (
                        <Card key={rep.id} className={idx === 0 ? "border-primary/40 bg-primary/[0.01]" : ""}>
                            <CardHeader>
                                <div className="flex justify-between items-start gap-2">
                                    <div>
                                        <span className="text-[10px] uppercase font-mono text-muted-foreground block">
                                            {idx === 0 ? "Baseline" : `Comparison #${idx}`}
                                        </span>
                                        <CardTitle className="text-sm font-bold truncate max-w-[180px] mt-1" title={rep.url}>
                                            {rep.url}
                                        </CardTitle>
                                    </div>
                                    <Badge variant={idx === 0 ? "default" : "secondary"}>
                                        {mounted ? new Date(rep.timestamp).toLocaleDateString() : "..."}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Score indicators */}
                                <div className="grid grid-cols-2 gap-3.5 pt-2">
                                    <div className="bg-muted/30 p-2.5 rounded-lg text-center flex flex-col items-center">
                                        <ScoreCircle score={rep.scores.performance} label="Performance" size="sm" />
                                        {idx > 0 && (
                                            <span className={`text-[10px] mt-2 block ${getDiffText(rep.scores.performance, baseline.scores.performance, 'score').color}`}>
                                                {getDiffText(rep.scores.performance, baseline.scores.performance, 'score').text}
                                            </span>
                                        )}
                                    </div>
                                    <div className="bg-muted/30 p-2.5 rounded-lg text-center flex flex-col items-center">
                                        <ScoreCircle score={rep.scores.accessibility} label="Accessibility" size="sm" />
                                        {idx > 0 && (
                                            <span className={`text-[10px] mt-2 block ${getDiffText(rep.scores.accessibility, baseline.scores.accessibility, 'score').color}`}>
                                                {getDiffText(rep.scores.accessibility, baseline.scores.accessibility, 'score').text}
                                            </span>
                                        )}
                                    </div>
                                    <div className="bg-muted/30 p-2.5 rounded-lg text-center flex flex-col items-center">
                                        <ScoreCircle score={rep.scores.bestPractices} label="Best Practices" size="sm" />
                                        {idx > 0 && (
                                            <span className={`text-[10px] mt-2 block ${getDiffText(rep.scores.bestPractices, baseline.scores.bestPractices, 'score').color}`}>
                                                {getDiffText(rep.scores.bestPractices, baseline.scores.bestPractices, 'score').text}
                                            </span>
                                        )}
                                    </div>
                                    <div className="bg-muted/30 p-2.5 rounded-lg text-center flex flex-col items-center">
                                        <ScoreCircle score={rep.scores.seo} label="SEO" size="sm" />
                                        {idx > 0 && (
                                            <span className={`text-[10px] mt-2 block ${getDiffText(rep.scores.seo, baseline.scores.seo, 'score').color}`}>
                                                {getDiffText(rep.scores.seo, baseline.scores.seo, 'score').text}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Core Web Vitals */}
                                <div className="border-t border-border pt-4 space-y-3">
                                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Metrics Drilldown</h4>

                                    {/* LCP */}
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-muted-foreground font-medium">Largest Contentful Paint</span>
                                        <div className="text-right">
                                            <span className="font-bold text-foreground block">{rep.coreWebVitals.lcp.displayValue}</span>
                                            {idx > 0 && (
                                                <span className={`text-[9px] block ${getDiffText(rep.coreWebVitals.lcp.numericValue, baseline.coreWebVitals.lcp.numericValue, 'time').color}`}>
                                                    {getDiffText(rep.coreWebVitals.lcp.numericValue, baseline.coreWebVitals.lcp.numericValue, 'time').text}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* CLS */}
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-muted-foreground font-medium">Cumulative Layout Shift</span>
                                        <div className="text-right">
                                            <span className="font-bold text-foreground block">{rep.coreWebVitals.cls.displayValue}</span>
                                            {idx > 0 && (
                                                <span className={`text-[9px] block ${getDiffText(rep.coreWebVitals.cls.numericValue, baseline.coreWebVitals.cls.numericValue, 'ratio').color}`}>
                                                    {getDiffText(rep.coreWebVitals.cls.numericValue, baseline.coreWebVitals.cls.numericValue, 'ratio').text}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* TBT */}
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-muted-foreground font-medium">Total Blocking Time</span>
                                        <div className="text-right">
                                            <span className="font-bold text-foreground block">{rep.coreWebVitals.tbt.displayValue}</span>
                                            {idx > 0 && (
                                                <span className={`text-[9px] block ${getDiffText(rep.coreWebVitals.tbt.numericValue, baseline.coreWebVitals.tbt.numericValue, 'time').color}`}>
                                                    {getDiffText(rep.coreWebVitals.tbt.numericValue, baseline.coreWebVitals.tbt.numericValue, 'time').text}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* FCP */}
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-muted-foreground font-medium">First Contentful Paint</span>
                                        <div className="text-right">
                                            <span className="font-bold text-foreground block">{rep.coreWebVitals.fcp.displayValue}</span>
                                            {idx > 0 && (
                                                <span className={`text-[9px] block ${getDiffText(rep.coreWebVitals.fcp.numericValue, baseline.coreWebVitals.fcp.numericValue, 'time').color}`}>
                                                    {getDiffText(rep.coreWebVitals.fcp.numericValue, baseline.coreWebVitals.fcp.numericValue, 'time').text}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Page Weight and network requests summary */}
                                <div className="border-t border-border pt-4 space-y-2 text-xs">
                                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Resource Allocation</h4>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Resource Requests</span>
                                        <span className="font-bold text-foreground">
                                            {rep.performanceAnalytics.resourceSummary[0]?.count ?? 10} requests
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Network Weight</span>
                                        <span className="font-bold text-foreground">
                                            {Math.round((rep.performanceAnalytics.resourceSummary[0]?.size ?? 500000) / 1024)} KB
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    // Render Standard Audit list table
    return (
        <div className="space-y-6">

            {/* Page Header */}
            <div>
                <h2 className="text-xl md:text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
                    <Archive className="h-6 w-6 text-primary" />
                    Audit History & Trends
                </h2>
                <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                    Browse previously compiled audits, delete old records, or select up to three reports to perform side-by-side comparisons.
                </p>
            </div>

            {/* Control Filter Panel */}
            <Card className="bg-card">
                <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">

                    {/* URL Search bar */}
                    <div className="relative w-full md:w-80">
                        <Input
                            type="text"
                            placeholder="Search reports by URL..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 text-xs"
                        />
                        <div className="absolute left-3 top-3.5 text-muted-foreground">
                            <Search className="h-4 w-4" />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
                        {/* Filter buttons */}
                        <div className="flex bg-secondary p-0.5 rounded-lg border border-border items-center">
                            <button
                                onClick={() => setScoreFilter("all")}
                                className={`px-3 py-1 text-xs font-bold rounded-md shrink-0 transition-all cursor-pointer ${scoreFilter === "all" ? "bg-card text-foreground" : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                All Scores
                            </button>
                            <button
                                onClick={() => setScoreFilter("excellent")}
                                className={`px-3 py-1 text-xs font-bold rounded-md shrink-0 transition-all cursor-pointer ${scoreFilter === "excellent" ? "bg-card text-emerald-500" : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                Excellent (90+)
                            </button>
                            <button
                                onClick={() => setScoreFilter("average")}
                                className={`px-3 py-1 text-xs font-bold rounded-md shrink-0 transition-all cursor-pointer ${scoreFilter === "average" ? "bg-card text-amber-500" : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                Needs Fix (50-89)
                            </button>
                            <button
                                onClick={() => setScoreFilter("poor")}
                                className={`px-3 py-1 text-xs font-bold rounded-md shrink-0 transition-all cursor-pointer ${scoreFilter === "poor" ? "bg-card text-rose-500" : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                Poor (&lt;50)
                            </button>
                        </div>

                        {/* Compare Trigger button */}
                        {selectedIds.length >= 2 && (
                            <Button
                                onClick={() => setCompareMode(true)}
                                className="gap-2 font-bold text-xs bg-primary hover:bg-primary/90 text-primary-foreground shrink-0 cursor-pointer shadow-md shadow-primary/20 animate-bounce"
                            >
                                <Layers className="h-3.5 w-3.5" />
                                Compare ({selectedIds.length})
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Trends Chart */}
            {filteredReports.length > 1 && (
                <Card className="bg-card">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <TrendingUp className="h-4.5 w-4.5 text-primary" />
                            Historical Performance Trends
                        </CardTitle>
                        <CardDescription>Visual score progression over time across your filtered audits.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-72 w-full pt-0">
                        {mounted ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={[...filteredReports].reverse().map(r => ({
                                    date: new Date(r.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                                    performance: Math.round(r.scores.performance * 100),
                                    accessibility: Math.round(r.scores.accessibility * 100),
                                    seo: Math.round(r.scores.seo * 100),
                                    bestPractices: Math.round(r.scores.bestPractices * 100),
                                    overall: Math.round(r.scores.overall * 100)
                                }))} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} opacity={0.5} />
                                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} tickMargin={10} />
                                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} domain={[0, 100]} tickCount={6} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                                        itemStyle={{ padding: '2px 0' }}
                                    />
                                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} iconType="circle" />
                                    <Line type="monotone" dataKey="performance" name="Performance" stroke="#8884d8" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                                    <Line type="monotone" dataKey="accessibility" name="Accessibility" stroke="#82ca9d" strokeWidth={2} dot={{ r: 3 }} />
                                    <Line type="monotone" dataKey="seo" name="SEO" stroke="#ffc658" strokeWidth={2} dot={{ r: 3 }} />
                                    <Line type="monotone" dataKey="overall" name="Overall" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="w-full h-full animate-pulse bg-muted/10 rounded-md" />
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Audits table list */}
            <Card className="overflow-hidden">
                {filteredReports.length === 0 ? (
                    <div className="text-center py-20 max-w-sm mx-auto space-y-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground mx-auto">
                            <Search className="h-5 w-5" />
                        </div>
                        <div>
                            <h5 className="font-bold text-foreground text-sm">No Matching Audits</h5>
                            <p className="text-xs text-muted-foreground mt-1">
                                No archived reports matched your query parameters. Try widening filters or running a new audit.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-b border-border bg-muted/40 font-bold text-muted-foreground text-[10px] uppercase">
                                    <td className="p-4 w-12 text-center text-xs">Select</td>
                                    <td className="p-4">Target Website</td>
                                    <td className="p-4">Date &amp; Time</td>
                                    <td className="p-4 text-center">Perf</td>
                                    <td className="p-4 text-center">Acc</td>
                                    <td className="p-4 text-center">BP</td>
                                    <td className="p-4 text-center">SEO</td>
                                    <td className="p-4 text-center">Overall</td>
                                    <td className="p-4 text-right">Actions</td>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredReports.map((rep) => {
                                    const isChecked = selectedIds.includes(rep.id);
                                    return (
                                        <tr
                                            key={rep.id}
                                            className={`border-b border-border/40 hover:bg-muted/20 transition-all ${isChecked ? "bg-primary/[0.01]" : ""}`}
                                        >
                                            {/* Checkbox select */}
                                            <td className="p-4 text-center">
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4 rounded-sm border-border text-primary focus:ring-primary cursor-pointer accent-primary"
                                                    checked={isChecked}
                                                    onChange={() => toggleSelectReport(rep.id)}
                                                />
                                            </td>

                                            {/* URL */}
                                            <td className="p-4">
                                                <span className="font-bold text-foreground text-xs block max-w-xs truncate" title={rep.url}>
                                                    {rep.url}
                                                </span>
                                                <span className="text-[10px] font-mono text-muted-foreground mt-0.5 block truncate max-w-[200px]" title={rep.id}>
                                                    {rep.id}
                                                </span>
                                            </td>

                                            {/* Timestamp */}
                                            <td className="p-4 text-muted-foreground">
                                                <div className="flex items-center gap-1.5 whitespace-nowrap">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    <span>{mounted ? new Date(rep.timestamp).toLocaleDateString() : "..."}</span>
                                                    <span className="text-[10px] opacity-75">{mounted ? new Date(rep.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "..."}</span>
                                                </div>
                                            </td>

                                            {/* Performance */}
                                            <td className="p-4 text-center">
                                                <Badge
                                                    variant={getRating(rep.scores.performance)}
                                                    className="font-bold rounded-sm h-6 px-1.5 w-11 justify-center inline-flex"
                                                >
                                                    {Math.round(rep.scores.performance * 100)}
                                                </Badge>
                                            </td>

                                            {/* Access */}
                                            <td className="p-4 text-center">
                                                <Badge
                                                    variant={getRating(rep.scores.accessibility)}
                                                    className="font-bold rounded-sm h-6 px-1.5 w-11 justify-center inline-flex"
                                                >
                                                    {Math.round(rep.scores.accessibility * 100)}
                                                </Badge>
                                            </td>

                                            {/* Best Practice */}
                                            <td className="p-4 text-center">
                                                <Badge
                                                    variant={getRating(rep.scores.bestPractices)}
                                                    className="font-bold rounded-sm h-6 px-1.5 w-11 justify-center inline-flex"
                                                >
                                                    {Math.round(rep.scores.bestPractices * 100)}
                                                </Badge>
                                            </td>

                                            {/* SEO */}
                                            <td className="p-4 text-center">
                                                <Badge
                                                    variant={getRating(rep.scores.seo)}
                                                    className="font-bold rounded-sm h-6 px-1.5 w-11 justify-center inline-flex"
                                                >
                                                    {Math.round(rep.scores.seo * 100)}
                                                </Badge>
                                            </td>

                                            {/* Overall Health */}
                                            <td className="p-4 text-center">
                                                <Badge
                                                    variant="outline"
                                                    className="font-black rounded-lg h-6 px-2 text-foreground justify-center inline-flex bg-muted/40 border-border/80 border"
                                                >
                                                    {Math.round(rep.scores.overall * 100)}%
                                                </Badge>
                                            </td>

                                            {/* Actions */}
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {/* Direct view link */}
                                                    <a href={`/reports/${rep.id}`}>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-8 w-8 p-0 cursor-pointer text-muted-foreground hover:text-foreground"
                                                            title="Deep Dive Report"
                                                        >
                                                            <Eye className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </a>

                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        disabled={isDeleting === rep.id}
                                                        onClick={() => handleDelete(rep.id)}
                                                        className="h-8 w-8 p-0 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                                                        title="Delete Audit"
                                                    >
                                                        {isDeleting === rep.id ? (
                                                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
}
