import { promises as fs } from "node:fs";
import path from "node:path";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, props: { params: Promise<{ path: string[] }> }) {
    const { path: segments } = await props.params;
    const fileName = segments.join("/");

    if (fileName.includes("..") || fileName.includes("\0")) {
        return new NextResponse("Invalid path", { status: 400 });
    }

    const filePath = path.join(process.cwd(), "public", "uploads", fileName);

    try {
        const fileStat = await fs.stat(filePath);
        if (!fileStat.isFile()) throw new Error("Not a file");

        const fileBuffer = await fs.readFile(filePath);

        const ext = path.extname(fileName).toLowerCase();
        let contentType = "application/octet-stream";
        if (ext === ".png") contentType = "image/png";
        else if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
        else if (ext === ".webp") contentType = "image/webp";
        else if (ext === ".avif") contentType = "image/avif";
        else if (ext === ".svg") contentType = "image/svg+xml";

        return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=31536000, immutable"
            }
        });
    } catch (error) {
        return new NextResponse("Not Found", { status: 404 });
    }
}
