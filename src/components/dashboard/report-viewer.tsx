"use client";

import React, { useState } from "react";
import {
    Gauge, Activity, Compass, ShieldAlert, Sparkles, AlertTriangle,
    CheckCircle2, XCircle, FileJson, FileText, ArrowRight, Info,
    TrendingDown, Globe, Clock, Server, FileCode, Landmark
} from "lucide-react";
import { AuditReport } from "@/types/lighthouse";
import ScoreCircle from "./score-circle";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge, Progress } from "@/components/ui/elements";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie, Legend } from "recharts";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

interface ReportViewerProps {
    report: AuditReport;
    onDelete?: (id: string) => void;
}

export default function ReportViewer({ report, onDelete }: ReportViewerProps) {
    const [activeTab, setActiveTab] = useState<"overview" | "perf" | "seo" | "acc" | "bp">("overview");
    const [exportingPdf, setExportingPdf] = useState(false);
    const [mounted, setMounted] = useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    // Setup tab menus
    const tabs = [
        { id: "overview", name: "Overview", icon: Gauge },
        { id: "perf", name: "Performance", icon: Activity },
        { id: "seo", name: "SEO Audit", icon: Compass },
        { id: "acc", name: "Accessibility", icon: Landmark },
        { id: "bp", name: "Best Practices", icon: ShieldAlert },
    ] as const;

    // Format bytes to KB/MB
    const formatBytes = (bytes: number) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const dm = 2;
        const sizes = ["Bytes", "KB", "MB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
    };

    // Convert raw category score to a rating class
    const getRating = (score: number) => {
        if (score >= 0.9) return "success";
        if (score >= 0.5) return "warning";
        return "destructive";
    };

    const getStatusText = (status: 'good' | 'needs-improvement' | 'poor') => {
        if (status === 'good') return 'Good';
        if (status === 'needs-improvement') return 'Needs Improvement';
        return 'Poor';
    };

    // Chart data formatting
    const chartData = report.performanceAnalytics.resourceSummary
        .filter(item => item.resourceType !== 'total')
        .map(item => ({
            name: item.resourceType.charAt(0).toUpperCase() + item.resourceType.slice(1),
            sizeKB: Math.round((item.size || 0) / 1024) || 0,
            count: item.count || 0
        }));

    const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe", "#00c49f"];

    // PDF Export
    const exportPDF = async () => {
        setExportingPdf(true);
        const element = document.getElementById("lighthouse-printable-area");
        if (!element) {
            setExportingPdf(false);
            return;
        }

        try {
            // Capture element to canvas
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: null
            });

            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF("p", "mm", "a4");
            const imgWidth = 210; // A4 Width
            const pageHeight = 295; // A4 Height
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save(`lighthouse-report-${report.url.replace(/[^a-zA-Z0-9]/g, "-")}.pdf`);
        } catch (e) {
            console.error("PDF Export error:", e);
        } finally {
            setExportingPdf(false);
        }
    };

    // JSON Export
    const exportJSON = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
        const downloadAnchor = document.createElement("a");
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `lighthouse-report-${report.id}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    };

    return (
        <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-card p-4 rounded-xl border border-border">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                        <Globe className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground text-sm max-w-sm truncate">{report.url}</span>
                            <Badge variant="outline" className="text-[10px]">
                                {mounted ? new Date(report.timestamp).toLocaleTimeString() : "..."}
                            </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Audited on {mounted ? new Date(report.timestamp).toLocaleDateString() : "..."}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <Button variant="outline" size="sm" onClick={exportJSON} className="gap-2 cursor-pointer">
                        <FileJson className="h-4 w-4" />
                        <span className="hidden sm:inline">Export JSON</span>
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={exportPDF}
                        disabled={exportingPdf}
                        className="gap-2 cursor-pointer"
                    >
                        <FileText className="h-4 w-4" />
                        <span>{exportingPdf ? "Generating..." : "Export PDF"}</span>
                    </Button>
                    {onDelete && (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => onDelete(report.id)}
                            className="cursor-pointer"
                        >
                            Delete
                        </Button>
                    )}
                </div>
            </div>

            {/* Main Report Container */}
            <div id="lighthouse-printable-area" className="space-y-6">

                {/* Overall Category Score Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <Card className="flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-card to-muted/20">
                        <ScoreCircle score={report.scores.performance} label="Performance" size="md" />
                    </Card>
                    <Card className="flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-card to-muted/20">
                        <ScoreCircle score={report.scores.accessibility} label="Accessibility" size="md" />
                    </Card>
                    <Card className="flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-card to-muted/20">
                        <ScoreCircle score={report.scores.bestPractices} label="Best Practices" size="md" />
                    </Card>
                    <Card className="flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-card to-muted/20">
                        <ScoreCircle score={report.scores.seo} label="SEO" size="md" />
                    </Card>
                    {/* Overall Health Score Combined Card */}
                    <Card className="col-span-2 md:col-span-1 flex flex-col justify-between p-6 bg-primary/5 border-primary/25 relative overflow-hidden group">
                        <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-4 group-hover:scale-110 transition-transform duration-300">
                            <Sparkles className="h-24 w-24 text-primary" />
                        </div>
                        <div>
                            <span className="text-[10px] uppercase font-bold text-primary tracking-widest leading-none">
                                Overall Health
                            </span>
                            <h4 className="text-4xl font-extrabold text-foreground mt-2">
                                {Math.round(report.scores.overall * 100)}%
                            </h4>
                            <p className="text-xs text-muted-foreground mt-2">
                                Composite evaluation score across all performance indicators.
                            </p>
                        </div>
                        <div className="mt-4 pt-4 border-t border-primary/10">
                            <span className="text-xs font-semibold text-primary flex items-center gap-1.5">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Audit Healthy
                            </span>
                        </div>
                    </Card>
                </div>

                {/* Tab Navigation Menu */}
                <div className="flex border-b border-border gap-1 overflow-x-auto pb-px">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-all whitespace-nowrap cursor-pointer ${isActive
                                    ? "border-primary text-primary"
                                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                                    }`}
                            >
                                <Icon className="h-4 w-4" />
                                {tab.name}
                            </button>
                        );
                    })}
                </div>

                {/* ======================================================== */}
                {/* OVERVIEW TAB */}
                {/* ======================================================== */}
                {activeTab === "overview" && (
                    <div className="space-y-6">

                        {/* Core Web Vitals Row */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Activity className="h-4.5 w-4.5 text-primary" />
                                    Core Web Vitals Assessment
                                </CardTitle>
                                <CardDescription>
                                    Critical user experience metrics measured to optimize site speed and indexing.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    {/* LCP component */}
                                    <div className="border border-border/60 rounded-xl p-4 bg-muted/20 relative group">
                                        <span className="text-xs font-bold text-muted-foreground uppercase leading-none block">Largest Contentful Paint (LCP)</span>
                                        <div className="flex items-baseline gap-2 mt-2">
                                            <span className="text-2xl font-black text-foreground">{report.coreWebVitals.lcp.displayValue}</span>
                                            <Badge variant={getRating(report.coreWebVitals.lcp.score)} className="text-[10px]">
                                                {getStatusText(report.coreWebVitals.lcp.status)}
                                            </Badge>
                                        </div>
                                        <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
                                            Measures loading performance. For a good user experience, LCP should occur within 2.5 seconds of starting to load.
                                        </p>
                                    </div>

                                    {/* CLS component */}
                                    <div className="border border-border/60 rounded-xl p-4 bg-muted/20 relative group">
                                        <span className="text-xs font-bold text-muted-foreground uppercase leading-none block">Cumulative Layout Shift (CLS)</span>
                                        <div className="flex items-baseline gap-2 mt-2">
                                            <span className="text-2xl font-black text-foreground">{report.coreWebVitals.cls.displayValue}</span>
                                            <Badge variant={getRating(report.coreWebVitals.cls.score)} className="text-[10px]">
                                                {getStatusText(report.coreWebVitals.cls.status)}
                                            </Badge>
                                        </div>
                                        <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
                                            Measures visual stability. Pages should maintain a CLS of 0.1 or less to prevent layout shifting.
                                        </p>
                                    </div>

                                    {/* TBT component/INP */}
                                    <div className="border border-border/60 rounded-xl p-4 bg-muted/20 relative group">
                                        <span className="text-xs font-bold text-muted-foreground uppercase leading-none block">Total Blocking Time (TBT)</span>
                                        <div className="flex items-baseline gap-2 mt-2">
                                            <span className="text-2xl font-black text-foreground">{report.coreWebVitals.tbt.displayValue}</span>
                                            <Badge variant={getRating(report.coreWebVitals.tbt.score)} className="text-[10px]">
                                                {getStatusText(report.coreWebVitals.tbt.status)}
                                            </Badge>
                                        </div>
                                        <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
                                            Measures input delay. Represents total time tasks took more than 50ms to run during load. Keep below 200ms.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6 pt-6 border-t border-border">
                                    {/* FCP */}
                                    <div className="flex items-center gap-3">
                                        <Clock className="h-5 w-5 text-muted-foreground shrink-0" />
                                        <div>
                                            <span className="text-xs font-bold text-muted-foreground uppercase leading-none block">First Content Paint (FCP)</span>
                                            <span className="text-sm font-bold text-foreground mt-1 block">{report.coreWebVitals.fcp.displayValue}</span>
                                        </div>
                                    </div>
                                    {/* Speed Index */}
                                    <div className="flex items-center gap-3">
                                        <Server className="h-5 w-5 text-muted-foreground shrink-0" />
                                        <div>
                                            <span className="text-xs font-bold text-muted-foreground uppercase leading-none block">Speed Index</span>
                                            <span className="text-sm font-bold text-foreground mt-1 block">{report.coreWebVitals.speedIndex.displayValue}</span>
                                        </div>
                                    </div>
                                    {/* Interaction to Next Paint */}
                                    <div className="flex items-center gap-3">
                                        <Activity className="h-5 w-5 text-muted-foreground shrink-0" />
                                        <div>
                                            <span className="text-xs font-bold text-muted-foreground uppercase leading-none block">Interaction to Next Paint (INP)</span>
                                            <span className="text-sm font-bold text-foreground mt-1 block">{report.coreWebVitals.inp.displayValue}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Asset Allocation Chart & Resource Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                            {/* Size breakdown chart */}
                            <Card className="md:col-span-2">
                                <CardHeader>
                                    <CardTitle className="text-base">Resource Sizes (KB)</CardTitle>
                                    <CardDescription>Visual breakdown of transfer weight across media types.</CardDescription>
                                </CardHeader>
                                <CardContent className="h-64">
                                    {mounted ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart
                                                data={chartData}
                                                layout="vertical"
                                                margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                                            >
                                                <XAxis type="number" stroke="currentColor" fontSize={11} />
                                                <YAxis dataKey="name" type="category" stroke="currentColor" fontSize={11} width={80} />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: 'hsl(var(--card))',
                                                        borderColor: 'hsl(var(--border))',
                                                        borderRadius: '8px'
                                                    }}
                                                />
                                                <Bar dataKey="sizeKB" name="Size (KB)" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]}>
                                                    {chartData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="w-full h-full animate-pulse bg-muted/10 rounded-md" />
                                    )}
                                </CardContent>
                            </Card>

                            {/* Request breakdown summaries */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Request Breakdown</CardTitle>
                                    <CardDescription>Number of network calls per type.</CardDescription>
                                </CardHeader>
                                <CardContent className="flex flex-col justify-center h-64 pt-0">
                                    <div className="space-y-3.5">
                                        {report.performanceAnalytics.resourceSummary
                                            .filter(item => item.resourceType !== 'total')
                                            .map((item, idx) => (
                                                <div key={item.resourceType} className="flex flex-col gap-1">
                                                    <div className="flex justify-between items-center text-xs">
                                                        <span className="capitalize font-semibold text-foreground flex items-center gap-1.5">
                                                            <span
                                                                className="h-2 w-2 rounded-full shrink-0"
                                                                style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                                                            />
                                                            {item.resourceType}
                                                        </span>
                                                        <span className="text-muted-foreground">{item.count} reqs ({formatBytes(item.size)})</span>
                                                    </div>
                                                    {/* visual breakdown bar */}
                                                    <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full"
                                                            style={{
                                                                width: `${report.performanceAnalytics.resourceSummary[0]?.size ? Math.min(100, ((item.size || 0) / report.performanceAnalytics.resourceSummary[0].size) * 100) : 0}%`,
                                                                backgroundColor: COLORS[idx % COLORS.length]
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {/* ======================================================== */}
                {/* PERFORMANCE TAB */}
                {/* ======================================================== */}
                {activeTab === "perf" && (
                    <div className="space-y-6">

                        {/* Opportunities (Actionable suggestions to improve speed) */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Sparkles className="h-4.5 w-4.5 text-primary" />
                                    Audit Opportunities
                                </CardTitle>
                                <CardDescription>
                                    Make optimizations here to shave off critical load time. These suggest improvements that are highly actionable.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {report.performanceAnalytics.opportunities.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-6 text-center border border-dashed border-border rounded-xl">
                                        <CheckCircle2 className="h-8 w-8 text-emerald-500 mb-2" />
                                        <span className="text-sm font-semibold">Outstanding Optimization Status</span>
                                        <p className="text-xs text-muted-foreground mt-1">No significant performance opportunities found!</p>
                                    </div>
                                ) : (
                                    report.performanceAnalytics.opportunities.map((opp) => (
                                        <div
                                            key={opp.id}
                                            className="border border-border/80 rounded-xl p-4 hover:bg-muted/30 transition-all"
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                                                <div className="space-y-1">
                                                    <span className="text-sm font-bold text-foreground">{opp.title}</span>
                                                    <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">{opp.description}</p>
                                                </div>
                                                <div className="shrink-0 flex items-center gap-2">
                                                    <Badge variant="destructive">{opp.displayValue}</Badge>
                                                    <div
                                                        className="h-2.5 w-2.5 rounded-full"
                                                        style={{
                                                            backgroundColor: opp.score >= 0.9 ? 'hsl(var(--success))' : opp.score >= 0.5 ? 'hsl(var(--warning))' : 'hsl(var(--destructive))'
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>

                        {/* Diagnostics & Resource summaries */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Diagnostics */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Diagnostics</CardTitle>
                                    <CardDescription>Detailed page diagnostics regarding execution and load thresholds.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {report.performanceAnalytics.diagnostics.map((diag) => (
                                        <div key={diag.id} className="flex justify-between items-start gap-4 border-b border-border/50 pb-3 last:border-0 last:pb-0">
                                            <div className="space-y-0.5">
                                                <span className="text-xs font-bold text-foreground">{diag.title}</span>
                                                <p className="text-[11px] text-muted-foreground leading-relaxed">{diag.description}</p>
                                            </div>
                                            <Badge variant="secondary" className="shrink-0 text-[10px] whitespace-nowrap">
                                                {diag.displayValue}
                                            </Badge>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            {/* Largest Assets Table */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Largest Network Assets</CardTitle>
                                    <CardDescription>Top resources by transfer size.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-xs">
                                            <thead>
                                                <tr className="border-b border-border bg-muted/40 font-semibold text-muted-foreground">
                                                    <td className="p-3">Asset URL</td>
                                                    <td className="p-3 text-right">Transfer Weight</td>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {report.performanceAnalytics.largestAssets.map((asset, i) => (
                                                    <tr key={i} className="border-b border-border/40 hover:bg-muted/30">
                                                        <td className="p-3 max-w-xs truncate font-mono text-[10px]" title={asset.url}>
                                                            {asset.url}
                                                        </td>
                                                        <td className="p-3 text-right font-bold text-foreground">
                                                            {formatBytes(asset.totalBytes)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* JS Execution Time Table */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <FileCode className="h-4.5 w-4.5 text-primary" />
                                    JavaScript Execution Duration
                                </CardTitle>
                                <CardDescription>
                                    Detailed CPU execution analysis of major script compiles on loading thread.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-xs">
                                        <thead>
                                            <tr className="border-b border-border bg-muted/40 font-semibold text-muted-foreground">
                                                <td className="p-3">Script Bundle</td>
                                                <td className="p-3 text-right">Execution Time</td>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {report.performanceAnalytics.javascriptExecutionTime.map((script, idx) => (
                                                <tr key={idx} className="border-b border-border/40 hover:bg-muted/30">
                                                    <td className="p-3 max-w-md truncate font-mono text-[10px]" title={script.url}>
                                                        {script.url}
                                                    </td>
                                                    <td className="p-3 text-right">
                                                        <Badge variant={script.duration > 800 ? "destructive" : script.duration > 350 ? "warning" : "default"}>
                                                            {script.duration} ms
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* ======================================================== */}
                {/* SEO ANAYLTICS TAB */}
                {/* ======================================================== */}
                {activeTab === "seo" && (
                    <div className="space-y-6">

                        {/* Checklist items */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-xs uppercase text-muted-foreground tracking-wider font-bold">Metadata Elements</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 shrink-0">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Document Title</span>
                                        {report.seoAnalytics.metadata.hasTitle ? (
                                            <Badge variant="success" className="text-[10px]">Detected</Badge>
                                        ) : (
                                            <Badge variant="destructive" className="text-[10px]">Missing</Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Meta Description</span>
                                        {report.seoAnalytics.metadata.hasMetaDescription ? (
                                            <Badge variant="success" className="text-[10px]">Detected</Badge>
                                        ) : (
                                            <Badge variant="destructive" className="text-[10px]">Missing</Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Mobile Viewport</span>
                                        {report.seoAnalytics.metadata.hasViewport ? (
                                            <Badge variant="success" className="text-[10px]">Detected</Badge>
                                        ) : (
                                            <Badge variant="destructive" className="text-[10px]">Missing</Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Heading Level 1 (`h1`)</span>
                                        {report.seoAnalytics.metadata.hasH1 ? (
                                            <Badge variant="success" className="text-[10px]">Detected</Badge>
                                        ) : (
                                            <Badge variant="destructive" className="text-[10px]">Missing</Badge>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-xs uppercase text-muted-foreground tracking-wider font-bold">Crawler Indexation</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Engine Crawlable</span>
                                        {report.seoAnalytics.metadata.isIndexable ? (
                                            <Badge variant="success" className="text-[10px]">Passed</Badge>
                                        ) : (
                                            <Badge variant="destructive" className="text-[10px]">Blocked</Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Structured Schema</span>
                                        {report.seoAnalytics.structuredData.valid ? (
                                            <Badge variant="success" className="text-[10px]">Schemas Valid</Badge>
                                        ) : (
                                            <Badge variant="warning" className="text-[10px]">None Linked</Badge>
                                        )}
                                    </div>
                                    {report.seoAnalytics.structuredData.detectedTypes.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2.5">
                                            {report.seoAnalytics.structuredData.detectedTypes.map(k => (
                                                <Badge key={k} variant="secondary" className="px-1.5 py-0.5 text-[9px]">{k}</Badge>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="flex flex-col justify-between p-6 bg-muted/20">
                                <div className="space-y-2">
                                    <span className="text-[10px] tracking-widest font-black uppercase text-muted-foreground leading-none">SEO Overall Rating</span>
                                    <h4 className="text-3xl font-extrabold text-foreground mt-1">
                                        {Math.round(report.scores.seo * 100)} / 100
                                    </h4>
                                    <p className="text-xs text-muted-foreground">
                                        Your indexing health aligns correctly with crawler standards.
                                    </p>
                                </div>
                                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs font-semibold">
                                    <span className="text-emerald-500">{report.seoAnalytics.passed.length} Passed</span>
                                    <span className="text-rose-500">{report.seoAnalytics.failed.length} Warnings</span>
                                </div>
                            </Card>
                        </div>

                        {/* Failed SEO Checks */}
                        {report.seoAnalytics.failed.length > 0 && (
                            <Card className="border-rose-500/20 bg-rose-500/[0.02]">
                                <CardHeader>
                                    <CardTitle className="text-base text-rose-500 flex items-center gap-1.5">
                                        <XCircle className="h-4.5 w-4.5" />
                                        Failed Search Checks
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {report.seoAnalytics.failed.map((audit) => (
                                        <div key={audit.id} className="border-b border-rose-500/10 pb-3 last:border-0 last:pb-0">
                                            <div className="flex justify-between items-start gap-3">
                                                <span className="text-xs font-bold text-foreground">{audit.title}</span>
                                                {audit.displayValue && <Badge variant="destructive">{audit.displayValue}</Badge>}
                                            </div>
                                            <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{audit.description}</p>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        {/* Passed SEO Checks */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base text-emerald-500 flex items-center gap-1.5">
                                    <CheckCircle2 className="h-4.5 w-4.5" />
                                    Successfully Validated Crawl Elements
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {report.seoAnalytics.passed.map((audit) => (
                                    <div key={audit.id} className="p-3 border border-border/70 rounded-lg bg-card hover:bg-muted/10">
                                        <span className="text-xs font-bold text-foreground block">{audit.title}</span>
                                        <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">{audit.description}</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* ======================================================== */}
                {/* ACCESSIBILITY TAB */}
                {/* ======================================================== */}
                {activeTab === "acc" && (
                    <div className="space-y-6">

                        {/* Overview items */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="p-5 flex flex-col justify-between">
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest block">ARIA Configuration</span>
                                    <h5 className="text-lg font-black text-foreground mt-2">
                                        {report.accessibilityAnalytics.ariaValidation.passed ? "Passed Validation" : "Attention Required"}
                                    </h5>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Assistive markup complies with index tags and accessible roles.
                                    </p>
                                </div>
                                <div className="mt-4 pt-4 border-t border-border">
                                    <Badge variant={report.accessibilityAnalytics.ariaValidation.passed ? "success" : "destructive"}>
                                        ARIA Score: {Math.round(report.accessibilityAnalytics.ariaValidation.score * 100)}%
                                    </Badge>
                                </div>
                            </Card>

                            <Card className="p-5 flex flex-col justify-between">
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest block">Contrast Assessment</span>
                                    <h5 className="text-lg font-black text-foreground mt-2">
                                        {report.accessibilityAnalytics.colorContrast.passed ? "Sufficient Contrast" : "Contrast Violations"}
                                    </h5>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Text visual luminosity meets WCAG AA 4.5:1 ratio targets.
                                    </p>
                                </div>
                                <div className="mt-4 pt-4 border-t border-border">
                                    <Badge variant={report.accessibilityAnalytics.colorContrast.passed ? "success" : "destructive"}>
                                        Contrast Score: {Math.round(report.accessibilityAnalytics.colorContrast.score * 100)}%
                                    </Badge>
                                </div>
                            </Card>

                            <Card className="p-6 bg-muted/20 flex flex-col justify-between">
                                <div className="space-y-1">
                                    <span className="text-[10px] tracking-widest font-black uppercase text-muted-foreground leading-none">Accessibility Rating</span>
                                    <h4 className="text-3xl font-extrabold text-foreground mt-1">
                                        {Math.round(report.scores.accessibility * 100)} / 100
                                    </h4>
                                    <p className="text-xs text-muted-foreground">
                                        Visual readability and keyboard navigation markers check values.
                                    </p>
                                </div>
                                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs font-semibold">
                                    <span className="text-emerald-500">{report.accessibilityAnalytics.passed.length} Passed</span>
                                    <span className="text-rose-500">{report.accessibilityAnalytics.failed.length} Errors</span>
                                </div>
                            </Card>
                        </div>

                        {/* Accessibility Errors */}
                        {report.accessibilityAnalytics.failed.length > 0 && (
                            <Card className="border-rose-500/20 bg-rose-500/[0.02]">
                                <CardHeader>
                                    <CardTitle className="text-base text-rose-500 flex items-center gap-1.5">
                                        <XCircle className="h-4.5 w-4.5" />
                                        Detected Usability Barriers
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {report.accessibilityAnalytics.failed.map((audit) => (
                                        <div key={audit.id} className="border-b border-rose-500/10 pb-3 last:border-0 last:pb-0">
                                            <div className="flex justify-between items-start gap-3">
                                                <span className="text-xs font-bold text-foreground">{audit.title}</span>
                                                {audit.displayValue && (
                                                    <Badge variant="destructive" className="shrink-0 text-[10px]">
                                                        {audit.displayValue}
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{audit.description}</p>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        {/* Passed Accessibility Audits */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base text-emerald-500 flex items-center gap-1.5">
                                    <CheckCircle2 className="h-4.5 w-4.5" />
                                    Passed Accessibility Standards
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {report.accessibilityAnalytics.passed.map((audit) => (
                                    <div key={audit.id} className="p-3 border border-border/70 rounded-lg bg-card">
                                        <span className="text-xs font-bold text-foreground block">{audit.title}</span>
                                        <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">{audit.description}</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* ======================================================== */}
                {/* BEST PRACTICES TAB */}
                {/* ======================================================== */}
                {activeTab === "bp" && (
                    <div className="space-y-6">

                        {/* Quick configuration grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                            <Card className="p-4 flex flex-col justify-between items-center text-center">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground">HTTPS Active</span>
                                <div className="my-3">
                                    {report.bestPracticesAnalytics.security.https ? (
                                        <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                                    ) : (
                                        <AlertTriangle className="h-8 w-8 text-rose-500" />
                                    )}
                                </div>
                                <Badge variant={report.bestPracticesAnalytics.security.https ? "success" : "destructive"}>
                                    {report.bestPracticesAnalytics.security.https ? "Secure" : "Insecure"}
                                </Badge>
                            </Card>

                            <Card className="p-4 flex flex-col justify-between items-center text-center">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground">Safe Links (`rel`)</span>
                                <div className="my-3">
                                    {report.bestPracticesAnalytics.security.noUnsafeLinks ? (
                                        <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                                    ) : (
                                        <AlertTriangle className="h-8 w-8 text-rose-500" />
                                    )}
                                </div>
                                <Badge variant={report.bestPracticesAnalytics.security.noUnsafeLinks ? "success" : "destructive"}>
                                    {report.bestPracticesAnalytics.security.noUnsafeLinks ? "Compliant" : "Fail"}
                                </Badge>
                            </Card>

                            <Card className="p-4 flex flex-col justify-between items-center text-center">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground">Console Log Clear</span>
                                <div className="my-3">
                                    {report.bestPracticesAnalytics.security.noConsoleErrors ? (
                                        <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                                    ) : (
                                        <AlertTriangle className="h-8 w-8 text-amber-500" />
                                    )}
                                </div>
                                <Badge variant={report.bestPracticesAnalytics.security.noConsoleErrors ? "success" : "warning"}>
                                    {report.bestPracticesAnalytics.security.noConsoleErrors ? "No Errors" : "Logs Detected"}
                                </Badge>
                            </Card>

                            <Card className="p-4 flex flex-col justify-between items-center text-center">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground">Safe Dependencies</span>
                                <div className="my-3">
                                    {report.bestPracticesAnalytics.security.modernLibs ? (
                                        <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                                    ) : (
                                        <AlertTriangle className="h-8 w-8 text-rose-500" />
                                    )}
                                </div>
                                <Badge variant={report.bestPracticesAnalytics.security.modernLibs ? "success" : "destructive"}>
                                    {report.bestPracticesAnalytics.security.modernLibs ? "Up to Date" : "Unsafe Link"}
                                </Badge>
                            </Card>
                        </div>

                        {/* Image optimization panel */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center justify-between">
                                    <span>Image Optimization Report</span>
                                    <Badge variant={getRating(report.bestPracticesAnalytics.imageOptimization.score)}>
                                        Score: {Math.round(report.bestPracticesAnalytics.imageOptimization.score * 100)}%
                                    </Badge>
                                </CardTitle>
                                <CardDescription>
                                    Checks if image assets are resized and compressed correctly. Failing images slow down browser rendering speeds.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {report.bestPracticesAnalytics.imageOptimization.opportunities.length === 0 ? (
                                    <div className="flex items-center gap-3 p-3 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs">
                                        <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
                                        <span>All page images are fully optimized! No wastes detected.</span>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center bg-muted/40 p-3 rounded-lg text-xs font-semibold">
                                            <span>Image URL</span>
                                            <div className="flex gap-4">
                                                <span>Original Size</span>
                                                <span className="text-rose-500">Wasted Size</span>
                                            </div>
                                        </div>
                                        {report.bestPracticesAnalytics.imageOptimization.opportunities.map((img, i) => (
                                            <div key={i} className="flex justify-between items-center border-b border-border/40 pb-3 last:border-0 last:pb-0 text-xs">
                                                <span className="font-mono text-[10px] truncate max-w-sm" title={img.url}>{img.url}</span>
                                                <div className="flex gap-4 font-mono text-[10px]">
                                                    <span className="text-muted-foreground">{formatBytes(img.size)}</span>
                                                    <span className="text-rose-500 font-bold">-{formatBytes(img.wastedBytes)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Failed best practices audits */}
                        {report.bestPracticesAnalytics.failed.length > 0 && (
                            <Card className="border-rose-500/20 bg-rose-500/[0.02]">
                                <CardHeader>
                                    <CardTitle className="text-base text-rose-500 flex items-center gap-1.5">
                                        <XCircle className="h-4.5 w-4.5" />
                                        Failed Best Practice Checks
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {report.bestPracticesAnalytics.failed.map((audit) => (
                                        <div key={audit.id} className="border-b border-rose-500/10 pb-3 last:border-0 last:pb-0">
                                            <div className="flex justify-between items-start gap-4">
                                                <span className="text-xs font-bold text-foreground">{audit.title}</span>
                                                {audit.displayValue && (
                                                    <Badge variant="destructive" className="text-[10px]">{audit.displayValue}</Badge>
                                                )}
                                            </div>
                                            <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{audit.description}</p>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        {/* Passed best practices audits */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base text-emerald-500 flex items-center gap-1.5">
                                    <CheckCircle2 className="h-4.5 w-4.5" />
                                    Passed Audits checklist
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {report.bestPracticesAnalytics.passed.map((audit) => (
                                    <div key={audit.id} className="p-3 border border-border/70 rounded-lg bg-card">
                                        <span className="text-xs font-bold text-foreground block">{audit.title}</span>
                                        <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">{audit.description}</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
