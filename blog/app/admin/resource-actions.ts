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
import { canManagePostAuthor, canManageResource, canPublishPosts } from "@/lib/permissions";
import { sanitizeRichHtml, markdownLikeToHtml } from "@/lib/sanitize";
import {
  isSafeActionUrl,
  isSafeHttpUrl,
  isSafeInternalPath,
  isSafeMediaUrl,
  isSameOriginRequest,
  hashValue,
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
  if (name === "tagSlugs") {
    return formData
      .getAll(name)
      .map((value) => String(value).trim())
      .filter(Boolean)
      .join(", ");
  }

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

  const maxUploadBytes = 20 * 1024 * 1024;
  const allowedTypes = new Map<string, string[]>([
    ["image/jpeg", [".jpg", ".jpeg"]],
    ["image/png", [".png"]],
    ["image/webp", [".webp"]],
    ["image/avif", [".avif"]]
  ]);
  const extension = path.extname(file.name).toLowerCase();
  const bytes = Buffer.from(await file.arrayBuffer());
  const mimeType = detectImageMime(bytes);
  const allowedExtensions = mimeType ? allowedTypes.get(mimeType) : undefined;

  if (file.size > maxUploadBytes || !mimeType || !allowedExtensions?.includes(extension)) {
    return "";
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadsDir, { recursive: true });
  const fileName = slugifyFileName(file.name);
  await fs.writeFile(path.join(uploadsDir, fileName), bytes);

  return `/uploads/${fileName}`;
}

function detectImageMime(bytes: Buffer) {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }

  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "image/png";
  }

  if (bytes.length >= 12 && bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP") {
    return "image/webp";
  }

  if (bytes.length >= 12 && bytes.subarray(4, 8).toString("ascii") === "ftyp") {
    const brand = bytes.subarray(8, 12).toString("ascii");
    if (brand === "avif" || brand === "avis") {
      return "image/avif";
    }
  }

  return undefined;
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

