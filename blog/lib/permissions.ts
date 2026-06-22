import type { AdminSession } from "@/lib/auth-edge";

const contentResources = ["posts", "categories", "tags", "pages", "services", "testimonials"] as const;
const mediaResources = ["media", "links"] as const;
const editorialResources = [...contentResources, ...mediaResources] as const;

function canAccessResource(session: AdminSession, resource: string) {
  if (session.role === "ADMIN") return true;

  if (session.role === "EDITOR") {
    return editorialResources.includes(resource as (typeof editorialResources)[number]);
  }

  if (session.role === "CONTENT_MANAGER") {
    return contentResources.includes(resource as (typeof contentResources)[number]);
  }

  if (session.role === "MEDIA_MANAGER") {
    return mediaResources.includes(resource as (typeof mediaResources)[number]);
  }

  return resource === "posts";
}

export function canViewAdminResource(session: AdminSession, resource: string) {
  return canAccessResource(session, resource);
}

export function canManageResource(session: AdminSession, resource: string, action: "save" | "delete") {
  if (resource === "settings") {
    return false;
  }

  if (!canAccessResource(session, resource)) return false;
  return session.role !== "AUTHOR" || (resource === "posts" && action === "save");
}

export function canManagePostAuthor(session: AdminSession, author: unknown) {
  if (session.role !== "AUTHOR") {
    return true;
  }

  const normalizedAuthor = String(author ?? "").trim().toLowerCase();
  return normalizedAuthor === session.email.toLowerCase() || normalizedAuthor === session.name?.trim().toLowerCase();
}

export function canPublishPosts(session: AdminSession) {
  return session.role === "ADMIN" || session.role === "EDITOR" || session.role === "CONTENT_MANAGER";
}
