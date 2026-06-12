import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { readData } from "@/lib/data-store";

function csvCell(value: unknown) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

export async function GET(request: NextRequest) {
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const data = await readData();
  const header = ["email", "name", "active", "consent", "createdAt"];
  const rows = data.subscribers.map((subscriber) =>
    [
      subscriber.email,
      subscriber.name ?? "",
      subscriber.active ? "true" : "false",
      subscriber.consent ? "true" : "false",
      subscriber.createdAt
    ]
      .map(csvCell)
      .join(",")
  );
  const csv = [header.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Disposition": "attachment; filename=newsletter-subscribers.csv",
      "Content-Type": "text/csv; charset=utf-8"
    }
  });
}
