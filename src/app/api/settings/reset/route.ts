import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const REPORTS_DIR = path.join(process.cwd(), "reports_data");

export async function POST() {
    try {
        if (fs.existsSync(REPORTS_DIR)) {
            const files = fs.readdirSync(REPORTS_DIR);
            for (const file of files) {
                if (file.endsWith(".json")) {
                    fs.unlinkSync(path.join(REPORTS_DIR, file));
                }
            }
        }
        return NextResponse.json({ success: true, message: "Database reset complete." });
    } catch (e: any) {
        return NextResponse.json(
            { success: false, error: e.message || "Failed to reset database" },
            { status: 500 }
        );
    }
}
