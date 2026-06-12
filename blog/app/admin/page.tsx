import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Inbox, LayoutDashboard, Mail, Settings, Tags, Users } from "lucide-react";
import { readData } from "@/lib/data-store";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Admin",
  description: "Tableau de bord admin du blog.",
  path: "/admin",
  noIndex: true
});

const modules = [
  { title: "Articles", description: "Creer, modifier, publier.", icon: FileText, href: "/admin/posts" },
  { title: "Categories", description: "Organiser les contenus SEO.", icon: Tags, href: "/admin/categories" },
  { title: "Messages", description: "Lire les demandes de contact.", icon: Inbox, href: "/admin/contact-messages" },
  { title: "Newsletter", description: "Voir les abonnes collectes.", icon: Mail, href: "/admin/subscribers" },
  { title: "Utilisateurs", description: "Gerer les acces admin.", icon: Users, href: "/admin/users" },
  { title: "Parametres", description: "Configurer le site et le SEO.", icon: Settings, href: "/admin/settings" }
];

export default async function AdminPage() {
  const data = await readData();
  const stats = [
    { label: "Articles publies", value: data.posts.filter((post) => post.status === "PUBLISHED").length },
    { label: "Brouillons", value: data.posts.filter((post) => post.status === "DRAFT").length },
    { label: "Messages non lus", value: data.contactMessages.filter((message) => message.status === "UNREAD").length },
    { label: "Abonnes newsletter", value: data.subscribers.length },
    { label: "Liens actifs", value: data.actionLinks.filter((link) => link.active).length }
  ];

  return (
    <section>
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.28em] text-market">
            <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
            Admin
          </p>
          <h1 className="mt-5 text-4xl font-black leading-tight md:text-6xl">
            Tableau de bord.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-muted">
            Administration protegee pour gerer les contenus, les pages, les messages, les avis, les liens et la newsletter.
          </p>
        </div>
        <Link
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-line bg-foreground/[0.06] px-4 text-sm font-semibold text-foreground"
          href="/"
        >
          Voir le site
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => (
          <div className="rounded-lg border border-line bg-surface p-5" key={stat.label}>
            <p className="font-mono text-3xl font-black text-market">{stat.value}</p>
            <p className="mt-2 text-xs font-black uppercase tracking-[0.18em] text-muted">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((module) => {
          const Icon = module.icon;

          return (
            <Link className="rounded-lg border border-line bg-surface p-5 transition hover:-translate-y-1 hover:border-line-strong" href={module.href} key={module.title}>
              <Icon className="h-5 w-5 text-market" aria-hidden="true" />
              <h2 className="mt-5 text-xl font-black">{module.title}</h2>
              <p className="mt-3 text-sm leading-7 text-muted">{module.description}</p>
            </Link>
          );
        })}
      </div>

      <div className="mt-10 rounded-lg border border-line bg-surface p-5">
        <h2 className="text-xl font-black">Derniere activite</h2>
        <div className="mt-5 grid gap-3">
          {data.activityLogs.slice(0, 6).length ? (
            data.activityLogs.slice(0, 6).map((log) => (
              <div className="rounded-md border border-line bg-background px-3 py-2 text-sm text-muted" key={log.id}>
                <span className="font-semibold text-foreground">{log.action}</span>
                {" "}sur {log.entity}
              </div>
            ))
          ) : (
            <p className="text-sm text-muted">Aucune activite enregistree pour le moment.</p>
          )}
        </div>
      </div>
    </section>
  );
}
