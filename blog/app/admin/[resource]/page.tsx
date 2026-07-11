import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Download, Eye, Pencil, Plus, Search } from "lucide-react";
import { DeleteConfirmation } from "@/components/admin/delete-confirmation";
import { Pagination } from "@/components/pagination";
import { getAdminResourceList } from "@/lib/admin-list-data";
import { getAdminResource, getResourceTitle } from "@/lib/admin-resources";
import { getAdminSession } from "@/lib/auth";
import { canManageResource, canViewAdminResource } from "@/lib/permissions";
import { buildMetadata } from "@/lib/seo";

type AdminResourcePageProps = {
  params: Promise<{
    resource: string;
  }>;
  searchParams: Promise<{
    q?: string;
    page?: string;
    notice?: string;
  }>;
};

const pageSize = 10;

function pageHref(resource: string, page: number, q: string) {
  const params = new URLSearchParams();

  if (q) {
    params.set("q", q);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const query = params.toString();
  return query ? `/admin/${resource}?${query}` : `/admin/${resource}`;
}

export async function generateMetadata({ params }: AdminResourcePageProps): Promise<Metadata> {
  const { resource } = await params;
  const config = getAdminResource(resource);

  return buildMetadata({
    title: config ? `Admin ${config.label}` : "Admin",
    noIndex: true,
    path: `/admin/${resource}`
  });
}

export default async function AdminResourcePage({ params, searchParams }: AdminResourcePageProps) {
  const { resource } = await params;
  const { q = "", page = "1", notice } = await searchParams;
  const config = getAdminResource(resource);

  if (!config) {
    notFound();
  }

  const session = await getAdminSession();

  if (!session || !canViewAdminResource(session, resource)) {
    redirect("/admin");
  }

  const currentPage = Math.max(1, Number(page) || 1);
  const { items, total, pageCount, safePage } = await getAdminResourceList({
    config,
    q,
    page: currentPage,
    pageSize,
    session
  });

  return (
    <section>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-market">Admin</p>
          <h1 className="mt-3 text-4xl font-black leading-tight">{config.label}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">{config.description}</p>
        </div>
        {config.allowCreate === false || !canManageResource(session, resource, "save") ? null : (
          <Link className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-market px-4 text-sm font-black text-on-market" href={`/admin/${config.slug}/new`}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nouveau
          </Link>
        )}
        {config.slug === "subscribers" ? (
          <Link className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-line bg-foreground/[0.06] px-4 text-sm font-semibold text-foreground" href="/admin/subscribers/export">
            <Download className="h-4 w-4" aria-hidden="true" />
            Export CSV
          </Link>
        ) : null}
      </div>

      {notice === "created" || notice === "updated" || notice === "deleted" ? (
        <p className="mt-6 rounded-md border border-market/30 bg-market/10 px-4 py-3 text-sm font-semibold text-market" role="status">
          {notice === "created" ? "Element cree avec succes." : notice === "deleted" ? "Element supprime avec succes." : "Modifications enregistrees avec succes."}
        </p>
      ) : null}

      <form className="mt-8 rounded-lg border border-line bg-surface p-3" action={`/admin/${config.slug}`}>
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              className="min-h-12 w-full rounded-md border border-line bg-background py-2 pl-11 pr-4 text-foreground outline-none transition placeholder:text-muted-strong focus:border-market"
              defaultValue={q}
              name="q"
              placeholder={`Rechercher dans ${config.label.toLowerCase()}...`}
              type="search"
            />
          </label>
          <button className="min-h-12 rounded-md bg-market px-5 text-sm font-black text-on-market transition hover:bg-market-strong" type="submit">
            Rechercher
          </button>
        </div>
      </form>

      <div className="mt-4 flex flex-col gap-2 text-sm text-muted md:flex-row md:items-center md:justify-between">
        <p className="font-semibold">
          {total} element{total > 1 ? "s" : ""}
        </p>
        {q ? (
          <Link className="font-semibold text-market underline-offset-4 hover:underline" href={`/admin/${config.slug}`}>
            Reinitialiser
          </Link>
        ) : null}
      </div>

      <div className="mt-5 overflow-hidden rounded-lg border border-line bg-surface">
        <div className="grid gap-px bg-line">
          {items.length ? (
            items.map((item) => (
              <div className="grid gap-4 bg-surface p-4 md:grid-cols-[1fr_auto] md:items-center" key={String(item.id)}>
                <div>
                  <h2 className="text-lg font-black">{getResourceTitle(item, config)}</h2>
                  <p className="mt-2 text-xs font-semibold text-muted-strong">
                    ID: {String(item.id)}
                  </p>
                  {"status" in item ? (
                    <p className="mt-1 text-xs font-semibold text-muted">Statut: {String(item.status)}</p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-line bg-foreground/[0.06] px-3 text-sm font-semibold"
                    href={
                      config.slug === "contact-messages"
                        ? `/admin/contact-messages/${String(item.id)}`
                        : `/admin/${config.slug}/${String(item.id)}/edit`
                    }
                  >
                    {config.slug === "contact-messages" ? (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                    )}
                    {config.slug === "contact-messages" ? "Ouvrir" : "Modifier"}
                  </Link>
                  {config.allowDelete === false || !canManageResource(session, resource, "delete") ? null : (
                    <DeleteConfirmation
                      id={String(item.id)}
                      resource={config.slug}
                      title={getResourceTitle(item, config)}
                    />
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-surface p-6 text-sm text-muted">Aucun element trouve.</div>
          )}
        </div>
      </div>

      <Pagination
        ariaLabel={`Pagination ${config.label}`}
        className="mt-8"
        currentPage={safePage}
        hrefForPage={(pageNumber) => pageHref(config.slug, pageNumber, q)}
        pageCount={pageCount}
      />
    </section>
  );
}
