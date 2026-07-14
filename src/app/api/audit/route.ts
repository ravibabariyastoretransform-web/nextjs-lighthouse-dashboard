import { NextRequest, NextResponse } from 'next/server';
import { getReports, runLighthouseAudit } from '@/lib/lighthouse-service';

export async function GET() {
    try {
        const list = await getReports();
        return NextResponse.json({ success: true, reports: list });
    } catch (e: any) {
        return NextResponse.json(
            { success: false, error: e.message || 'Failed to retrieve audit history' },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => ({}));
        const { url, simulated } = body;

        if (!url) {
            return NextResponse.json(
                { success: false, error: 'A URL is required' },
                { status: 400 }
            );
        }

        // Basic URL validation
        let validUrl = url.trim();
        if (!/^https?:\/\//i.test(validUrl)) {
            validUrl = 'https://' + validUrl;
        }

        try {
            new URL(validUrl);
        } catch (_) {
            return NextResponse.json(
                { success: false, error: 'Invalid URL format provided' },
                { status: 400 }
            );
        }

        console.log(`Starting Lighthouse audit for: ${validUrl} (simulated: ${!!simulated})`);

        // We run the audit - it saves to disk internally
        const report = await runLighthouseAudit(validUrl, simulated);

        return NextResponse.json({ success: true, report });
    } catch (e: any) {
        console.error('Audit API failed:', e);
        return NextResponse.json(
            { success: false, error: e.message || 'An error occurred during the audit' },
            { status: 500 }
        );
    }
}
