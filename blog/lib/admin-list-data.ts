import type { Prisma } from "@prisma/client";
import type { AdminResourceConfig } from "@/lib/admin-resources";
import type { AdminSession } from "@/lib/auth-edge";
import { prisma } from "@/lib/prisma";

type AdminListItem = Record<string, unknown>;

type AdminListResult = {
  items: AdminListItem[];
  total: number;
  pageCount: number;
  safePage: number;
};

type AdminListParams = {
  config: AdminResourceConfig;
  q: string;
  page: number;
  pageSize: number;
  session: AdminSession;
};

const insensitive = "insensitive" as const;

function contains(value: string) {
  return { contains: value, mode: insensitive };
}

function pageWindow(page: number, pageSize: number, total: number) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), pageCount);

  return {
    pageCount,
    safePage,
    skip: (safePage - 1) * pageSize,
    take: pageSize
  };
}

function iso(value: Date | null | undefined) {
  return value?.toISOString() ?? "";
}

async function listResult(
  total: number,
  page: number,
  pageSize: number,
  loadItems: (skip: number, take: number) => Promise<AdminListItem[]>
): Promise<AdminListResult> {
  const { pageCount, safePage, skip, take } = pageWindow(page, pageSize, total);
  const items = total ? await loadItems(skip, take) : [];

  return { items, total, pageCount, safePage };
}

function postAuthorFilter(session: AdminSession): Prisma.PostWhereInput | undefined {
  if (session.role !== "AUTHOR") {
    return undefined;
  }

  const authorNames = [session.email, session.name].filter((value): value is string => Boolean(value?.trim()));

  return {
    OR: [
      ...authorNames.map((value) => ({ authorLabel: { equals: value, mode: insensitive } })),
      { author: { email: { equals: session.email, mode: insensitive } } },
      ...(session.name ? [{ author: { name: { equals: session.name, mode: insensitive } } }] : [])
    ]
  };
}

function textSearch<T>(query: string, filter: T): T | undefined {
  return query ? filter : undefined;
}

function andWhere<T>(filters: Array<T | undefined>) {
  return filters.filter(Boolean) as T[];
}

async function postsList(q: string, page: number, pageSize: number, session: AdminSession) {
  const where: Prisma.PostWhereInput = {
    AND: andWhere<Prisma.PostWhereInput>([
      postAuthorFilter(session),
      textSearch<Prisma.PostWhereInput>(q, {
        OR: [
          { id: contains(q) },
          { title: contains(q) },
          { slug: contains(q) },
          { excerpt: contains(q) },
          { content: contains(q) },
          { authorLabel: contains(q) },
          { category: { name: contains(q) } },
          { tags: { some: { tag: { name: contains(q) } } } }
        ]
      })
    ])
  };
  const total = await prisma.post.count({ where });

  return listResult(total, page, pageSize, async (skip, take) => {
    const posts = await prisma.post.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        authorLabel: true,
        publishedAt: true,
        author: { select: { email: true, name: true } },
        category: { select: { name: true } }
      },
      orderBy: [{ featured: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
      skip,
      take
    });

    return posts.map((post) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      status: post.status,
      author: post.authorLabel ?? post.author.name ?? post.author.email,
      category: post.category?.name ?? "",
      publishedAt: iso(post.publishedAt)
    }));
  });
}

async function categoriesList(q: string, page: number, pageSize: number) {
  const where: Prisma.CategoryWhereInput = {
    deletedAt: null,
    ...(q
      ? {
          OR: [
            { id: contains(q) },
            { name: contains(q) },
            { slug: contains(q) },
            { description: contains(q) }
          ]
        }
      : {})
  };
  const total = await prisma.category.count({ where });

  return listResult(total, page, pageSize, async (skip, take) => {
    const categories = await prisma.category.findMany({
      where,
      select: { id: true, name: true, slug: true, description: true },
      orderBy: { name: "asc" },
      skip,
      take
    });

    return categories.map((category) => ({
      id: category.id,
      title: category.name,
      slug: category.slug,
      description: category.description ?? ""
    }));
  });
}