function resourceFormPath(resource: string, id: string) {
  return id ? `/admin/${resource}/${id}/edit` : `/admin/${resource}/new`;
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
  const contentEn = String(item.contentEn ?? "").trim()
    ? sanitizeRichHtml(markdownLikeToHtml(String(item.contentEn)))
    : undefined;

  delete item.categorySlug;
  delete item.tagSlugs;

  return {
    ...item,
    content,
    contentEn,
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
  item.seoTitle = String(item.title || item.name || "");
  item.seoDescription = truncateText(stripHtml(String(item.excerpt || item.description || item.content || "")));
  item.robotsIndex = item.robotsIndex !== false;
  item.robotsFollow = item.robotsFollow !== false;
}

function applyAutomaticFields({
  resource,
  item,
  current,
  data,
  session,
  isNew
}: {
  resource: string;
  item: Record<string, unknown>;
  current: Record<string, unknown>;
  data: BlogData;
  session: NonNullable<Awaited<ReturnType<typeof getAdminSession>>>;
  isNew: boolean;
}) {
  const slugSources: Record<string, string> = {
    posts: String(item.title ?? ""),
    categories: String(item.title ?? ""),
    tags: String(item.title ?? ""),
    pages: String(item.title ?? ""),
    services: String(item.title ?? ""),
    links: String(item.label ?? "")
  };

  if (resource in slugSources) {
    item.slug = isNew ? normalizeSlug(slugSources[resource]) : String(current.slug ?? normalizeSlug(slugSources[resource]));
  }

  if (["posts", "categories", "tags", "pages"].includes(resource)) {
    normalizeGenericSeo(item);
  }

  if (resource === "posts") {
    if (item.status === "PUBLISHED" && !canPublishPosts(session)) {
      item.status = "REVIEW";
    }

    const content = String(item.content ?? "");
    item.excerpt = truncateText(stripHtml(content), 240);
    item.author = isNew ? session.name?.trim() || session.email : String(current.author ?? (session.name?.trim() || session.email));

    if (item.status === "PUBLISHED" && !item.publishedAt) {
      item.publishedAt = new Date().toISOString().slice(0, 10);
    }

    item.seoTitle = String(item.title ?? "");
    item.seoDescription = truncateText(String(item.excerpt ?? ""), 160);
  }

  if (resource === "services") {
    item.order = isNew ? Math.max(0, ...data.services.map((service) => service.order || 0)) + 1 : Number(current.order || 1);
  }

  if (resource === "media") {
    item.type = "IMAGE";
  }
}

function normalizeTestimonial(item: Record<string, unknown>, data: BlogData, existingIndex: number) {
  const currentOrder =
    typeof item.order === "number" && item.order > 0
      ? item.order
      : Math.max(0, ...data.testimonials.map((testimonial) => testimonial.order || 0)) + 1;

  return {
    ...item,
    rating: Math.round(Math.min(5, Math.max(1, Number(item.rating || 5))) * 10) / 10,
    published: item.published === true,
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

  if (resource === "posts" && existingIndex >= 0 && !canManagePostAuthor(session, current.author)) {
    redirect("/admin/posts");
  }

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

    if (
      field.type === "select" &&
      field.options &&
      typeof value === "string" &&
      !field.options.some((option) => option.value === value)
    ) {
      redirect(`${resourceFormPath(resource, id)}?error=invalid`);
    }

    if (typeof value === "string" && value.length > (field.name === "content" ? 100_000 : 5_000)) {
      redirect(`${resourceFormPath(resource, id)}?error=invalid`);
    }

    nextItem[field.name] =
      field.name === "content" && typeof value === "string"
        ? sanitizeRichHtml(markdownLikeToHtml(value))
        : value;
  }

  const missingRequiredField = config.fields.some(
    (field) => field.required && field.type !== "file" && !hasRequiredValue(nextItem[field.name])
  );

  if (missingRequiredField) {
    redirect(`${resourceFormPath(resource, id)}?error=required`);
  }

  applyAutomaticFields({ resource, item: nextItem, current, data, session, isNew: existingIndex < 0 });

  if (typeof nextItem.slug === "string" && nextItem.slug) {
    const hasDuplicateSlug = collection.some((entry) => entry.id !== nextItem.id && entry.slug === nextItem.slug);
    if (hasDuplicateSlug) {
      redirect(`${resourceFormPath(resource, id)}?error=slug-exists`);
    }
  }

  if (resource === "media") {
    const file = formData.get("mediaFile");
    const sourceMode = String(formData.get("urlMode") ?? "");
    const hasUploadedFile = file instanceof File && file.size > 0;
    const hasRemoteUrl = typeof nextItem.url === "string" && Boolean(nextItem.url.trim());

    if (hasUploadedFile && hasRemoteUrl) {
      redirect(`${resourceFormPath(resource, id)}?error=media-source`);
    }

    if (hasUploadedFile && file instanceof File) {
      const oneHourAgo = Date.now() - 60 * 60 * 1000;
      const uploadKey = hashValue(session.email);
      const uploadsThisHour = data.activityLogs.filter(
        (log) =>
          log.action === "media_uploaded" &&
          log.entityId === uploadKey &&
          new Date(log.createdAt).getTime() >= oneHourAgo
      );

      if (uploadsThisHour.length >= 20) {
        redirect(`${resourceFormPath(resource, id)}?error=upload-limit`);
      }

      const uploadedUrl = await saveUploadedMedia(file);
      if (uploadedUrl) {
        nextItem.url = uploadedUrl;
        data.activityLogs.unshift({
          id: createId("log"),
          action: "media_uploaded",
          entity: "media",
          entityId: uploadKey,
          createdAt: new Date().toISOString()
        });
      }
    }

    if (sourceMode === "upload" && !hasUploadedFile) {
      redirect(`${resourceFormPath(resource, id)}?error=image-upload`);
    }

    if (typeof nextItem.url === "string" && nextItem.url && !isSafeMediaUrl(nextItem.url)) {
      redirect(`${resourceFormPath(resource, id)}?error=media-url`);
    }

    if (!nextItem.url) {
      redirect(`${resourceFormPath(resource, id)}?error=media-required`);
    }

    nextItem.createdAt = typeof nextItem.createdAt === "string" ? nextItem.createdAt : new Date().toISOString();
  }

  if (resource === "links") {
    if (typeof nextItem.url !== "string" || !isSafeActionUrl(nextItem.url)) {
      redirect(`${resourceFormPath(resource, id)}?error=invalid-url`);
    }

    nextItem.placement =
      typeof nextItem.placement === "string" && nextItem.placement
        ? nextItem.placement
        : "ARTICLE_BOTH";
    nextItem.brandColor = normalizeHexColor(nextItem.brandColor);

    const imageFile = formData.get("linkImageFile");
    const imageMode = String(formData.get("imageUrlMode") ?? "");
    const hasUploadedImage = imageFile instanceof File && imageFile.size > 0;

    if (imageMode === "upload") {
      if (!hasUploadedImage || !(imageFile instanceof File)) {
        redirect(`${resourceFormPath(resource, id)}?error=image-upload`);
      }

      const uploadedUrl = await saveUploadedMedia(imageFile);
      if (!uploadedUrl) {
        redirect(`${resourceFormPath(resource, id)}?error=image-upload`);
      }

      nextItem.imageUrl = uploadedUrl;
      data.media.unshift({
        id: createId("media"),
        title: `Visuel partenaire — ${String(nextItem.label ?? "Lien")}`,
        url: uploadedUrl,
        alt: String(nextItem.label ?? "Visuel partenaire"),
        type: "IMAGE",
        createdAt: new Date().toISOString()
      });
    }

    if (imageMode === "library" || imageMode === "url") {
      const candidateUrl = String(nextItem.imageUrl ?? "").trim();
      if (candidateUrl && !isSafeMediaUrl(candidateUrl)) {
        redirect(`${resourceFormPath(resource, id)}?error=media-url`);
      }
      nextItem.imageUrl = candidateUrl || undefined;
    }
  }

  if (resource === "services") {
    const ctaUrl = String(nextItem.ctaUrl ?? "").trim();
    const priceMode = String(nextItem.priceMode ?? "FIXED");
    const currency = ["XOF", "EUR", "USD"].includes(String(nextItem.currency)) ? String(nextItem.currency) : "XOF";
    const priceAmount = Number(nextItem.priceAmount);

    if (priceMode === "FIXED" && (!Number.isFinite(priceAmount) || priceAmount <= 0)) {
      redirect(`${resourceFormPath(resource, id)}?error=price`);
    }

    nextItem.priceLabel =
      priceMode === "ON_REQUEST"
        ? "Sur demande"
        : priceMode === "FREE"
          ? "Gratuit"
          : `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(priceAmount)} ${currency}`;
    delete nextItem.priceMode;
    delete nextItem.priceAmount;
    delete nextItem.currency;
    nextItem.ctaUrl = ctaUrl && isSafeActionUrl(ctaUrl) ? ctaUrl : "/contact";
  }

  if (resource === "redirects") {
    const source = String(nextItem.source ?? "").trim();
    const destination = String(nextItem.destination ?? "").trim();
    const normalizedSource = source.startsWith("/") ? source : `/${source}`;
    const normalizedDestination =
      destination.startsWith("/") || isSafeHttpUrl(destination) ? destination : `/${destination}`;

    if (!isSafeInternalPath(normalizedSource) || normalizedSource.startsWith("/admin")) {
      redirect(`${resourceFormPath(resource, id)}?error=invalid-redirect`);
    }

    if (!isSafeInternalPath(normalizedDestination) && !isSafeHttpUrl(normalizedDestination)) {
      redirect(`${resourceFormPath(resource, id)}?error=invalid-redirect`);
    }

    nextItem.source = normalizedSource;
    nextItem.destination = normalizedDestination;
  }

  if (resource === "users") {
    const submittedPassword = String(formData.get("password") ?? "").trim();
    const normalizedEmail = String(nextItem.email ?? "").trim().toLowerCase();

    if (collection.some((user) => user.id !== nextItem.id && String(user.email ?? "").trim().toLowerCase() === normalizedEmail)) {
      redirect(`${resourceFormPath(resource, id)}?error=email-exists`);
    }

    nextItem.email = normalizedEmail;

    if (submittedPassword && (submittedPassword.length < 10 || !/[A-Za-z]/.test(submittedPassword) || !/\d/.test(submittedPassword))) {
      redirect(`${resourceFormPath(resource, id)}?error=password`);
    }

    await normalizeUser(nextItem);

    if (existingIndex < 0 && !nextItem.passwordHash) {
      redirect(`${resourceFormPath(resource, id)}?error=password-required`);
    }
  }

  if (resource === "posts") {
    const imageFile = formData.get("imageFile");
    const imageMode = String(formData.get("imageMode") ?? "");
    const hasUploadedImage = imageFile instanceof File && imageFile.size > 0;

    if (imageMode === "upload") {
      if (!hasUploadedImage || !(imageFile instanceof File)) {
        redirect(`${resourceFormPath(resource, id)}?error=image-upload`);
      }

      const uploadedUrl = await saveUploadedMedia(imageFile);
      if (!uploadedUrl) {
        redirect(`${resourceFormPath(resource, id)}?error=image-upload`);
      }

      nextItem.image = uploadedUrl;
      data.media.unshift({
        id: createId("media"),
        title: `Couverture — ${String(nextItem.title ?? "Article")}`,
        url: uploadedUrl,
        alt: String(nextItem.title ?? "Image de couverture"),
        type: "IMAGE",
        createdAt: new Date().toISOString()
      });
    }

    if (imageMode === "library" && nextItem.image !== "/hero-trading-desk.png" && !data.media.some((media) => media.url === nextItem.image)) {
      redirect(`${resourceFormPath(resource, id)}?error=image-source`);
    }

    if (!nextItem.image || !isSafeMediaUrl(String(nextItem.image))) {
      redirect(`${resourceFormPath(resource, id)}?error=media-url`);
    }

    const categorySlug = String(nextItem.categorySlug ?? "");
    const requestedTags = String(nextItem.tagSlugs ?? "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    if (!data.categories.some((category) => category.slug === categorySlug) || requestedTags.some((tag) => !data.tags.some((entry) => entry.slug === tag))) {
      redirect(`${resourceFormPath(resource, id)}?error=invalid-relation`);
    }

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
  redirect(`/admin/${resource}?notice=${existingIndex >= 0 ? "updated" : "created"}`);
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
  redirect(`/admin/${resource}?notice=deleted`);
}
