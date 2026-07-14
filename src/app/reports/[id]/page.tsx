import { getReportById } from "@/lib/lighthouse-service";
import { notFound } from "next/navigation";
import ReportPageClient from "./report-page-client";

interface ReportDetailPageProps {
    params: Promise<{ id: string }>;
}

export const revalidate = 0;

export default async function ReportDetailPage({ params }: ReportDetailPageProps) {
    const { id } = await params;
    const report = await getReportById(id);

    if (!report) {
        notFound();
    }

    return <ReportPageClient report={report} />;
}