async function tagsList(q: string, page: number, pageSize: number) {
  const where: Prisma.TagWhereInput = q
    ? { OR: [{ id: contains(q) }, { name: contains(q) }, { slug: contains(q) }, { description: contains(q) }] }
    : {};
  const total = await prisma.tag.count({ where });

  return listResult(total, page, pageSize, async (skip, take) => {
    const tags = await prisma.tag.findMany({
      where,
      select: { id: true, name: true, slug: true, description: true },
      orderBy: { name: "asc" },
      skip,
      take
    });

    return tags.map((tag) => ({
      id: tag.id,
      title: tag.name,
      slug: tag.slug,
      description: tag.description ?? ""
    }));
  });
}

async function pagesList(q: string, page: number, pageSize: number) {
  const where: Prisma.PageWhereInput = {
    deletedAt: null,
    ...(q
      ? {
          OR: [
            { id: contains(q) },
            { title: contains(q) },
            { slug: contains(q) },
            { excerpt: contains(q) },
            { content: contains(q) }
          ]
        }
      : {})
  };
  const total = await prisma.page.count({ where });

  return listResult(total, page, pageSize, async (skip, take) => {
    const pages = await prisma.page.findMany({
      where,
      select: { id: true, title: true, slug: true, status: true },
      orderBy: { title: "asc" },
      skip,
      take
    });

    return pages;
  });
}

async function mediaList(q: string, page: number, pageSize: number) {
  const where: Prisma.MediaWhereInput = q
    ? { OR: [{ id: contains(q) }, { title: contains(q) }, { url: contains(q) }, { alt: contains(q) }, { caption: contains(q) }] }
    : {};
  const total = await prisma.media.count({ where });

  return listResult(total, page, pageSize, async (skip, take) => {
    const media = await prisma.media.findMany({
      where,
      select: { id: true, title: true, url: true, alt: true, type: true },
      orderBy: { createdAt: "desc" },
      skip,
      take
    });

    return media.map((item) => ({
      id: item.id,
      title: item.title ?? item.alt ?? "Media",
      url: item.url,
      alt: item.alt ?? "",
      type: item.type
    }));
  });
}

async function testimonialsList(q: string, page: number, pageSize: number) {
  const where: Prisma.TestimonialWhereInput = q
    ? { OR: [{ id: contains(q) }, { name: contains(q) }, { role: contains(q) }, { quote: contains(q) }] }
    : {};
  const total = await prisma.testimonial.count({ where });

  return listResult(total, page, pageSize, async (skip, take) => {
    const testimonials = await prisma.testimonial.findMany({
      where,
      select: { id: true, name: true, role: true, quote: true, rating: true, published: true },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      skip,
      take
    });

    return testimonials.map((testimonial) => ({
      id: testimonial.id,
      name: testimonial.name,
      role: testimonial.role ?? "",
      quote: testimonial.quote,
      rating: testimonial.rating ?? 5,
      published: testimonial.published
    }));
  });
}

async function servicesList(q: string, page: number, pageSize: number) {
  const where: Prisma.ServiceWhereInput = q
    ? { OR: [{ id: contains(q) }, { title: contains(q) }, { slug: contains(q) }, { description: contains(q) }, { content: contains(q) }] }
    : {};
  const total = await prisma.service.count({ where });

  return listResult(total, page, pageSize, async (skip, take) => {
    const services = await prisma.service.findMany({
      where,
      select: { id: true, title: true, slug: true, description: true, published: true, priceLabel: true },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      skip,
      take
    });

    return services;
  });
}

async function linksList(q: string, page: number, pageSize: number) {
  const where: Prisma.ActionLinkWhereInput = q
    ? { OR: [{ id: contains(q) }, { label: contains(q) }, { slug: contains(q) }, { url: contains(q) }, { description: contains(q) }] }
    : {};
  const total = await prisma.actionLink.count({ where });

  return listResult(total, page, pageSize, async (skip, take) => {
    const links = await prisma.actionLink.findMany({
      where,
      select: { id: true, label: true, slug: true, url: true, type: true, active: true },
      orderBy: { createdAt: "asc" },
      skip,
      take
    });

    return links;
  });
}

