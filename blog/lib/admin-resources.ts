import type { BlogData } from "@/lib/data-store";

export type AdminField = {
  name: string;
  label: string;
  type: "text" | "textarea" | "select" | "checkbox" | "number" | "date" | "email" | "url" | "password" | "file" | "color";
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
      { name: "categorySlug", label: "Categorie", type: "text", required: true, help: "Choisis la categorie de l'article." },
      { name: "tagSlugs", label: "Tags", type: "text", help: "Selectionne un ou plusieurs tags." },
      { name: "content", label: "Contenu visuel", type: "textarea", required: true },
      { name: "status", label: "Statut", type: "select", options: statusOptions, required: true },
      { name: "publishedAt", label: "Programmer la publication", type: "date", help: "Laisse vide pour publier aujourd'hui. Une date future garde l'article invisible jusque-là." },
      { name: "image", label: "Image de couverture", type: "text", help: "Choisis une image déjà ajoutée dans la médiathèque." },
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
      { name: "description", label: "Description", type: "textarea", required: true },
      { name: "robotsIndex", label: "Autoriser l'indexation Google", type: "checkbox" }
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
      { name: "description", label: "Description", type: "textarea" }
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
      { name: "content", label: "Contenu", type: "textarea", required: true },
      { name: "status", label: "Statut", type: "select", options: statusOptions, required: true },
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
      { name: "url", label: "Source de l'image", type: "text", help: "Choisis une importation locale ou un lien HTTPS. Une seule source sera conservée." },
      { name: "alt", label: "Texte alternatif", type: "text" },
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
      { name: "role", label: "Profil", type: "select", options: ["Apprenant", "Membre de la communaute", "Client formation", "Client accompagnement"].map((value) => ({ label: value, value })) },
      { name: "quote", label: "Temoignage", type: "textarea", required: true },
      { name: "rating", label: "Note", type: "number", help: "Note affichée entre 1 et 5." },
      {
        name: "published",
        label: "Approuver et publier ce témoignage",
        type: "checkbox",
        help: "Un avis soumis publiquement reste invisible tant qu'il n'est pas approuvé."
      }
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
      { name: "description", label: "Description", type: "textarea", required: true },
      { name: "content", label: "Contenu", type: "textarea" },
      {
        name: "priceMode",
        label: "Mode de prix",
        type: "select",
        options: [
          { label: "Prix fixe", value: "FIXED" },
          { label: "Sur demande", value: "ON_REQUEST" },
          { label: "Gratuit", value: "FREE" }
        ]
      },
      { name: "priceAmount", label: "Montant", type: "number", help: "À renseigner seulement pour un prix fixe." },
      { name: "currency", label: "Devise", type: "select", options: ["XOF", "EUR", "USD"].map((value) => ({ label: value, value })) },
      { name: "ctaLabel", label: "CTA", type: "text" },
      { name: "ctaUrl", label: "Lien CTA", type: "text", help: "Choisis une page interne ou colle une URL HTTPS." },
      { name: "published", label: "Publie", type: "checkbox" },
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
      { name: "url", label: "URL destination", type: "url", required: true },
      { name: "description", label: "Accroche", type: "textarea", help: "Texte court affiche sur les cartes partenaires." },
      { name: "ctaLabel", label: "Libelle CTA", type: "text", help: "Exemple : Ouvrir un compte." },
      { name: "imageUrl", label: "Visuel publicitaire", type: "text", help: "Choisis une bannière de la médiathèque, importe-la ou colle son URL HTTPS." },
      { name: "brandColor", label: "Couleur marque", type: "color", help: "Choisis la couleur de la marque pour l'aperçu et les cartes." },
      {
        name: "placement",
        label: "Position",
        type: "select",
        options: [
          { label: "Avant le contenu (bannière large)", value: "ARTICLE_TOP" },
          { label: "Après le contenu", value: "ARTICLE_BOTTOM" },
          { label: "Avant et après le contenu", value: "ARTICLE_BOTH" }
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
    description: "Quand une ancienne adresse est visitée, le visiteur est envoyé automatiquement vers la nouvelle. Cela évite les erreurs 404 et conserve le référencement.",
    titleField: "source",
    fields: [
      { name: "source", label: "Ancienne adresse", type: "text", required: true, help: "Exemple : /ancien-article. Ne mets pas le nom de domaine." },
      { name: "destination", label: "Nouvelle adresse", type: "text", required: true, help: "Exemple : /blog/nouvel-article ou https://..." },
      { name: "permanent", label: "Redirection permanente (recommandé pour le SEO)", type: "checkbox" },
      { name: "active", label: "Activer cette redirection", type: "checkbox" }
    ]
  },
  settings: {
    slug: "settings",
    label: "Parametres",
    singular: "parametre",
    collection: "settings",
    description: "Réglages techniques historiques, consultables seulement. Les réglages actifs du site sont gérés par les variables de déploiement (domaine, email, sécurité) et les rubriques dédiées ; cette zone est verrouillée pour éviter des modifications sans effet.",
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
    description: "Comptes d’administration : Administrateur (tout), Éditeur (contenu et médias), Responsable de contenu, Responsable médias et Auteur (ses propres articles).",
    titleField: "email",
    fields: [
      { name: "name", label: "Nom", type: "text", required: true },
      { name: "email", label: "Email", type: "email", required: true },
      { name: "password", label: "Mot de passe temporaire", type: "password", help: "A renseigner a la creation ou pour changer le mot de passe." },
      {
        name: "role",
        label: "Role",
        type: "select",
        options: [
          { label: "Administrateur — accès complet", value: "ADMIN" },
          { label: "Éditeur — contenus et médias", value: "EDITOR" },
          { label: "Responsable de contenu — articles, pages et offres", value: "CONTENT_MANAGER" },
          { label: "Responsable médias — médiathèque et bannières", value: "MEDIA_MANAGER" },
          { label: "Auteur — ses propres articles uniquement", value: "AUTHOR" }
        ]
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
