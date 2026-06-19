import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, UserRound } from "lucide-react";
import { getAdminSession } from "@/lib/auth";
import { createId, readData, writeData } from "@/lib/data-store";
import { canViewAdminResource } from "@/lib/permissions";
import { buildMetadata } from "@/lib/seo";
import { formatDate } from "@/lib/utils";

type ContactMessageDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const metadata: Metadata = buildMetadata({
  title: "Message contact",
  path: "/admin/contact-messages",
  noIndex: true
});

export default async function ContactMessageDetailPage({ params }: ContactMessageDetailPageProps) {
  const { id } = await params;
  const session = await getAdminSession();

  if (!session || !canViewAdminResource(session, "contact-messages")) {
    notFound();
  }

  const data = await readData();
  const message = data.contactMessages.find((entry) => entry.id === id);

  if (!message) {
    notFound();
  }

  if (message.status === "UNREAD") {
    message.status = "READ";
    data.activityLogs.unshift({
      id: createId("log"),
      action: "contact_message_read",
      entity: "contactMessage",
      entityId: message.id,
      createdAt: new Date().toISOString()
    });
    await writeData(data);
  }

  return (
    <section>
      <Link
        className="inline-flex min-h-10 items-center gap-2 rounded-md border border-line bg-foreground/[0.06] px-3 text-sm font-semibold text-foreground"
        href="/admin/contact-messages"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Retour aux messages
      </Link>

      <div className="mt-6 rounded-lg border border-line bg-surface p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-market">
              Message contact
            </p>
            <h1 className="mt-3 text-3xl font-black leading-tight md:text-5xl">
              {message.subject || "Sans sujet"}
            </h1>
            <p className="mt-3 text-sm font-semibold text-muted">
              Recu le {formatDate(message.createdAt)}
            </p>
          </div>
          <span className="inline-flex rounded-md border border-line bg-background px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-muted">
            {message.status}
          </span>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-line bg-background p-4">
            <UserRound className="h-5 w-5 text-market" aria-hidden="true" />
            <p className="mt-3 text-sm font-semibold text-muted">Nom</p>
            <p className="mt-1 font-black">{message.name}</p>
          </div>
          <div className="rounded-lg border border-line bg-background p-4">
            <Mail className="h-5 w-5 text-cyan" aria-hidden="true" />
            <p className="mt-3 text-sm font-semibold text-muted">Email</p>
            <a className="mt-1 block font-black text-market underline-offset-4 hover:underline" href={`mailto:${message.email}`}>
              {message.email}
            </a>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-line bg-background p-5">
          <p className="text-sm font-semibold text-muted">Message</p>
          <p className="mt-4 whitespace-pre-wrap text-base leading-8 text-foreground">
            {message.message}
          </p>
        </div>
      </div>
    </section>
  );
}
