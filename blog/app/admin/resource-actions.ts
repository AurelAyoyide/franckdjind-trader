"use server";

import { promises as fs } from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminResource } from "@/lib/admin-resources";
import { getAdminSession } from "@/lib/auth";
import { createId, readData, writeData, type BlogData, type StoredArticle } from "@/lib/data-store";
import { canManageResource } from "@/lib/permissions";
import { sanitizeRichHtml, markdownLikeToHtml } from "@/lib/sanitize";
import {
  isSafeActionUrl,
  isSafeHttpUrl,
  isSafeInternalPath,
  isSafeMediaUrl,
  isSameOriginRequest,
  normalizeHexColor,
  normalizeSlug
} from "@/lib/security";
import { estimateReadTime, stripHtml, truncateText } from "@/lib/utils";

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

function parseFieldValue(type: string, formData: FormData, name: string) {
  if (type === "checkbox") {
    return formData.get(name) === "on";
  }

  if (type === "number") {
    return Number(formData.get(name) || 0);
  }

  return String(formData.get(name) ?? "").trim();
}

function slugifyFileName(value: string) {
  const extension = path.extname(value).toLowerCase();
  const base = path
    .basename(value, extension)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);

  return `${base || "media"}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${extension}`;
}

async function saveUploadedMedia(file: File) {
  if (!file.size) {
    return "";
  }

  const maxUploadBytes = 15 * 1024 * 1024;
  const allowedTypes = new Map<string, string[]>([
    ["image/jpeg", [".jpg", ".jpeg"]],
    ["image/png", [".png"]],
    ["image/webp", [".webp"]],
    ["image/gif", [".gif"]],
    ["video/mp4", [".mp4"]],
    ["application/pdf", [".pdf"]]
  ]);
  const extension = path.extname(file.name).toLowerCase();
  const allowedExtensions = allowedTypes.get(file.type);

  if (file.size > maxUploadBytes || !allowedExtensions?.includes(extension)) {
    return "";
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadsDir, { recursive: true });
  const fileName = slugifyFileName(file.name);
  const bytes = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(uploadsDir, fileName), bytes);

  return `/uploads/${fileName}`;
}

function getCollection(data: BlogData, collection: keyof BlogData) {
  return data[collection] as Array<Record<string, unknown>>;
}

function normalizeFieldValue(name: string, type: string, value: string) {
  if (name === "slug" || name === "categorySlug") {
    return normalizeSlug(value);
  }

  if (name === "tagSlugs") {
    return value
      .split(",")
      .map((tag) => normalizeSlug(tag))
      .filter(Boolean)
      .join(", ");
  }

  if (name === "brandColor") {
    return normalizeHexColor(value);
  }

  if (type === "url" && value && !isSafeActionUrl(value)) {
    return "";
  }

  return value;
}

function hasRequiredValue(value: unknown) {
  return typeof value === "boolean" || (typeof value === "number" ? Number.isFinite(value) : String(value ?? "").trim().length > 0);
}

