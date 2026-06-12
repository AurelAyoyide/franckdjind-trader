"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminResource } from "@/lib/admin-resources";
import { getAdminSession } from "@/lib/auth";
import { createId, readData, writeData, type BlogData, type StoredArticle } from "@/lib/data-store";
import { sanitizeRichHtml, markdownLikeToHtml } from "@/lib/sanitize";
import type { AdminSession } from "@/lib/auth-edge";

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

function getCollection(data: BlogData, collection: keyof BlogData) {
  return data[collection] as Array<Record<string, unknown>>;
}

function canManageResource(session: AdminSession, resource: string, action: "save" | "delete") {
  if (session.role === "ADMIN") {
    return true;
  }

  if (session.role === "EDITOR") {
    return !["users", "settings"].includes(resource);
  }

  return resource === "posts" && action === "save";
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
    image: typeof item.image === "string" && item.image ? item.image : "/hero-trading-desk.png",
    featured: Boolean(item.featured),
    robotsIndex: item.robotsIndex !== false,
    robotsFollow: item.robotsFollow !== false
  } as unknown as StoredArticle;
}

export async function saveResourceAction(formData: FormData) {
  const resource = String(formData.get("resource") ?? "");
  const id = String(formData.get("id") ?? "");
  const config = getAdminResource(resource);
  const session = await getAdminSession();

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
    const value = parseFieldValue(field.type, formData, field.name);
    nextItem[field.name] =
      field.name === "content" && typeof value === "string"
        ? sanitizeRichHtml(markdownLikeToHtml(value))
        : value;
  }

  if (resource === "posts") {
    const normalized = normalizePost(nextItem, data);
    if (existingIndex >= 0) {
      collection[existingIndex] = normalized as unknown as Record<string, unknown>;
    } else {
      collection.unshift(normalized as unknown as Record<string, unknown>);
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
  const resource = String(formData.get("resource") ?? "");
  const id = String(formData.get("id") ?? "");
  const config = getAdminResource(resource);
  const session = await getAdminSession();

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
