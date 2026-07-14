import { getReports } from "@/lib/lighthouse-service";
import HistoryClient from "@/components/dashboard/history-client";

// Disable page static caching to pulling fresh data from disk database on load
export const revalidate = 0;

export default async function HistoryPage() {
    const reports = await getReports();
    return <HistoryClient initialReports={reports} />;
}
