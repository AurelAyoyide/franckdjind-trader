import { promises as fs } from "node:fs";
import path from "node:path";
import { type NextRequest, NextResponse } from "next/server";
import { contentTypeForUploadedImage, resolveUploadedImagePath } from "@/lib/media-storage";

async function fallbackImageResponse(method: "GET" | "HEAD") {
    const fallbackPath = path.resolve(process.cwd(), "public", "og-image.png");
    const headers = {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=60",
        "X-Content-Type-Options": "nosniff",
        "X-Upload-Fallback": "missing-file"
    };

    try {
        const fileBuffer = method === "HEAD" ? null : await fs.readFile(fallbackPath);
        return new NextResponse(fileBuffer, { status: 200, headers });
    } catch {
        return new NextResponse(method === "HEAD" ? null : "Not Found", { status: 404 });
    }
}

async function uploadedImageResponse(method: "GET" | "HEAD", props: { params: Promise<{ path: string[] }> }) {
    const { path: segments } = await props.params;
    const filePath = resolveUploadedImagePath(segments);

    if (!filePath) {
        return new NextResponse("Invalid path", { status: 400 });
    }

    try {
        const fileStat = await fs.stat(filePath);
        if (!fileStat.isFile()) throw new Error("Not a file");

        const fileBuffer = method === "HEAD" ? null : await fs.readFile(filePath);
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
        return fallbackImageResponse(method);
    }
}

export async function GET(_request: NextRequest, props: { params: Promise<{ path: string[] }> }) {
    return uploadedImageResponse("GET", props);
}

export async function HEAD(_request: NextRequest, props: { params: Promise<{ path: string[] }> }) {
    return uploadedImageResponse("HEAD", props);
}
