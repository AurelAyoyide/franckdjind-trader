import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { unstable_noStore as noStore } from "next/cache";
import { cache } from "react";
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
import { prisma } from "@/lib/prisma";
import { isSafeActionUrl, isSafeMediaUrl } from "@/lib/security";
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
  titleEn?: string;
  excerptEn?: string;
  contentEn?: string;
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
  imageUrl?: string;
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
  role: "ADMIN" | "EDITOR" | "CONTENT_MANAGER" | "MEDIA_MANAGER" | "AUTHOR";
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

const defaultImage = "/hero-trading-desk.png";
const roleLabels = {
  ADMIN: "Administrateur",
  EDITOR: "Editeur",
  CONTENT_MANAGER: "Responsable de contenu",
  MEDIA_MANAGER: "Responsable médias",
  AUTHOR: "Auteur"
} as const;

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

function iso(value: Date | null | undefined) {
  return value?.toISOString() ?? now();
}

function dateOrNull(value: string | undefined) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toStringValue(value: unknown) {
  return typeof value === "string" ? value : JSON.stringify(value);
}

function toJsonValue(value: string) {
  try {
    return JSON.parse(value) as object;
  } catch {
    return value;
  }
}

function mediaIdFromUrl(url: string) {
  return `media_${createHash("sha256").update(url).digest("hex").slice(0, 24)}`;
}

function markdownToSections(content: string) {
  const chunks = content
    .split(/\n(?=## )/g)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  if (!chunks.length) {
    return [{ heading: "Contenu", body: content }];
  }

  return chunks.map((chunk, index) => {
    const [firstLine, ...rest] = chunk.split("\n");
    const heading = firstLine.replace(/^##\s*/, "").trim() || `Section ${index + 1}`;
    const body = rest.join("\n").trim() || chunk;
    return { heading, body };
  });
}

function assertDatabaseConfigured() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be configured. The application no longer uses local JSON storage.");
  }
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
        email: process.env.CONTACT_TO_EMAIL ?? "admin@invalid.local",
        role: "ADMIN",
        status: "ACTIVE"
      }
    ],
    activityLogs: [],
    linkClicks: [],
    subscribers: []
  };
}

