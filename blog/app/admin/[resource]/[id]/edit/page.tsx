import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ResourceForm } from "@/components/admin/resource-form";
import { getAdminResource, getResourceTitle } from "@/lib/admin-resources";
import { getAdminSession } from "@/lib/auth";
import { readData } from "@/lib/data-store";
import { canManagePostAuthor, canManageResource, canViewAdminResource } from "@/lib/permissions";
import { buildMetadata } from "@/lib/seo";

type AdminEditResourcePageProps = {
  params: Promise<{
    resource: string;
    id: string;
  }>;
  searchParams: Promise<{ error?: string }>;
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

export default async function AdminEditResourcePage({ params, searchParams }: AdminEditResourcePageProps) {
  const { resource, id } = await params;
  const { error } = await searchParams;
  const config = getAdminResource(resource);

  if (!config) {
    notFound();
  }

  const session = await getAdminSession();

  if (!session || !canViewAdminResource(session, resource)) {
    redirect("/admin");
  }

  const data = await readData();
  const items = data[config.collection] as Array<Record<string, unknown>>;
  const item = items.find((entry) => entry.id === id);

  if (!item) {
    notFound();
  }

  if (config.slug === "posts" && !canManagePostAuthor(session, item.author)) {
    redirect("/admin/posts");
  }

  return (
    <section>
      <p className="text-xs font-black uppercase tracking-[0.28em] text-market">Edition</p>
      <h1 className="mt-3 text-4xl font-black leading-tight">{getResourceTitle(item, config)}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">{config.description}</p>
      {error ? <ResourceError error={error} /> : null}
      <div className="mt-8">
        {canManageResource(session, resource, "save") ? (
          <ResourceForm config={config} item={item} choices={formChoices(data)} />
        ) : (
          <div className="rounded-lg border border-line bg-surface p-5 text-sm font-semibold text-muted">
            Lecture seule pour ce role.
          </div>
        )}
      </div>
    </section>
  );
}

function ResourceError({ error }: { error: string }) {
  const messages: Record<string, string> = {
    "email-exists": "Cet email appartient deja a un utilisateur.",
    password: "Le mot de passe doit contenir au moins 10 caracteres, une lettre et un chiffre.",
    "password-required": "Un mot de passe temporaire est requis pour creer un utilisateur.",
    required: "Complete les champs obligatoires avant d'enregistrer.",
    "slug-exists": "Un autre élément utilise déjà cette adresse. Change le titre pour générer un slug unique.",
    "media-source": "Choisis soit une image locale, soit une URL, mais pas les deux.",
    "media-url": "L'URL de l'image doit commencer par https:// ou être un chemin interne valide.",
    "media-required": "Ajoute une image locale ou une URL d'image avant d'enregistrer.",
    "image-upload": "Choisis une image JPG, PNG, WebP ou AVIF de 5 Mo maximum avant d'enregistrer.",
    "image-source": "L'image sélectionnée n'existe plus dans la médiathèque. Choisis-en une autre.",
    price: "Indique un montant supérieur à zéro ou choisis « Sur demande » / « Gratuit ».",
    "invalid-url": "Utilise une adresse HTTPS valide ou un chemin interne commençant par /.",
    "invalid-redirect": "La redirection doit partir d'une adresse interne et viser une adresse interne ou HTTPS valide.",
    "invalid-relation": "Choisis une catégorie existante et uniquement des tags de la liste.",
    "upload-limit": "Limite de 20 imports d'images par heure atteinte. Réessaie plus tard."
  };

  return <p className="mt-6 rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-sm font-semibold text-danger" role="alert">{messages[error] ?? "Le formulaire contient une erreur. Verifie les champs puis recommence."}</p>;
}

function formChoices(data: Awaited<ReturnType<typeof readData>>) {
  return {
    categories: data.categories.map((category) => ({ slug: category.slug, title: category.title })),
    tags: data.tags.map((tag) => ({ slug: tag.slug, title: tag.title })),
    media: data.media.filter((media) => media.type === "IMAGE").map((media) => ({ url: media.url, title: media.title || media.alt || media.url })),
    internalPaths: [
      { value: "/contact", label: "Page Contact" },
      { value: "/formations", label: "Page Formations" },
      { value: "/temoignages", label: "Page Témoignages" },
      { value: "/blog", label: "Page Blog" },
      { value: "/go/telegram", label: "Telegram" },
      { value: "/go/whatsapp", label: "WhatsApp" },
      ...data.pages.filter((page) => page.status === "PUBLISHED").map((page) => ({ value: `/${page.slug}`, label: page.title }))
    ]
  };
}
