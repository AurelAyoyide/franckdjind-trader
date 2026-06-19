import { NextResponse } from "next/server";
import { generateCertificatePdf } from "@/lib/certificates";
import { fullName, getPublicCertificate } from "@/lib/platform-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ code: string }> },
) {
  const { code } = await context.params;
  const certificate = await getPublicCertificate(code);

  if (!certificate || certificate.revokedAt) {
    return NextResponse.json({ error: "Certificat introuvable" }, { status: 404 });
  }

  const pdf = await generateCertificatePdf({
    code: certificate.code,
    learner: fullName(certificate.learner),
    course: certificate.course.title,
    issuedAt: certificate.issuedAt.toISOString(),
  });
  const body = pdf.buffer.slice(pdf.byteOffset, pdf.byteOffset + pdf.byteLength) as ArrayBuffer;
  const fileName = certificate.code.replaceAll(/[^A-Za-z0-9_-]/g, "_");

  return new Response(body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}.pdf"`,
    },
  });
}