export async function readData(): Promise<BlogData> {
  noStore();
  assertDatabaseConfigured();

  const [posts, dbCategories, dbTags, pages, dbServices, dbTestimonials, actionLinks, media, contactMessages, redirects, settings, users, activityLogs, linkClicks, subscribers] =
    await Promise.all([
      prisma.post.findMany({
        include: { category: true, tags: { include: { tag: true } }, coverMedia: true, seoMetadata: true, author: { include: { role: true } } },
        orderBy: [{ featured: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }]
      }),
      prisma.category.findMany({ include: { seoMetadata: true }, where: { deletedAt: null }, orderBy: { name: "asc" } }),
      prisma.tag.findMany({ include: { seoMetadata: true }, orderBy: { name: "asc" } }),
      prisma.page.findMany({ include: { seoMetadata: true }, where: { deletedAt: null }, orderBy: { title: "asc" } }),
      prisma.service.findMany({ orderBy: [{ order: "asc" }, { createdAt: "asc" }] }),
      prisma.testimonial.findMany({ orderBy: [{ order: "asc" }, { createdAt: "asc" }] }),
      prisma.actionLink.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.media.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.redirect.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.setting.findMany({ where: { NOT: { key: "__system_data_version" } }, orderBy: { key: "asc" } }),
      prisma.user.findMany({ include: { role: true }, orderBy: { createdAt: "asc" } }),
      prisma.activityLog.findMany({ orderBy: { createdAt: "desc" }, take: 500 }),
      prisma.linkClick.findMany({ orderBy: { createdAt: "desc" }, take: 500 }),
      prisma.subscriber.findMany({ orderBy: { createdAt: "desc" } })
    ]);
  const actionLinkImages = await prisma.$queryRaw<Array<{ id: string; imageUrl: string | null }>>`
    SELECT "id", "imageUrl" FROM "ActionLink"
  `;
  const actionLinkImageById = new Map(actionLinkImages.map((link) => [link.id, link.imageUrl]));

  return {
    posts: posts.map((post) => {
      const localizedPost = post as typeof post & {
        titleEn?: string | null;
        excerptEn?: string | null;
        contentEn?: string | null;
      };

      return {
      id: post.id,
      title: post.title,
      titleEn: localizedPost.titleEn ?? undefined,
      slug: post.slug,
      excerpt: post.excerpt ?? "",
      excerptEn: localizedPost.excerptEn ?? undefined,
      content: post.content,
      contentEn: localizedPost.contentEn ?? undefined,
      status: post.status,
      author: post.authorLabel ?? post.author.name ?? post.author.email,
      publishedAt: post.publishedAt?.toISOString().slice(0, 10) ?? "",
      updatedAt: post.updatedAt.toISOString().slice(0, 10),
      image: post.coverMedia?.url ?? defaultImage,
      category: post.category
        ? { id: post.category.id, title: post.category.name, slug: post.category.slug, description: post.category.description ?? "" }
        : { id: "uncategorized", title: "Non classe", slug: "non-classe", description: "" },
      tags: post.tags.map(({ tag }) => ({ id: tag.id, title: tag.name, slug: tag.slug })),
      sections: markdownToSections(post.content),
      featured: post.featured,
      readTime: estimateReadTime(post.content),
      seoTitle: post.seoMetadata?.title ?? post.title,
      seoDescription: post.seoMetadata?.description ?? post.excerpt ?? "",
      robotsIndex: post.seoMetadata?.robotsIndex ?? true,
      robotsFollow: post.seoMetadata?.robotsFollow ?? true
    };
    }),
    categories: dbCategories.map((category) => ({
      id: category.id,
      title: category.name,
      slug: category.slug,
      description: category.description ?? "",
      seoTitle: category.seoMetadata?.title ?? undefined,
      seoDescription: category.seoMetadata?.description ?? undefined
    })),
    tags: dbTags.map((tag) => ({
      id: tag.id,
      title: tag.name,
      slug: tag.slug,
      description: tag.description ?? undefined,
      seoTitle: tag.seoMetadata?.title ?? undefined,
      seoDescription: tag.seoMetadata?.description ?? undefined
    })),
    pages: pages.map((page) => ({
      id: page.id,
      title: page.title,
      slug: page.slug,
      excerpt: page.excerpt ?? "",
      content: page.content,
      status: page.status,
      seoTitle: page.seoMetadata?.title ?? undefined,
      seoDescription: page.seoMetadata?.description ?? undefined,
      robotsIndex: page.seoMetadata?.robotsIndex ?? true,
      robotsFollow: page.seoMetadata?.robotsFollow ?? true
    })),
    services: dbServices.map((service) => ({
      id: service.id,
      title: service.title,
      slug: service.slug,
      description: service.description,
      content: service.content ?? "",
      priceLabel: service.priceLabel ?? "",
      ctaLabel: service.ctaLabel ?? "",
      ctaUrl: service.ctaUrl ?? "",
      order: service.order,
      published: service.published
    })),
    testimonials: dbTestimonials.map((testimonial) => ({
      id: testimonial.id,
      name: testimonial.name,
      role: testimonial.role ?? "",
      quote: testimonial.quote,
      rating: Math.min(5, Math.max(1, (testimonial.rating ?? 50) / 10)),
      published: testimonial.published,
      order: testimonial.order,
      createdAt: iso(testimonial.createdAt)
    })),
    actionLinks: actionLinks.map((link) => ({
      id: link.id,
      label: link.label,
      slug: link.slug,
      url: link.url,
      type: link.type,
      description: link.description ?? undefined,
      ctaLabel: link.ctaLabel ?? undefined,
      imageUrl: actionLinkImageById.get(link.id) ?? undefined,
      brandColor: link.brandColor ?? undefined,
      placement: link.placement,
      noFollow: link.noFollow,
      sponsored: link.sponsored,
      active: link.active
    })),
    media: media.map((item) => ({
      id: item.id,
      title: item.title ?? item.alt ?? "Media",
      url: item.url,
      alt: item.alt ?? "",
      type: item.type,
      createdAt: iso(item.createdAt)
    })),
    contactMessages: contactMessages.map((message) => ({
      id: message.id,
      name: message.name,
      email: message.email,
      subject: message.subject ?? "",
      message: message.message,
      status: message.status,
      ipHash: message.ipHash ?? undefined,
      userAgent: message.userAgent ?? undefined,
      createdAt: iso(message.createdAt)
    })),
    redirects: redirects.map((item) => ({ id: item.id, source: item.source, destination: item.destination, permanent: item.permanent, active: item.active })),
    settings: settings.map((setting) => ({
      id: setting.id,
      key: setting.key,
      value: toStringValue(setting.value),
      group: (setting.key.startsWith("defaultSeo") ? "seo" : setting.key.startsWith("contact") ? "contact" : "site") as StoredSetting["group"]
    })),
    users: users.map((user) => ({
      id: user.id,
      name: user.name ?? "",
      email: user.email,
      passwordHash: user.passwordHash,
      role: (user.role?.name ?? "AUTHOR") as StoredUser["role"],
      status: user.status
    })),
    activityLogs: activityLogs.map((log) => ({ id: log.id, action: log.action, entity: log.entity ?? "", entityId: log.entityId ?? undefined, createdAt: iso(log.createdAt) })),
    linkClicks: linkClicks.map((click) => ({
      id: click.id,
      actionLinkId: click.actionLinkId,
      ipHash: click.ipHash ?? undefined,
      userAgent: click.userAgent ?? undefined,
      referrer: click.referrer ?? undefined,
      createdAt: iso(click.createdAt)
    })),
    subscribers: subscribers.map((subscriber) => ({
      id: subscriber.id,
      email: subscriber.email,
      name: subscriber.name ?? undefined,
      active: subscriber.active,
      consent: subscriber.consent,
      createdAt: iso(subscriber.createdAt)
    }))
  };
}

