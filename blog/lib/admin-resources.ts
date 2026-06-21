import type { BlogData } from "@/lib/data-store";

export type AdminField = {
  name: string;
  label: string;
  type: "text" | "textarea" | "select" | "checkbox" | "number" | "date" | "email" | "url" | "password" | "file";
  required?: boolean;
  options?: Array<{ label: string; value: string }>;
  help?: string;
};

export type AdminResourceConfig = {
  slug: string;
  label: string;
  singular: string;
  collection: keyof BlogData;
  allowCreate?: boolean;
  allowDelete?: boolean;
  description: string;
  fields: AdminField[];
  titleField: string;
};

const statusOptions = [
  { label: "Brouillon", value: "DRAFT" },
  { label: "Relecture", value: "REVIEW" },
  { label: "Publie", value: "PUBLISHED" },
  { label: "Archive", value: "ARCHIVED" }
];

export const adminResources = {
  posts: {
    slug: "posts",
    label: "Articles",
    singular: "article",
    collection: "posts",
    description: "Creation, modification, publication et SEO des articles.",
    titleField: "title",
    fields: [
      { name: "title", label: "Titre", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true },
      { name: "categorySlug", label: "Categorie", type: "text", required: true, help: "Slug de categorie, par exemple debuter ou risk-management." },
      { name: "excerpt", label: "Extrait", type: "textarea", required: true },
      { name: "content", label: "Contenu visuel", type: "textarea", required: true },
      { name: "status", label: "Statut", type: "select", options: statusOptions, required: true },
      { name: "author", label: "Auteur", type: "text" },
      { name: "publishedAt", label: "Date de publication", type: "date" },
      { name: "image", label: "Image", type: "text", help: "Chemin media ou URL, par exemple /hero-trading-desk.png." },
      { name: "tagSlugs", label: "Tags", type: "text", help: "Slugs separes par des virgules." },
      { name: "seoTitle", label: "SEO title", type: "text", help: "Optionnel : si vide, genere automatiquement depuis le titre." },
      { name: "seoDescription", label: "SEO description", type: "textarea", help: "Optionnel : si vide, genere automatiquement depuis l'extrait." },
      { name: "robotsIndex", label: "Autoriser l'indexation Google", type: "checkbox", help: "Decoche pour demander aux moteurs de ne pas indexer cette page." },
      { name: "robotsFollow", label: "Autoriser le suivi des liens", type: "checkbox", help: "Decoche pour demander aux moteurs de ne pas suivre les liens de cette page." }
    ]
  },
  categories: {
    slug: "categories",
    label: "Categories",
    singular: "categorie",
    collection: "categories",
    description: "Organisation editoriale et SEO des categories.",
    titleField: "title",
    fields: [
      { name: "title", label: "Nom", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea", required: true },
      { name: "seoTitle", label: "SEO title", type: "text" },
      { name: "seoDescription", label: "SEO description", type: "textarea" }
    ]
  },
  tags: {
    slug: "tags",
    label: "Tags",
    singular: "tag",
    collection: "tags",
    description: "Mots-cles transversaux relies aux articles.",
    titleField: "title",
    fields: [
      { name: "title", label: "Nom", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea" },
      { name: "seoTitle", label: "SEO title", type: "text" },
      { name: "seoDescription", label: "SEO description", type: "textarea" }
    ]
  },
  pages: {
    slug: "pages",
    label: "Pages",
    singular: "page",
    collection: "pages",
    description: "Pages statiques et contenus vitrine.",
    titleField: "title",
    fields: [
      { name: "title", label: "Titre", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true },
      { name: "excerpt", label: "Extrait", type: "textarea" },
      { name: "content", label: "Contenu", type: "textarea", required: true },
      { name: "status", label: "Statut", type: "select", options: statusOptions, required: true },
      { name: "seoTitle", label: "SEO title", type: "text" },
      { name: "seoDescription", label: "SEO description", type: "textarea" },
      { name: "robotsIndex", label: "Autoriser l'indexation Google", type: "checkbox" },
      { name: "robotsFollow", label: "Autoriser le suivi des liens", type: "checkbox" }
    ]
  },
  media: {
    slug: "media",
    label: "Medias",
    singular: "media",
    collection: "media",
    description: "References medias utilisees par le site.",
    titleField: "title",
    fields: [
      { name: "title", label: "Titre", type: "text", required: true },
      { name: "url", label: "URL externe ou chemin interne", type: "text", help: "Exemple externe https://... ou interne /uploads/image.png." },
      { name: "file", label: "Importer un fichier local", type: "file", help: "Optionnel : jpg, png, webp, gif, mp4 ou pdf jusqu'a 15 Mo." },
      { name: "alt", label: "Texte alternatif", type: "text" },
      {
        name: "type",
        label: "Type",
        type: "select",
        options: ["IMAGE", "VIDEO", "DOCUMENT", "OTHER"].map((value) => ({ label: value, value }))
      }
    ]
  },
  testimonials: {
    slug: "testimonials",
    label: "Temoignages",
    singular: "temoignage",
    collection: "testimonials",
    description: "Preuves sociales publiees sur le site.",
    titleField: "name",
    fields: [
      { name: "name", label: "Nom", type: "text", required: true },
      { name: "role", label: "Role", type: "text" },
      { name: "quote", label: "Temoignage", type: "textarea", required: true },
      { name: "rating", label: "Note", type: "number", help: "Publie automatiquement. L'ordre est gere automatiquement." }
    ]
  },
  services: {
    slug: "services",
    label: "Services",
    singular: "service",
    collection: "services",
    description: "Offres, formations et accompagnements.",
    titleField: "title",
    fields: [
      { name: "title", label: "Titre", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea", required: true },
      { name: "content", label: "Contenu", type: "textarea" },
      { name: "priceLabel", label: "Prix", type: "text" },
      { name: "ctaLabel", label: "CTA", type: "text" },
      { name: "ctaUrl", label: "Lien CTA", type: "text" },
      { name: "published", label: "Publie", type: "checkbox" },
      { name: "order", label: "Ordre", type: "number" }
    ]
  },
  links: {
    slug: "links",
    label: "Liens CTA",
    singular: "lien",
    collection: "actionLinks",
    description: "Liens de conversion, affiliation, contact et reseaux.",
    titleField: "label",
    fields: [
      { name: "label", label: "Label", type: "text", required: true },
      { name: "slug", label: "Slug de tracking", type: "text", required: true },
      { name: "url", label: "URL destination", type: "url", required: true },
      { name: "description", label: "Accroche", type: "textarea", help: "Texte court affiche sur les cartes partenaires." },
      { name: "ctaLabel", label: "Libelle CTA", type: "text", help: "Exemple : Ouvrir un compte." },
      { name: "brandColor", label: "Couleur marque", type: "text", help: "Hexadecimal, par exemple #ff6b00." },
      {
        name: "placement",
        label: "Position",
        type: "select",
        options: [
          { label: "Article haut et bas", value: "ARTICLE_BOTH" },
          { label: "Article haut", value: "ARTICLE_TOP" },
          { label: "Article bas", value: "ARTICLE_BOTTOM" }
        ]
      },
      {
        name: "type",
        label: "Type",
        type: "select",
        options: ["CONTACT", "FORMATION", "AFFILIATE", "SOCIAL", "OTHER"].map((value) => ({ label: value, value }))
      },
      { name: "noFollow", label: "nofollow", type: "checkbox" },
      { name: "sponsored", label: "sponsored", type: "checkbox" },
      { name: "active", label: "Actif", type: "checkbox" }
    ]
  },
  "contact-messages": {
    slug: "contact-messages",
    label: "Messages contact",
    singular: "message",
    collection: "contactMessages",
    allowCreate: false,
    description: "Demandes envoyees via le formulaire contact.",
    titleField: "email",
    fields: [
      { name: "name", label: "Nom", type: "text" },
      { name: "email", label: "Email", type: "email" },
      { name: "subject", label: "Sujet", type: "text" },
      { name: "message", label: "Message", type: "textarea" },
      {
        name: "status",
        label: "Statut",
        type: "select",
        options: ["UNREAD", "READ", "REPLIED", "ARCHIVED"].map((value) => ({ label: value, value }))
      }
    ]
  },
  redirects: {
    slug: "redirects",
    label: "Redirections",
    singular: "redirection",
    collection: "redirects",
    description: "Redirige une ancienne URL vers une nouvelle pour eviter les erreurs 404 et garder le SEO.",
    titleField: "source",
    fields: [
      { name: "source", label: "Source", type: "text", required: true },
      { name: "destination", label: "Destination", type: "text", required: true },
      { name: "permanent", label: "Permanente", type: "checkbox" },
      { name: "active", label: "Active", type: "checkbox" }
    ]
  },
  settings: {
    slug: "settings",
    label: "Parametres",
    singular: "parametre",
    collection: "settings",
    description: "Parametres site, SEO, contact et securite.",
    titleField: "key",
    fields: [
      { name: "key", label: "Cle", type: "text", required: true },
      { name: "value", label: "Valeur", type: "textarea", required: true },
      {
        name: "group",
        label: "Groupe",
        type: "select",
        options: ["site", "seo", "contact", "analytics", "security"].map((value) => ({ label: value, value }))
      }
    ]
  },
  users: {
    slug: "users",
    label: "Utilisateurs",
    singular: "utilisateur",
    collection: "users",
    allowDelete: false,
    description: "Utilisateurs admin et roles simples.",
    titleField: "email",
    fields: [
      { name: "name", label: "Nom", type: "text", required: true },
      { name: "email", label: "Email", type: "email", required: true },
      { name: "password", label: "Mot de passe temporaire", type: "password", help: "A renseigner a la creation ou pour changer le mot de passe." },
      {
        name: "role",
        label: "Role",
        type: "select",
        options: ["ADMIN", "EDITOR", "AUTHOR"].map((value) => ({ label: value, value }))
      },
      {
        name: "status",
        label: "Statut",
        type: "select",
        options: ["ACTIVE", "DISABLED"].map((value) => ({ label: value, value }))
      }
    ]
  },
  subscribers: {
    slug: "subscribers",
    label: "Newsletter",
    singular: "abonne",
    collection: "subscribers",
    allowCreate: false,
    description: "Emails collectes avec consentement pour une future newsletter.",
    titleField: "email",
    fields: [
      { name: "name", label: "Nom", type: "text" },
      { name: "email", label: "Email", type: "email" },
      { name: "active", label: "Actif", type: "checkbox" },
      { name: "consent", label: "Consentement", type: "checkbox" }
    ]
  }
} satisfies Record<string, AdminResourceConfig>;

export type AdminResourceSlug = keyof typeof adminResources;

export function getAdminResource(slug: string) {
  return adminResources[slug as AdminResourceSlug] as AdminResourceConfig | undefined;
}

export function getResourceTitle(item: Record<string, unknown>, config: AdminResourceConfig) {
  const value = item[config.titleField];
  return typeof value === "string" && value ? value : "Sans titre";
}
