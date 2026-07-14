import { NextRequest, NextResponse } from 'next/server';
import { getReportById, deleteReport } from '@/lib/lighthouse-service';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const report = await getReportById(id);
        if (!report) {
            return NextResponse.json(
                { success: false, error: `Report with ID "${id}" not found` },
                { status: 404 }
            );
        }
        return NextResponse.json({ success: true, report });
    } catch (e: any) {
        return NextResponse.json(
            { success: false, error: e.message || 'Failed to fetch report details' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const deleted = await deleteReport(id);
        if (!deleted) {
            return NextResponse.json(
                { success: false, error: `Report metadata with ID "${id}" could not be deleted or doesn't exist` },
                { status: 404 }
            );
        }
        return NextResponse.json({ success: true, message: 'Report deleted successfully' });
    } catch (e: any) {
        return NextResponse.json(
            { success: false, error: e.message || 'Failed to delete report' },
            { status: 500 }
        );
    }
}