async function passwordForUser(input: StoredUser, existingHash?: string) {
  if (input.passwordHash) {
    return { hash: input.passwordHash, disabled: false };
  }

  if (existingHash) {
    return { hash: existingHash, disabled: false };
  }

  return { hash: await bcrypt.hash(randomBytes(32).toString("hex"), 12), disabled: true };
}

function seoData(input: { seoTitle?: string; seoDescription?: string; title: string; excerpt?: string; robotsIndex?: boolean; robotsFollow?: boolean }) {
  return {
    title: input.seoTitle || input.title,
    description: input.seoDescription || input.excerpt || input.title,
    robotsIndex: input.robotsIndex !== false,
    robotsFollow: input.robotsFollow !== false
  };
}

function safePostMedia(data: BlogData) {
  const media = new Map<string, StoredMedia>();

  for (const item of data.media) {
    if (isSafeMediaUrl(item.url)) {
      media.set(item.url, item);
    }
  }

  for (const post of data.posts) {
    if (isSafeMediaUrl(post.image) && !media.has(post.image)) {
      media.set(post.image, {
        id: mediaIdFromUrl(post.image),
        title: `Image ${post.title}`,
        url: post.image,
        alt: post.title,
        type: "IMAGE",
        createdAt: now()
      });
    }
  }

  return [...media.values()];
}

