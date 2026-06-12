import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ResourceForm } from "@/components/admin/resource-form";
import { getAdminResource, getResourceTitle } from "@/lib/admin-resources";
import { readData } from "@/lib/data-store";
import { buildMetadata } from "@/lib/seo";

type AdminEditResourcePageProps = {
  params: Promise<{
    resource: string;
    id: string;
  }>;
};

export async function generateMetadata({ params }: AdminEditResourcePageProps): Promise<Metadata> {
  const { resource, id } = await params;
  const config = getAdminResource(resource);

  return buildMetadata({
    title: config ? `Modifier ${config.singular}` : "Admin",
    noIndex: true,
    path: `/admin/${resource}/${id}/edit`
  });
}

export default async function AdminEditResourcePage({ params }: AdminEditResourcePageProps) {
  const { resource, id } = await params;
  const config = getAdminResource(resource);

  if (!config) {
    notFound();
  }

  const data = await readData();
  const items = data[config.collection] as Array<Record<string, unknown>>;
  const item = items.find((entry) => entry.id === id);

  if (!item) {
    notFound();
  }

  return (
    <section>
      <p className="text-xs font-black uppercase tracking-[0.28em] text-market">Edition</p>
      <h1 className="mt-3 text-4xl font-black leading-tight">{getResourceTitle(item, config)}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">{config.description}</p>
      <div className="mt-8">
        <ResourceForm config={config} item={item} />
      </div>
    </section>
  );
}
