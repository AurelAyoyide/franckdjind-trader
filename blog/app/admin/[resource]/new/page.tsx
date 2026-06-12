import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ResourceForm } from "@/components/admin/resource-form";
import { getAdminResource } from "@/lib/admin-resources";
import { buildMetadata } from "@/lib/seo";

type AdminNewResourcePageProps = {
  params: Promise<{
    resource: string;
  }>;
};

export async function generateMetadata({ params }: AdminNewResourcePageProps): Promise<Metadata> {
  const { resource } = await params;
  const config = getAdminResource(resource);

  return buildMetadata({
    title: config ? `Nouvel element - ${config.label}` : "Admin",
    noIndex: true,
    path: `/admin/${resource}/new`
  });
}

export default async function AdminNewResourcePage({ params }: AdminNewResourcePageProps) {
  const { resource } = await params;
  const config = getAdminResource(resource);

  if (!config || config.allowCreate === false) {
    notFound();
  }

  return (
    <section>
      <p className="text-xs font-black uppercase tracking-[0.28em] text-market">Creation</p>
      <h1 className="mt-3 text-4xl font-black leading-tight">Nouveau {config.singular}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">{config.description}</p>
      <div className="mt-8">
        <ResourceForm config={config} />
      </div>
    </section>
  );
}