export async function writeData(data: BlogData, options: { prune?: boolean; preserveInteractionData?: boolean } = {}) {
  assertDatabaseConfigured();

  await prisma.$transaction(async (tx) => {
    if (!data.users.length) {
      throw new Error("At least one administrator must remain in the database.");
    }

    const roles = new Map<string, string>();
    for (const roleName of Object.keys(roleLabels) as Array<keyof typeof roleLabels>) {
      const role = await tx.role.upsert({
        where: { name: roleName },
        update: { label: roleLabels[roleName] },
        create: { name: roleName, label: roleLabels[roleName] }
      });
      roles.set(roleName, role.id);
    }

    const storedUsers = new Map<string, { id: string; name: string | null; email: string; passwordHash: string; status: "ACTIVE" | "DISABLED" }>();
    for (const input of data.users) {
      const email = input.email.trim().toLowerCase();
      if (!email) {
        continue;
      }

      const existingById = await tx.user.findUnique({ where: { id: input.id } });
      const existingByEmail = await tx.user.findUnique({ where: { email } });

      if (
        existingById &&
        existingByEmail &&
        existingById.id !== existingByEmail.id &&
        options.prune !== false &&
        !options.preserveInteractionData
      ) {
        throw new Error("An account already uses this email address.");
      }

      const existing = existingByEmail ?? existingById;
      const password = await passwordForUser(input, existing?.passwordHash);
      const roleName = roles.has(input.role) ? input.role : "AUTHOR";
      const user = existing
        ? await tx.user.update({
            where: { id: existing.id },
            data: {
              name: input.name || null,
              email,
              passwordHash: password.hash,
              status: password.disabled ? "DISABLED" : input.status,
              roleId: roles.get(roleName)
            }
          })
        : await tx.user.create({
            data: {
              id: input.id,
              name: input.name || null,
              email,
              passwordHash: password.hash,
              status: password.disabled ? "DISABLED" : input.status,
              roleId: roles.get(roleName)
            }
          });
      storedUsers.set(input.id, user);
    }

    const fallbackAuthor =
      [...storedUsers.values()].find((user) => user.status === "ACTIVE") ?? [...storedUsers.values()][0];
    if (!fallbackAuthor) {
      throw new Error("No valid user is available to own the content.");
    }

    const categoryIds = new Set<string>();
    const categoryBySlug = new Map<string, string>();
    for (const input of data.categories) {
      const existingById = await tx.category.findUnique({ where: { id: input.id }, select: { id: true } });
      const existingBySlug = await tx.category.findUnique({ where: { slug: input.slug }, select: { id: true } });
      const existingCategory = existingById ?? existingBySlug;
      const seo = seoData({ title: input.title, excerpt: input.description, seoTitle: input.seoTitle, seoDescription: input.seoDescription });
      const baseData = {
        name: input.title,
        slug: input.slug,
        description: input.description || null
      };
      const category = existingCategory
        ? await tx.category.update({
            where: { id: existingCategory.id },
            data: { ...baseData, seoMetadata: { upsert: { update: seo, create: seo } } }
          })
        : await tx.category.create({
            data: { id: input.id, ...baseData, seoMetadata: { create: seo } }
          });
      categoryIds.add(category.id);
      categoryBySlug.set(input.slug, category.id);
    }

    const tagIds = new Set<string>();
    const tagBySlug = new Map<string, string>();
    for (const input of data.tags) {
      const existingById = await tx.tag.findUnique({ where: { id: input.id }, select: { id: true } });
      const existingBySlug = await tx.tag.findUnique({ where: { slug: input.slug }, select: { id: true } });
      const existingTag = existingById ?? existingBySlug;
      const seo = seoData({ title: input.title, excerpt: input.description, seoTitle: input.seoTitle, seoDescription: input.seoDescription });
      const baseData = { name: input.title, slug: input.slug, description: input.description || null };
      const tag = existingTag
        ? await tx.tag.update({ where: { id: existingTag.id }, data: { ...baseData, seoMetadata: { upsert: { update: seo, create: seo } } } })
        : await tx.tag.create({ data: { id: input.id, ...baseData, seoMetadata: { create: seo } } });
      tagIds.add(tag.id);
      tagBySlug.set(input.slug, tag.id);
    }

    const mediaItems = safePostMedia(data);
    const mediaIds = new Set<string>();
    const mediaByUrl = new Map<string, string>();
    for (const input of mediaItems) {
      mediaIds.add(input.id);
      const item = await tx.media.upsert({
        where: { id: input.id },
        update: { title: input.title || null, type: input.type, url: input.url, alt: input.alt || null },
        create: { id: input.id, title: input.title || null, type: input.type, url: input.url, alt: input.alt || null }
      });
      mediaByUrl.set(input.url, item.id);
    }

    const postIds = new Set<string>();
    for (const input of data.posts) {
      const existingById = await tx.post.findUnique({ where: { id: input.id }, select: { id: true } });
      const existingBySlug = await tx.post.findUnique({ where: { slug: input.slug }, select: { id: true } });
      const existingPost = existingById ?? existingBySlug;
      postIds.add(existingPost?.id ?? input.id);
      const matchingAuthor = [...storedUsers.values()].find(
        (user) => user.name?.trim().toLowerCase() === input.author?.trim().toLowerCase() || user.email === input.author?.trim().toLowerCase()
      );
      const categoryId = categoryBySlug.get(input.category?.slug ?? "") ?? null;
      const tagIdsForPost = (input.tags ?? [])
        .map((tag) => tagBySlug.get(tag.slug))
        .filter((tagId): tagId is string => Boolean(tagId));
      const seo = seoData(input);
      const baseData = {
        title: input.title,
        slug: input.slug,
        excerpt: input.excerpt || null,
        content: input.content,
        status: input.status,
        featured: Boolean(input.featured),
        publishedAt: dateOrNull(input.publishedAt),
        authorLabel: input.author || null
      };
      const authorId = matchingAuthor?.id ?? fallbackAuthor.id;
      const coverMediaId = mediaByUrl.get(input.image);
      if (existingPost) {
        await tx.post.update({
          where: { id: existingPost.id },
          data: {
            ...baseData,
            author: { connect: { id: authorId } },
            category: categoryId ? { connect: { id: categoryId } } : { disconnect: true },
            coverMedia: coverMediaId ? { connect: { id: coverMediaId } } : { disconnect: true },
            tags: { deleteMany: {}, create: tagIdsForPost.map((tagId) => ({ tagId })) },
            seoMetadata: { upsert: { update: seo, create: seo } }
          }
        });
      } else {
        await tx.post.create({
          data: {
            id: input.id,
            ...baseData,
            author: { connect: { id: authorId } },
            ...(categoryId ? { category: { connect: { id: categoryId } } } : {}),
            ...(coverMediaId ? { coverMedia: { connect: { id: coverMediaId } } } : {}),
            tags: { create: tagIdsForPost.map((tagId) => ({ tagId })) },
            seoMetadata: { create: seo }
          }
        });
      }
    }

    const pageIds = new Set<string>();
    for (const input of data.pages) {
      pageIds.add(input.id);
      const seo = seoData(input);
      const baseData = { title: input.title, slug: input.slug, excerpt: input.excerpt || null, content: input.content, status: input.status };
      await tx.page.upsert({
        where: { id: input.id },
        update: { ...baseData, seoMetadata: { upsert: { update: seo, create: seo } } },
        create: { id: input.id, ...baseData, seoMetadata: { create: seo } }
      });
    }

    const serviceIds = new Set<string>();
    for (const input of data.services) {
      const existingById = await tx.service.findUnique({ where: { id: input.id }, select: { id: true } });
      const existingBySlug = await tx.service.findUnique({ where: { slug: input.slug }, select: { id: true } });
      const existingService = existingById ?? existingBySlug;
      serviceIds.add(existingService?.id ?? input.id);
      const baseData = {
        title: input.title,
        slug: input.slug,
        description: input.description,
        content: input.content || null,
        priceLabel: input.priceLabel || null,
        ctaLabel: input.ctaLabel || null,
        ctaUrl: isSafeActionUrl(input.ctaUrl) ? input.ctaUrl : "/contact",
        order: input.order,
        published: input.published
      };
      if (existingService) {
        await tx.service.update({ where: { id: existingService.id }, data: baseData });
      } else {
        await tx.service.create({ data: { id: input.id, ...baseData } });
      }
    }

    const testimonialIds = new Set<string>();
    for (const input of data.testimonials) {
      testimonialIds.add(input.id);
      const baseData = {
        name: input.name,
        role: input.role || null,
        quote: input.quote,
        rating: Math.round(Math.min(5, Math.max(1, input.rating)) * 10),
        published: input.published,
        order: input.order
      };
      await tx.testimonial.upsert({ where: { id: input.id }, update: baseData, create: { id: input.id, ...baseData, createdAt: dateOrNull(input.createdAt) ?? undefined } });
    }

    const actionLinkIds = new Set<string>();
    for (const input of data.actionLinks) {
      actionLinkIds.add(input.id);
      if (!isSafeActionUrl(input.url)) {
        continue;
      }
      const baseData = {
        label: input.label,
        slug: input.slug,
        url: input.url,
        type: input.type,
        description: input.description || null,
        ctaLabel: input.ctaLabel || null,
        brandColor: input.brandColor || null,
        placement: input.placement ?? "ARTICLE_BOTH",
        noFollow: input.noFollow,
        sponsored: input.sponsored,
        active: input.active
      };
      await tx.actionLink.upsert({ where: { id: input.id }, update: baseData, create: { id: input.id, ...baseData } });
      await tx.$executeRaw`
        UPDATE "ActionLink"
        SET "imageUrl" = ${isSafeMediaUrl(input.imageUrl ?? "") ? input.imageUrl ?? null : null}
        WHERE "id" = ${input.id}
      `;
    }

    const messageIds = new Set<string>();
    for (const input of data.contactMessages) {
      messageIds.add(input.id);
      const baseData = {
        name: input.name,
        email: input.email.toLowerCase(),
        subject: input.subject || null,
        message: input.message,
        status: input.status,
        ipHash: input.ipHash || null,
        userAgent: input.userAgent || null
      };
      await tx.contactMessage.upsert({ where: { id: input.id }, update: baseData, create: { id: input.id, ...baseData, createdAt: dateOrNull(input.createdAt) ?? undefined } });
    }

    const redirectIds = new Set<string>();
    for (const input of data.redirects) {
      redirectIds.add(input.id);
      const baseData = { source: input.source, destination: input.destination, permanent: input.permanent, active: input.active };
      await tx.redirect.upsert({ where: { id: input.id }, update: baseData, create: { id: input.id, ...baseData } });
    }

    const settingKeys = new Set<string>();
    for (const input of data.settings) {
      settingKeys.add(input.key);
      await tx.setting.upsert({
        where: { key: input.key },
        update: { value: toJsonValue(input.value) },
        create: { id: input.id, key: input.key, value: toJsonValue(input.value) }
      });
    }

    const activityLogIds = new Set<string>();
    for (const input of data.activityLogs.slice(0, 500)) {
      activityLogIds.add(input.id);
      const baseData = { action: input.action, entity: input.entity || null, entityId: input.entityId || null };
      await tx.activityLog.upsert({ where: { id: input.id }, update: baseData, create: { id: input.id, ...baseData, createdAt: dateOrNull(input.createdAt) ?? undefined } });
    }

    const linkClickIds = new Set<string>();
    for (const input of data.linkClicks.slice(0, 500)) {
      linkClickIds.add(input.id);
      const baseData = { actionLinkId: input.actionLinkId, ipHash: input.ipHash || null, userAgent: input.userAgent || null, referrer: input.referrer || null };
      await tx.linkClick.upsert({ where: { id: input.id }, update: baseData, create: { id: input.id, ...baseData, createdAt: dateOrNull(input.createdAt) ?? undefined } });
    }

    const subscriberEmails = new Set<string>();
    for (const input of data.subscribers) {
      const email = input.email.trim().toLowerCase();
      if (!email) {
        continue;
      }
      subscriberEmails.add(email);
      const baseData = { name: input.name || null, active: input.active, consent: input.consent };
      await tx.subscriber.upsert({ where: { email }, update: baseData, create: { id: input.id, email, ...baseData, createdAt: dateOrNull(input.createdAt) ?? undefined } });
    }

    if (options.prune !== false) {
      await tx.post.updateMany({ where: { categoryId: { notIn: [...categoryIds] } }, data: { categoryId: null } });
      await tx.post.updateMany({ where: { coverMediaId: { notIn: [...mediaIds] } }, data: { coverMediaId: null } });
      await tx.post.deleteMany({ where: { id: { notIn: [...postIds] } } });
      await tx.page.deleteMany({ where: { id: { notIn: [...pageIds] } } });
      await tx.service.deleteMany({ where: { id: { notIn: [...serviceIds] } } });
      await tx.testimonial.deleteMany({ where: { id: { notIn: [...testimonialIds] } } });
      await tx.actionLink.deleteMany({ where: { id: { notIn: [...actionLinkIds] } } });
      await tx.redirect.deleteMany({ where: { id: { notIn: [...redirectIds] } } });
      await tx.setting.deleteMany({ where: { key: { notIn: [...settingKeys, "__system_data_version"] } } });
      await tx.tag.deleteMany({ where: { id: { notIn: [...tagIds] } } });
      await tx.category.deleteMany({ where: { id: { notIn: [...categoryIds] } } });
      await tx.media.deleteMany({ where: { id: { notIn: [...mediaIds] } } });

      if (!options.preserveInteractionData) {
        await tx.contactMessage.deleteMany({ where: { id: { notIn: [...messageIds] } } });
        await tx.activityLog.deleteMany({ where: { id: { notIn: [...activityLogIds] } } });
        await tx.linkClick.deleteMany({ where: { id: { notIn: [...linkClickIds] } } });
        await tx.subscriber.deleteMany({ where: { email: { notIn: [...subscriberEmails] } } });
      }
    }
  }, { timeout: 20_000 });
}