function normalizePost(item: Record<string, unknown>, data: BlogData) {
  const categorySlug = String(item.categorySlug ?? "").trim();
  const tagSlugs = String(item.tagSlugs ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  const tags = data.tags.filter((tag) => tagSlugs.includes(tag.slug));
  const fallbackCategory = data.categories[0];
  const category = data.categories.find((entry) => entry.slug === categorySlug) ?? fallbackCategory;
  const content = sanitizeRichHtml(markdownLikeToHtml(String(item.content ?? "")));

  delete item.categorySlug;
  delete item.tagSlugs;

  return {
    ...item,
    content,
    category,
    tags,
    sections: markdownToSections(content),
    image: typeof item.image === "string" && isSafeMediaUrl(item.image) ? item.image : "/hero-trading-desk.png",
    featured: Boolean(item.featured),
    readTime: estimateReadTime(content),
    seoTitle: typeof item.seoTitle === "string" && item.seoTitle ? item.seoTitle : String(item.title ?? ""),
    seoDescription:
      typeof item.seoDescription === "string" && item.seoDescription
        ? item.seoDescription
        : truncateText(String(item.excerpt || stripHtml(content))),
    robotsIndex: item.robotsIndex !== false,
    robotsFollow: item.robotsFollow !== false
  } as unknown as StoredArticle;
}

function normalizeGenericSeo(item: Record<string, unknown>) {
  if ("seoTitle" in item && (!item.seoTitle || item.seoTitle === "")) {
    item.seoTitle = String(item.title || item.name || "");
  }

  if ("seoDescription" in item && (!item.seoDescription || item.seoDescription === "")) {
    item.seoDescription = truncateText(String(item.excerpt || item.description || item.content || ""));
  }
}

function normalizeTestimonial(item: Record<string, unknown>, data: BlogData, existingIndex: number) {
  const currentOrder =
    typeof item.order === "number" && item.order > 0
      ? item.order
      : Math.max(0, ...data.testimonials.map((testimonial) => testimonial.order || 0)) + 1;

  return {
    ...item,
    rating: Math.min(5, Math.max(1, Number(item.rating || 5))),
    published: true,
    order: existingIndex >= 0 ? currentOrder : data.testimonials.length + 1,
    createdAt: typeof item.createdAt === "string" ? item.createdAt : new Date().toISOString()
  };
}

async function normalizeUser(item: Record<string, unknown>) {
  const password = String(item.password ?? "").trim();
  delete item.password;

  if (password) {
    item.passwordHash = await bcrypt.hash(password, 12);
  }

  return item;
}

export async function saveResourceAction(formData: FormData) {
  const requestHeaders = await headers();
  const resource = String(formData.get("resource") ?? "");
  const id = String(formData.get("id") ?? "");
  const config = getAdminResource(resource);
  const session = await getAdminSession();

  if (!isSameOriginRequest(requestHeaders)) {
    redirect("/admin");
  }

  if (!config) {
    redirect("/admin");
  }

  if (!session) {
    redirect("/admin/login");
  }

  if (!canManageResource(session, resource, "save")) {
    redirect(`/admin/${resource}`);
  }

  const data = await readData();
  const collection = getCollection(data, config.collection);
  const existingIndex = id ? collection.findIndex((item) => item.id === id) : -1;
  const current = existingIndex >= 0 ? collection[existingIndex] : {};
  const nextItem: Record<string, unknown> = {
    ...current,
    id: id || createId(resource)
  };

  for (const field of config.fields) {
    if (field.type === "file") {
      continue;
    }

    const parsedValue = parseFieldValue(field.type, formData, field.name);
    const value =
      typeof parsedValue === "string"
        ? normalizeFieldValue(field.name, field.type, parsedValue)
        : parsedValue;
    nextItem[field.name] =
      field.name === "content" && typeof value === "string"
        ? sanitizeRichHtml(markdownLikeToHtml(value))
        : value;
  }

  const missingRequiredField = config.fields.some(
    (field) => field.required && field.type !== "file" && !hasRequiredValue(nextItem[field.name])
  );

  if (missingRequiredField) {
    redirect(`/admin/${resource}`);
  }

  if (resource === "media") {
    const file = formData.get("file");
    if (file instanceof File) {
      const uploadedUrl = await saveUploadedMedia(file);
      if (uploadedUrl) {
        nextItem.url = uploadedUrl;
      }
    }

    if (typeof nextItem.url === "string" && nextItem.url && !isSafeMediaUrl(nextItem.url)) {
      nextItem.url = "";
    }

    nextItem.createdAt = typeof nextItem.createdAt === "string" ? nextItem.createdAt : new Date().toISOString();
  }

  if (resource === "links") {
    if (typeof nextItem.url !== "string" || !isSafeActionUrl(nextItem.url)) {
      redirect(`/admin/${resource}`);
    }

    nextItem.placement =
      typeof nextItem.placement === "string" && nextItem.placement
        ? nextItem.placement
        : "ARTICLE_BOTH";
    nextItem.brandColor = normalizeHexColor(nextItem.brandColor);
  }

  if (resource === "services") {
    const ctaUrl = String(nextItem.ctaUrl ?? "").trim();
    nextItem.ctaUrl = ctaUrl && isSafeActionUrl(ctaUrl) ? ctaUrl : "/contact";
  }

  if (resource === "redirects") {
    const source = String(nextItem.source ?? "").trim();
    const destination = String(nextItem.destination ?? "").trim();
    const normalizedSource = source.startsWith("/") ? source : `/${source}`;
    const normalizedDestination =
      destination.startsWith("/") || isSafeHttpUrl(destination) ? destination : `/${destination}`;

    if (!isSafeInternalPath(normalizedSource) || normalizedSource.startsWith("/admin")) {
      redirect(`/admin/${resource}`);
    }

    if (!isSafeInternalPath(normalizedDestination) && !isSafeHttpUrl(normalizedDestination)) {
      redirect(`/admin/${resource}`);
    }

    nextItem.source = normalizedSource;
    nextItem.destination = normalizedDestination;
  }

  normalizeGenericSeo(nextItem);

  if (resource === "users") {
    const submittedPassword = String(formData.get("password") ?? "").trim();

    if (submittedPassword && submittedPassword.length < 10) {
      redirect(`/admin/${resource}`);
    }

    await normalizeUser(nextItem);

    if (existingIndex < 0 && !nextItem.passwordHash) {
      redirect(`/admin/${resource}`);
    }
  }

  if (resource === "posts") {
    const normalized = normalizePost(nextItem, data);
    if (existingIndex >= 0) {
      collection[existingIndex] = normalized as unknown as Record<string, unknown>;
    } else {
      collection.unshift(normalized as unknown as Record<string, unknown>);
    }
  } else if (resource === "testimonials") {
    const normalized = normalizeTestimonial(nextItem, data, existingIndex);
    if (existingIndex >= 0) {
      collection[existingIndex] = normalized;
    } else {
      collection.push(normalized);
    }
  } else {
    if (existingIndex >= 0) {
      collection[existingIndex] = nextItem;
    } else {
      collection.unshift(nextItem);
    }
  }

  data.activityLogs.unshift({
    id: createId("log"),
    action: existingIndex >= 0 ? "resource_updated" : "resource_created",
    entity: resource,
    entityId: String(nextItem.id),
    createdAt: new Date().toISOString()
  });

  await writeData(data);
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/recherche");
  revalidatePath("/a-propos");
  revalidatePath("/formations");
  revalidatePath("/temoignages");
  revalidatePath("/sitemap.xml");
  data.categories.forEach((category) => revalidatePath(`/categorie/${category.slug}`));
  data.tags.forEach((tag) => revalidatePath(`/tag/${tag.slug}`));
  revalidatePath(`/admin/${resource}`);
  redirect(`/admin/${resource}`);
}

export async function deleteResourceAction(formData: FormData) {
  const requestHeaders = await headers();
  const resource = String(formData.get("resource") ?? "");
  const id = String(formData.get("id") ?? "");
  const config = getAdminResource(resource);
  const session = await getAdminSession();

  if (!isSameOriginRequest(requestHeaders)) {
    redirect("/admin");
  }

  if (!config || !id || config.allowDelete === false) {
    redirect(config ? `/admin/${config.slug}` : "/admin");
  }

  if (!session) {
    redirect("/admin/login");
  }

  if (!canManageResource(session, resource, "delete")) {
    redirect(`/admin/${resource}`);
  }

  const data = await readData();
  const collection = getCollection(data, config.collection);
  const nextCollection = collection.filter((item) => item.id !== id);
  (data as unknown as Record<string, unknown>)[config.collection] = nextCollection;

  data.activityLogs.unshift({
    id: createId("log"),
    action: "resource_deleted",
    entity: resource,
    entityId: id,
    createdAt: new Date().toISOString()
  });

  await writeData(data);
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/recherche");
  revalidatePath("/a-propos");
  revalidatePath("/formations");
  revalidatePath("/temoignages");
  revalidatePath("/sitemap.xml");
  data.categories.forEach((category) => revalidatePath(`/categorie/${category.slug}`));
  data.tags.forEach((tag) => revalidatePath(`/tag/${tag.slug}`));
  revalidatePath(`/admin/${resource}`);
  redirect(`/admin/${resource}`);
}
