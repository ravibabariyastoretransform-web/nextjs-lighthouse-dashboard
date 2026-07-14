"use client";

import React, { useState } from "react";
import {
    Settings, RefreshCw, HardDrive, ShieldAlert, FileCode, CheckCircle2,
    Trash2, Lightbulb, Info, FileText, Check, Copy
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from "@/components/ui/elements";

export default function SettingsClient() {
    const [seeding, setSeeding] = useState(false);
    const [resetting, setResetting] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleSeed = async () => {
        setSeeding(true);
        try {
            const res = await fetch("/api/settings/seed", { method: "POST" });
            const data = await res.json();
            if (res.ok && data.success) {
                alert("Success! Tech benchmark reports seeded into reports folder.");
            } else {
                alert(data.error || "Failed to seed demo data.");
            }
        } catch (e) {
            console.error(e);
            alert("Error calling seed API.");
        } finally {
            setSeeding(false);
        }
    };

    const handleReset = async () => {
        if (!confirm("CRITICAL WARNING: This will delete ALL reports stored in reports_data/ folder. This action is irreversible. Proceed?")) {
            return;
        }
        setResetting(true);
        try {
            const res = await fetch("/api/settings/reset", { method: "POST" });
            const data = await res.json();
            if (res.ok && data.success) {
                alert("Completed! All stored report JSONs have been purged.");
            } else {
                alert(data.error || "Failed to purge historical reports.");
            }
        } catch (e) {
            console.error(e);
            alert("Error calling reset API.");
        } finally {
            setResetting(false);
        }
    };

    const environmentVariablesCode = `# CLI Engine Configuration
PORT=3000
HOST=0.0.0.0
NODE_ENV=production

# Chrome Binaries Launcher Setup
CHROME_PATH="C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
Lighthouse_CHROME_FLAGS="--headless --no-sandbox --disable-gpu --disable-dev-shm-usage"`;

    const dockerfileCode = `FROM node:18-slim

# Install Google Chrome dependencies and Chromium for Lighthouse CLI
RUN apt-get update && apt-get install -y \\
    chromium \\
    fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \\
    --no-install-recommends \\
    && rm -rf /var/lib/apt/lists/*

# Set Chrome Environment flag paths for programmatic execution
ENV CHROME_PATH=/usr/bin/chromium

# Initialize App Workspace
WORKDIR /app
COPY package*.json ./
RUN npm install

# Build Next.js Dashboard
COPY . .
RUN npm run build

# Start Console Server
EXPOSE 3000
CMD ["npm", "start"]`;

    return (
        <div className="space-y-6">
            {/* Title */}
            <div>
                <h2 className="text-xl md:text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
                    <Settings className="h-6 w-6 text-primary" />
                    Analytics Configuration
                </h2>
                <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                    Configure backend operations, check CLI dependencies, initialize template resources, and review server builds.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Maintenance Card */}
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                            <HardDrive className="h-4 w-4 text-primary" />
                            Database Maintenance
                        </CardTitle>
                        <CardDescription>Manage local audit storage databases.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1 bg-muted/20 p-3 rounded-lg border border-border/40">
                            <span className="text-xs font-bold text-foreground">Seed Tech Benchmarks</span>
                            <p className="text-[10px] text-muted-foreground leading-relaxed mt-1">
                                Generates seven mock audits for domains like GitHub, Nextjs, Vercel, and React to populating history streams.
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleSeed}
                                disabled={seeding || resetting}
                                className="w-full mt-3 h-8.5 font-semibold text-xs gap-1.5 cursor-pointer hover:bg-primary/5 hover:text-primary hover:border-primary/20"
                            >
                                {seeding ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : null}
                                <span>{seeding ? "Seeding Records..." : "Seed Benchmark Audits"}</span>
                            </Button>
                        </div>

                        <div className="space-y-1 bg-rose-500/[0.02] p-3 rounded-lg border border-rose-500/10">
                            <span className="text-xs font-bold text-rose-500">Purge Report Indexes</span>
                            <p className="text-[10px] text-muted-foreground leading-relaxed mt-1">
                                Completely deletes all saved report JSON files from directories on the server. Irreversible action.
                            </p>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleReset}
                                disabled={seeding || resetting}
                                className="w-full mt-3 h-8.5 font-bold text-xs gap-1.5 cursor-pointer bg-rose-500 hover:bg-rose-600"
                            >
                                {resetting ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                                <span>{resetting ? "Reseting Files..." : "Purge All Audits"}</span>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Requirements Card */}
                <Card className="md:col-span-2 space-y-2">
                    <CardHeader>
                        <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                            <Info className="h-4 w-4 text-primary" />
                            Lighthouse CLI Operation Details
                        </CardTitle>
                        <CardDescription>How audits are executed in background threads.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-xs leading-relaxed text-muted-foreground">
                        <div className="flex items-start gap-2.5">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                            <p>
                                <strong className="text-foreground">Spawning Headless Chrome:</strong> Programmatic lighthouse audits require Chrome or Chromium binaries compile configurations. The server utilizes standard `child_process.exec` actions to launch Chrome headlessly.
                            </p>
                        </div>
                        <div className="flex items-start gap-2.5">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                            <p>
                                <strong className="text-foreground">Fallback Simulation Layer:</strong> In environments lacking Chromium (like lightweight server containers), the server triggers a determinist mock fallback based on DNS domain hashing. This keeps page loads functioning smoothly.
                            </p>
                        </div>
                        <div className="flex items-start gap-2.5">
                            <Lightbulb className="h-4 w-4 text-primary shrink-0 mt-0.5 animate-pulse" />
                            <p>
                                <strong className="text-foreground">Performance tip:</strong> For faster scan times, ensure CPU throttling thresholds remain low in Chrome configurations and audit targets reside on cache-ready hosting providers.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Configuration tabs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* ENV Variables */}
                <Card>
                    <CardHeader className="pb-3 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-xs uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1">
                                <FileText className="h-4 w-4 text-primary" />
                                Environment Setup (.env.local)
                            </CardTitle>
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 text-xs border-border/80 hover:bg-muted cursor-pointer shrink-0"
                            onClick={() => handleCopy(environmentVariablesCode, "env")}
                        >
                            {copiedId === "env" ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0 border-t border-border">
                        <pre className="p-4 bg-muted/60 text-foreground font-mono text-[10px] overflow-x-auto leading-relaxed max-h-72">
                            {environmentVariablesCode}
                        </pre>
                    </CardContent>
                </Card>

                {/* Dockerfile Setup */}
                <Card>
                    <CardHeader className="pb-3 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-xs uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1">
                                <FileCode className="h-4 w-4 text-primary" />
                                Docker Container Configuration (Dockerfile)
                            </CardTitle>
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 text-xs border-border/80 hover:bg-muted cursor-pointer shrink-0"
                            onClick={() => handleCopy(dockerfileCode, "docker")}
                        >
                            {copiedId === "docker" ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0 border-t border-border">
                        <pre className="p-4 bg-muted/60 text-foreground font-mono text-[10px] overflow-x-auto leading-relaxed max-h-72">
                            {dockerfileCode}
                        </pre>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
