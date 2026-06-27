import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { getAuthorizedSession } from "@/lib/authorization";
import { UserRole } from "@prisma/client";

export async function POST(req: NextRequest) {
    try {
        const session = await getAuthorizedSession(["trainer", "admin"]);
        if (!session || (session.role !== "admin" && session.prismaRole !== UserRole.MAIN_TRAINER)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file || !file.size) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const bytes = Buffer.from(await file.arrayBuffer());

        const configuredUploadDir = process.env.PRIVATE_UPLOAD_DIR;
        const root = configuredUploadDir && path.isAbsolute(configuredUploadDir)
            ? path.resolve(configuredUploadDir)
            : path.join(process.cwd(), configuredUploadDir ?? "private_uploads");

        await fs.mkdir(root, { recursive: true });

        const safeName = file.name.replace(/[^a-z0-9.]/gi, "_").toLowerCase();
        const fileName = `${Date.now()}-${safeName}`;
        const filePath = path.join(root, fileName);

        await fs.writeFile(filePath, bytes);

        return NextResponse.json({ fileName });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Server upload failed" }, { status: 500 });
    }
}
