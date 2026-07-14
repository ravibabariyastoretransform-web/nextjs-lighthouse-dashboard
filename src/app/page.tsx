import { getReports } from "@/lib/lighthouse-service";
import DashboardClient from "@/components/dashboard/dashboard-client";

// Ensure Next.js doesn't cache this page statically so we can pull fresh disk database values
export const revalidate = 0;

export default async function Page() {
  const reports = await getReports();
  const latestReport = reports[0] || null;

  return <DashboardClient initialLatestReport={latestReport} />;
}
