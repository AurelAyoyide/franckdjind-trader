import { NextResponse, type NextRequest } from "next/server";
import { UserRole } from "@prisma/client";
import { getRequestAuthorizedSession } from "@/lib/authorization";
import { bufferToArrayBuffer, createProgressWorkbook } from "@/lib/excel";
import { getLearnerRows } from "@/lib/platform-data";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await getRequestAuthorizedSession(request, ["trainer", "admin"]);
  if (!session) {
    return NextResponse.json({ error: "Export non autorise" }, { status: 401 });
  }

  if (session.role !== "admin" && session.prismaRole !== UserRole.MAIN_TRAINER) {
    return NextResponse.json({ error: "Export non autorise" }, { status: 403 });
  }

  const workbook = await createProgressWorkbook(
    await getLearnerRows({ userId: session.userId, isAdmin: session.role === "admin" }),
  );

  await prisma.auditLog.create({
    data: {
      actorId: session.userId,
      action: "PROGRESS_EXPORTED",
      target: "progress",
    },
  });

  return new Response(bufferToArrayBuffer(workbook), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="school-progressions.xlsx"',
    },
  });
}
