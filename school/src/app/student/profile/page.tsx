import { UserRound } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { NoticeBanner } from "@/components/notice-banner";
import { requirePageSession } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { updateProfileAction } from "@/app/student/profile/actions";

export const dynamic = "force-dynamic";

const noticeMessages: Record<string, string> = {
  saved: "Profil mis a jour.",
  invalid: "Corrige les champs du profil avant d'enregistrer.",
};

export default async function StudentProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const { notice } = await searchParams;
  const session = await requirePageSession(["student"], "/student/profile");

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.userId },
  });

  return (
    <DashboardShell role="student" title="Profil" description="Coordonnees utiles au formateur et preferences de suivi.">
      <NoticeBanner message={notice ? noticeMessages[notice] : null} tone={notice === "invalid" ? "danger" : "success"} />
      <form action={updateProfileAction} className="max-w-3xl rounded-lg border border-line bg-surface p-6">
        <UserRound className="h-5 w-5 text-market" aria-hidden="true" />
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {[
            { label: "Prenom", name: "firstName", value: user.firstName, readOnly: false },
            { label: "Nom", name: "lastName", value: user.lastName, readOnly: false },
            { label: "Email", name: "email", value: user.email, readOnly: true },
            { label: "WhatsApp", name: "phone", value: user.phone, readOnly: false },
          ].map((field) => (
            <label className="text-sm font-black" key={field.label}>
              {field.label}
              <input
                className="mt-2 min-h-12 w-full rounded-lg border border-line bg-background px-4 text-sm font-semibold outline-none disabled:text-muted"
                defaultValue={field.value}
                disabled={field.readOnly}
                name={field.name}
              />
            </label>
          ))}
        </div>
        <button className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-market px-4 text-sm font-black text-on-market shadow-market" type="submit">
          Enregistrer
        </button>
      </form>
    </DashboardShell>
  );
}