export async function addActivity(action: string, entity: string, entityId?: string) {
  assertDatabaseConfigured();
  await prisma.activityLog.create({ data: { action, entity, entityId } });
}

async function loadPublicData() {
  noStore();
  assertDatabaseConfigured();

  const [posts, categories, tags, services, testimonials, actionLinks] = await Promise.all([
    prisma.post.findMany({
      where: {
        status: "PUBLISHED",
        OR: [{ publishedAt: null }, { publishedAt: { lte: new Date() } }]
      },
      include: {
        category: true,
        tags: { include: { tag: true } },
        coverMedia: true,
        seoMetadata: true,
        author: { include: { role: true } }
      },
      orderBy: [{ featured: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }]
    }),
    prisma.category.findMany({ include: { seoMetadata: true }, where: { deletedAt: null }, orderBy: { name: "asc" } }),
    prisma.tag.findMany({ include: { seoMetadata: true }, orderBy: { name: "asc" } }),
    prisma.service.findMany({ where: { published: true }, orderBy: [{ order: "asc" }, { createdAt: "asc" }] }),
    prisma.testimonial.findMany({ where: { published: true }, orderBy: [{ order: "asc" }, { createdAt: "asc" }] }),
    prisma.actionLink.findMany({ where: { active: true }, orderBy: { createdAt: "asc" } })
  ]);
  const publicActionLinkImages = await prisma.$queryRaw<Array<{ id: string; imageUrl: string | null }>>`
    SELECT "id", "imageUrl" FROM "ActionLink" WHERE "active" = true
  `;
  const publicActionLinkImageById = new Map(publicActionLinkImages.map((link) => [link.id, link.imageUrl]));

  return {
    posts: posts.map((post) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt ?? "",
      content: post.content,
      status: post.status,
      author: post.authorLabel ?? post.author.name ?? post.author.email,
      publishedAt: post.publishedAt?.toISOString().slice(0, 10) ?? "",
      updatedAt: post.updatedAt.toISOString().slice(0, 10),
      image: isSafeMediaUrl(post.coverMedia?.url ?? defaultImage) ? post.coverMedia?.url ?? defaultImage : defaultImage,
      category: post.category
        ? { id: post.category.id, title: post.category.name, slug: post.category.slug, description: post.category.description ?? "" }
        : { id: "uncategorized", title: "Non classe", slug: "non-classe", description: "" },
      tags: post.tags.map(({ tag }) => ({ id: tag.id, title: tag.name, slug: tag.slug })),
      sections: markdownToSections(post.content),
      featured: post.featured,
      readTime: estimateReadTime(post.content),
      seoTitle: post.seoMetadata?.title ?? post.title,
      seoDescription: post.seoMetadata?.description ?? post.excerpt ?? "",
      robotsIndex: post.seoMetadata?.robotsIndex ?? true,
      robotsFollow: post.seoMetadata?.robotsFollow ?? true
    })),
    categories: categories.map((category) => ({
      id: category.id,
      title: category.name,
      slug: category.slug,
      description: category.description ?? "",
      seoTitle: category.seoMetadata?.title ?? undefined,
      seoDescription: category.seoMetadata?.description ?? undefined
    })),
    tags: tags.map((tag) => ({
      id: tag.id,
      title: tag.name,
      slug: tag.slug,
      description: tag.description ?? undefined,
      seoTitle: tag.seoMetadata?.title ?? undefined,
      seoDescription: tag.seoMetadata?.description ?? undefined
    })),
    services: services.map((service) => ({
      id: service.id,
      title: service.title,
      slug: service.slug,
      description: service.description,
      content: service.content ?? "",
      priceLabel: service.priceLabel ?? "",
      ctaLabel: service.ctaLabel ?? "",
      ctaUrl: isSafeActionUrl(service.ctaUrl ?? "") ? service.ctaUrl ?? "/contact" : "/contact",
      order: service.order,
      published: true
    })),
    testimonials: testimonials.map((testimonial) => ({
      id: testimonial.id,
      name: testimonial.name,
      role: testimonial.role ?? "",
      quote: testimonial.quote,
      rating: testimonial.rating ?? 5,
      published: true,
      order: testimonial.order,
      createdAt: iso(testimonial.createdAt)
    })),
    actionLinks: actionLinks
      .filter((link) => isSafeActionUrl(link.url))
      .map((link) => ({
        id: link.id,
        label: link.label,
        slug: link.slug,
        url: link.url,
        type: link.type,
        description: link.description ?? undefined,
        ctaLabel: link.ctaLabel ?? undefined,
        imageUrl: publicActionLinkImageById.get(link.id) ?? undefined,
        brandColor: link.brandColor ?? undefined,
        placement: link.placement,
        noFollow: link.noFollow,
        sponsored: link.sponsored,
        active: true
      }))
  };
}

// One page render often calls this from both its page and the shared footer.
// React.cache deduplicates that work without serving stale editorial content.
export const getPublicData = cache(loadPublicData);

export async function getActionLink(slug: string) {
  assertDatabaseConfigured();
  const link = await prisma.actionLink.findFirst({ where: { slug, active: true } });

  if (!link || !isSafeActionUrl(link.url)) {
    return undefined;
  }

  return {
    id: link.id,
    label: link.label,
    slug: link.slug,
    url: link.url,
    type: link.type,
    description: link.description ?? undefined,
    ctaLabel: link.ctaLabel ?? undefined,
    brandColor: link.brandColor ?? undefined,
    placement: link.placement,
    noFollow: link.noFollow,
    sponsored: link.sponsored,
    active: link.active
  } satisfies StoredActionLink;
}

export async function recordLinkClick(
  actionLinkId: string,
  details: Omit<StoredLinkClick, "id" | "actionLinkId" | "createdAt"> = {}
) {
  assertDatabaseConfigured();
  await prisma.linkClick.create({
    data: {
      actionLinkId,
      ipHash: details.ipHash,
      userAgent: details.userAgent,
      referrer: details.referrer
    }
  });
}