async function contactMessagesList(q: string, page: number, pageSize: number) {
  const where: Prisma.ContactMessageWhereInput = q
    ? { OR: [{ id: contains(q) }, { name: contains(q) }, { email: contains(q) }, { subject: contains(q) }, { message: contains(q) }] }
    : {};
  const total = await prisma.contactMessage.count({ where });

  return listResult(total, page, pageSize, async (skip, take) => {
    const messages = await prisma.contactMessage.findMany({
      where,
      select: { id: true, name: true, email: true, subject: true, status: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      skip,
      take
    });

    return messages.map((message) => ({
      id: message.id,
      name: message.name,
      email: message.email,
      subject: message.subject ?? "",
      status: message.status,
      createdAt: iso(message.createdAt)
    }));
  });
}

async function redirectsList(q: string, page: number, pageSize: number) {
  const where: Prisma.RedirectWhereInput = q
    ? { OR: [{ id: contains(q) }, { source: contains(q) }, { destination: contains(q) }] }
    : {};
  const total = await prisma.redirect.count({ where });

  return listResult(total, page, pageSize, async (skip, take) => {
    const redirects = await prisma.redirect.findMany({
      where,
      select: { id: true, source: true, destination: true, permanent: true, active: true },
      orderBy: { createdAt: "desc" },
      skip,
      take
    });

    return redirects;
  });
}

async function settingsList(q: string, page: number, pageSize: number) {
  const where: Prisma.SettingWhereInput = {
    NOT: { key: "__system_data_version" },
    ...(q ? { key: contains(q) } : {})
  };
  const total = await prisma.setting.count({ where });

  return listResult(total, page, pageSize, async (skip, take) => {
    const settings = await prisma.setting.findMany({
      where,
      select: { id: true, key: true, value: true },
      orderBy: { key: "asc" },
      skip,
      take
    });

    return settings.map((setting) => ({
      id: setting.id,
      key: setting.key,
      value: typeof setting.value === "string" ? setting.value : JSON.stringify(setting.value)
    }));
  });
}

async function usersList(q: string, page: number, pageSize: number) {
  const where: Prisma.UserWhereInput = q
    ? { OR: [{ id: contains(q) }, { name: contains(q) }, { email: contains(q) }, { role: { label: contains(q) } }, { role: { name: contains(q) } }] }
    : {};
  const total = await prisma.user.count({ where });

  return listResult(total, page, pageSize, async (skip, take) => {
    const users = await prisma.user.findMany({
      where,
      select: { id: true, name: true, email: true, status: true, role: { select: { name: true, label: true } } },
      orderBy: { createdAt: "asc" },
      skip,
      take
    });

    return users.map((user) => ({
      id: user.id,
      name: user.name ?? "",
      email: user.email,
      status: user.status,
      role: user.role?.name ?? "AUTHOR",
      roleLabel: user.role?.label ?? "Auteur"
    }));
  });
}

async function subscribersList(q: string, page: number, pageSize: number) {
  const where: Prisma.SubscriberWhereInput = q
    ? { OR: [{ id: contains(q) }, { email: contains(q) }, { name: contains(q) }] }
    : {};
  const total = await prisma.subscriber.count({ where });

  return listResult(total, page, pageSize, async (skip, take) => {
    const subscribers = await prisma.subscriber.findMany({
      where,
      select: { id: true, email: true, name: true, active: true, consent: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      skip,
      take
    });

    return subscribers.map((subscriber) => ({
      id: subscriber.id,
      email: subscriber.email,
      name: subscriber.name ?? "",
      active: subscriber.active,
      consent: subscriber.consent,
      createdAt: iso(subscriber.createdAt)
    }));
  });
}

export async function getAdminResourceList({ config, q, page, pageSize, session }: AdminListParams) {
  const query = q.trim();

  switch (config.collection) {
    case "posts":
      return postsList(query, page, pageSize, session);
    case "categories":
      return categoriesList(query, page, pageSize);
    case "tags":
      return tagsList(query, page, pageSize);
    case "pages":
      return pagesList(query, page, pageSize);
    case "media":
      return mediaList(query, page, pageSize);
    case "testimonials":
      return testimonialsList(query, page, pageSize);
    case "services":
      return servicesList(query, page, pageSize);
    case "actionLinks":
      return linksList(query, page, pageSize);
    case "contactMessages":
      return contactMessagesList(query, page, pageSize);
    case "redirects":
      return redirectsList(query, page, pageSize);
    case "settings":
      return settingsList(query, page, pageSize);
    case "users":
      return usersList(query, page, pageSize);
    case "subscribers":
      return subscribersList(query, page, pageSize);
    default:
      return { items: [], total: 0, pageCount: 1, safePage: 1 };
  }
}
