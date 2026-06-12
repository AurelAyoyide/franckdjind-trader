import { promises as fs } from "node:fs";
import path from "node:path";
import {
  articles,
  categories,
  services,
  siteConfig,
  tags,
  testimonials,
  type Article,
  type Category,
  type Tag
} from "@/lib/content";
import { estimateReadTime } from "@/lib/utils";

export type StoredStatus = "DRAFT" | "REVIEW" | "PUBLISHED" | "ARCHIVED";

export type StoredArticle = Article & {
  id: string;
  status: StoredStatus;
  content: string;
  seoTitle?: string;
  seoDescription?: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
};

export type StoredCategory = Category & {
  id: string;
  seoTitle?: string;
  seoDescription?: string;
};

export type StoredTag = Tag & {
  id: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
};

export type StoredPage = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: StoredStatus;
  seoTitle?: string;
  seoDescription?: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
};

export type StoredService = {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  priceLabel: string;
  ctaLabel: string;
  ctaUrl: string;
  order: number;
  published: boolean;
};

export type StoredTestimonial = {
  id: string;
  name: string;
  role: string;
  quote: string;
  rating: number;
  published: boolean;
  order: number;
  createdAt?: string;
};

export type StoredActionLink = {
  id: string;
  label: string;
  slug: string;
  url: string;
  type: "CONTACT" | "FORMATION" | "AFFILIATE" | "SOCIAL" | "OTHER";
  description?: string;
  ctaLabel?: string;
  brandColor?: string;
  placement?: "ARTICLE_TOP" | "ARTICLE_BOTTOM" | "ARTICLE_BOTH";
  noFollow: boolean;
  sponsored: boolean;
  active: boolean;
};

export type StoredMedia = {
  id: string;
  title: string;
  url: string;
  alt: string;
  type: "IMAGE" | "VIDEO" | "DOCUMENT" | "OTHER";
  createdAt: string;
};

export type StoredContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "UNREAD" | "READ" | "REPLIED" | "ARCHIVED";
  ipHash?: string;
  userAgent?: string;
  createdAt: string;
};

export type StoredRedirect = {
  id: string;
  source: string;
  destination: string;
  permanent: boolean;
  active: boolean;
};

export type StoredSetting = {
  id: string;
  key: string;
  value: string;
  group: "site" | "seo" | "contact" | "analytics" | "security";
};

export type StoredUser = {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  role: "ADMIN" | "EDITOR" | "AUTHOR";
  status: "ACTIVE" | "DISABLED";
};

export type StoredActivityLog = {
  id: string;
  action: string;
  entity: string;
  entityId?: string;
  createdAt: string;
};

export type StoredLinkClick = {
  id: string;
  actionLinkId: string;
  ipHash?: string;
  userAgent?: string;
  referrer?: string;
  createdAt: string;
};

export type StoredSubscriber = {
  id: string;
  email: string;
  name?: string;
  active: boolean;
  consent: boolean;
  createdAt: string;
};

export type BlogData = {
  posts: StoredArticle[];
  categories: StoredCategory[];
  tags: StoredTag[];
  pages: StoredPage[];
  services: StoredService[];
  testimonials: StoredTestimonial[];
  actionLinks: StoredActionLink[];
  media: StoredMedia[];
  contactMessages: StoredContactMessage[];
  redirects: StoredRedirect[];
  settings: StoredSetting[];
  users: StoredUser[];
  activityLogs: StoredActivityLog[];
  linkClicks: StoredLinkClick[];
  subscribers: StoredSubscriber[];
};

const dataDir = path.join(process.cwd(), "data");
const dataFile = path.join(dataDir, "content.json");

function now() {
  return new Date().toISOString();
}

