import type { AdminSession } from "@/lib/auth-edge";

const editorBlockedResources = ["settings", "users"] as const;

export function canViewAdminResource(session: AdminSession, resource: string) {
  if (session.role === "ADMIN") {
    return true;
  }

  if (session.role === "EDITOR") {
    return !editorBlockedResources.includes(resource as (typeof editorBlockedResources)[number]);
  }

  return resource === "posts";
}

export function canManageResource(session: AdminSession, resource: string, action: "save" | "delete") {
  if (session.role === "ADMIN") {
    return true;
  }

  if (session.role === "EDITOR") {
    return !editorBlockedResources.includes(resource as (typeof editorBlockedResources)[number]);
  }

  return resource === "posts" && action === "save";
}
