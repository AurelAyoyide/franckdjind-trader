import { promises as fs } from "node:fs";
import { type NextRequest, NextResponse } from "next/server";
import { contentTypeForUploadedImage, resolveUploadedImagePath } from "@/lib/media-storage";

export async function GET(_request: NextRequest, props: { params: Promise<{ path: string[] }> }) {
    const { path: segments } = await props.params;
    const filePath = resolveUploadedImagePath(segments);

    if (!filePath) {
        return new NextResponse("Invalid path", { status: 400 });
    }

    try {
        const fileStat = await fs.stat(filePath);
        if (!fileStat.isFile()) throw new Error("Not a file");

        const fileBuffer = await fs.readFile(filePath);
        const contentType = contentTypeForUploadedImage(filePath);

        return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=31536000, immutable",
                "X-Content-Type-Options": "nosniff"
            }
        });
    } catch {
        return new NextResponse("Not Found", { status: 404 });
    }
}
