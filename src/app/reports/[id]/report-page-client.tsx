"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, HardDrive, RefreshCw } from "lucide-react";
import Link from "next/link";
import { AuditReport } from "@/types/lighthouse";
import { Button } from "@/components/ui/elements";
import ReportViewer from "@/components/dashboard/report-viewer";

export default function ReportPageClient({ report }: { report: AuditReport }) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this audit report?")) return;
        setIsDeleting(true);
        try {
            const response = await fetch(`/api/audit/${id}`, {
                method: "DELETE",
            });
            const data = await response.json();
            if (response.ok && data.success) {
                router.push("/history");
            } else {
                alert(data.error || "Failed to delete report.");
                setIsDeleting(false);
            }
        } catch (e) {
            console.error(e);
            alert("Error contacting the delete endpoint.");
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between pb-2">
                <div className="flex items-center gap-4">
                    <Link href="/history">
                        <Button variant="outline" size="sm" className="gap-2 cursor-pointer h-9">
                            <ArrowLeft className="h-4 w-4" />
                            <span>Back to History</span>
                        </Button>
                    </Link>
                    <div>
                        <h2 className="text-lg md:text-xl font-black tracking-tight text-foreground leading-none">
                            Audit Detail Report
                        </h2>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1 font-mono">
                            <HardDrive className="h-3 w-3 shrink-0" />
                            ID: {report.id}
                        </p>
                    </div>
                </div>
            </div>

            {isDeleting ? (
                <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed rounded-xl bg-card">
                    <RefreshCw className="h-8 w-8 text-primary animate-spin mb-3" />
                    <span className="font-bold text-sm text-foreground">Deleting Audit Record</span>
                    <p className="text-xs text-muted-foreground mt-1">Please wait while the page is clearing...</p>
                </div>
            ) : (
                <ReportViewer report={report} onDelete={handleDelete} />
            )}
        </div>
    );
}
