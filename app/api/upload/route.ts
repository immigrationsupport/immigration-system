import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
    try {
        // Auth check
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file || file.size === 0) {
            return NextResponse.json({ error: "No file provided." }, { status: 400 });
        }

        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json({ error: "File too large. Max 10MB." }, { status: 400 });
        }

        // Validate file type
        const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: "Invalid file type. Only PDF, JPG, PNG allowed." }, { status: 400 });
        }

        // Build safe filename
        const timestamp = Date.now();
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const filename = `${timestamp}-${safeName}`;

        // Ensure uploads directory exists
        const uploadsDir = path.join(process.cwd(), "public", "uploads");
        await mkdir(uploadsDir, { recursive: true });

        // Write file to disk
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filePath = path.join(uploadsDir, filename);
        await writeFile(filePath, buffer);

        // Return public URL
        const publicUrl = `/uploads/${filename}`;
        return NextResponse.json({ url: publicUrl }, { status: 200 });

    } catch (err: any) {
        console.error("[UPLOAD ERROR]", err);
        return NextResponse.json({ error: err.message || "Upload failed." }, { status: 500 });
    }
}