export function createId(prefix = "item") {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function articleContent(article: Article) {
  return article.sections
    .map((section) => `## ${section.heading}\n\n${section.body}`)
    .join("\n\n");
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function defaultData(): BlogData {
  return {
    posts: articles.map((article) => ({
      ...article,
      id: `post_${article.slug}`,
      status: "PUBLISHED",
      content: articleContent(article),
      robotsIndex: true,
      robotsFollow: true
    })),
    categories: categories.map((category) => ({
      ...category,
      id: `category_${category.slug}`
    })),
    tags: tags.map((tag) => ({
      ...tag,
      id: `tag_${tag.slug}`,
      description: `Articles lies au sujet ${tag.title}.`
    })),
    pages: [
      {
        id: "page_a-propos",
        title: "A propos",
        slug: "a-propos",
        excerpt: "Approche, methode et positionnement du trader-formateur.",
        content: "Une approche fondee sur la discipline, le risque et la transmission.",
        status: "PUBLISHED",
        robotsIndex: true,
        robotsFollow: true
      },
      {
        id: "page_contact",
        title: "Contact",
        slug: "contact",
        excerpt: "Formulaire et canaux directs.",
        content: "Page de contact pour les prospects, apprenants et partenaires.",
        status: "PUBLISHED",
        robotsIndex: true,
        robotsFollow: true
      }
    ],
    services: services.map((service, index) => ({
      id: `service_${index + 1}`,
      title: service.title,
      slug: slugify(service.title),
      description: service.description,
      content: service.description,
      priceLabel: "Sur demande",
      ctaLabel: "Demander une orientation",
      ctaUrl: "/contact",
      order: index + 1,
      published: true
    })),
    testimonials: testimonials.map((testimonial, index) => ({
      id: `testimonial_${index + 1}`,
      ...testimonial,
      rating: 5,
      published: false,
      order: index + 1,
      createdAt: now()
    })),
    actionLinks: [
      {
        id: "link_telegram",
        label: "Telegram",
        slug: "telegram",
        url: siteConfig.telegramUrl,
        type: "SOCIAL",
        noFollow: true,
        sponsored: false,
        active: true
      },
      {
        id: "link_whatsapp",
        label: "WhatsApp",
        slug: "whatsapp",
        url: siteConfig.whatsappUrl,
        type: "CONTACT",
        noFollow: true,
        sponsored: false,
        active: true
      }
    ],
    media: [
      {
        id: "media_hero",
        title: "Hero trading desk",
        url: siteConfig.heroImage,
        alt: "Bureau de trading moderne avec ordinateur et carnet de notes",
        type: "IMAGE",
        createdAt: now()
      }
    ],
    contactMessages: [],
    redirects: [],
    settings: [
      { id: "setting_site_name", key: "siteName", value: siteConfig.name, group: "site" },
      { id: "setting_contact_email", key: "contactEmail", value: siteConfig.email, group: "contact" },
      { id: "setting_default_seo_title", key: "defaultSeoTitle", value: siteConfig.title, group: "seo" },
      { id: "setting_default_seo_description", key: "defaultSeoDescription", value: siteConfig.description, group: "seo" }
    ],
    users: [
      {
        id: "user_admin",
        name: "Administrateur",
        email: process.env.ADMIN_EMAIL ?? "admin@example.com",
        role: "ADMIN",
        status: "ACTIVE"
      }
    ],
    activityLogs: [],
    linkClicks: [],
    subscribers: []
  };
}

async function ensureDataFile() {
  await fs.mkdir(dataDir, { recursive: true });

  try {
    await fs.access(dataFile);
  } catch {
    await fs.writeFile(dataFile, JSON.stringify(defaultData(), null, 2), "utf8");
  }
}

export async function readData(): Promise<BlogData> {
  await ensureDataFile();
  const raw = await fs.readFile(dataFile, "utf8");
  const data = JSON.parse(raw) as Partial<BlogData>;
  const defaults = defaultData();

  return {
    posts: data.posts ?? defaults.posts,
    categories: data.categories ?? defaults.categories,
    tags: data.tags ?? defaults.tags,
    pages: data.pages ?? defaults.pages,
    services: data.services ?? defaults.services,
    testimonials: data.testimonials ?? defaults.testimonials,
    actionLinks: data.actionLinks ?? defaults.actionLinks,
    media: data.media ?? defaults.media,
    contactMessages: data.contactMessages ?? defaults.contactMessages,
    redirects: data.redirects ?? defaults.redirects,
    settings: data.settings ?? defaults.settings,
    users: data.users ?? defaults.users,
    activityLogs: data.activityLogs ?? defaults.activityLogs,
    linkClicks: data.linkClicks ?? defaults.linkClicks,
    subscribers: data.subscribers ?? defaults.subscribers
  };
}

export async function writeData(data: BlogData) {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(dataFile, JSON.stringify(data, null, 2), "utf8");
}

export async function addActivity(action: string, entity: string, entityId?: string) {
  const data = await readData();

  data.activityLogs.unshift({
    id: createId("log"),
    action,
    entity,
    entityId,
    createdAt: now()
  });

  data.activityLogs = data.activityLogs.slice(0, 200);
  await writeData(data);
}

export async function getPublicData() {
  const data = await readData();

  return {
    ...data,
    posts: data.posts
      .filter((post) => post.status === "PUBLISHED")
      .map((post) => ({
        ...post,
        readTime: estimateReadTime(post.content)
      })),
    services: data.services.filter((service) => service.published).sort((a, b) => a.order - b.order),
    testimonials: data.testimonials.filter((testimonial) => testimonial.published).sort((a, b) => a.order - b.order),
    actionLinks: data.actionLinks.filter((link) => link.active)
  };
}

export async function getActionLink(slug: string) {
  const data = await readData();
  return data.actionLinks.find((link) => link.slug === slug && link.active);
}

export async function recordLinkClick(
  actionLinkId: string,
  details: Omit<StoredLinkClick, "id" | "actionLinkId" | "createdAt"> = {}
) {
  const data = await readData();

  data.linkClicks.unshift({
    id: createId("click"),
    actionLinkId,
    ...details,
    createdAt: now()
  });

  data.linkClicks = data.linkClicks.slice(0, 500);
  await writeData(data);
}
