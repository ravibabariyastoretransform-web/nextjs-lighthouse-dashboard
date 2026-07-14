import { NextResponse } from "next/server";
import { saveReport, generateMockReport } from "@/lib/lighthouse-service";

export async function POST() {
    try {
        const seedUrls = [
            'https://nextjs.org',
            'https://github.com',
            'https://vercel.com',
            'https://tailwindcss.com',
            'https://google.com',
            'https://youtube.com',
            'https://react.dev'
        ];

        for (let i = 0; i < seedUrls.length; i++) {
            const report = generateMockReport(seedUrls[i]);
            const date = new Date();
            date.setDate(date.getDate() - i * 2); // Space files chronologically
            report.timestamp = date.toISOString();
            // Ensure unique IDs each time seed runs
            report.id = `report_seed_${Date.now()}_${i + 1}`;
            await saveReport(report);
        }
        return NextResponse.json({ success: true, message: "Database seeding complete." });
    } catch (e: any) {
        return NextResponse.json(
            { success: false, error: e.message || "Failed to seed demo data" },
            { status: 500 }
        );
    }
}
