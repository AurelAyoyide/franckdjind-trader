import { LogOut } from "lucide-react";
import { logoutAction } from "@/app/admin/actions";
import { AdminNavLink } from "@/components/admin/admin-nav-link";
import { PendingSubmitButton } from "@/components/pending-submit-button";
import { getAdminSession } from "@/lib/auth";
import { canViewAdminResource } from "@/lib/permissions";

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/posts", label: "Articles", icon: "posts" },
  { href: "/admin/categories", label: "Categories", icon: "categories" },
  { href: "/admin/tags", label: "Tags", icon: "tags" },
  { href: "/admin/pages", label: "Pages", icon: "pages" },
  { href: "/admin/media", label: "Medias", icon: "media" },
  { href: "/admin/testimonials", label: "Temoignages", icon: "testimonials" },
  { href: "/admin/services", label: "Services", icon: "services" },
  { href: "/admin/links", label: "Liens", icon: "links" },
  { href: "/admin/contact-messages", label: "Messages", icon: "messages" },
  { href: "/admin/redirects", label: "Redirections", icon: "redirects" },
  { href: "/admin/settings", label: "Parametres", icon: "settings" },
  { href: "/admin/users", label: "Utilisateurs", icon: "users" },
  { href: "/admin/subscribers", label: "Newsletter", icon: "subscribers" }
] as const;

function resourceFromHref(href: string) {
  if (href === "/admin") {
    return null;
  }

  return href.replace("/admin/", "").split("/")[0];
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();

  if (!session) {
    return children;
  }

  return (
    <div className="border-t border-line bg-background-soft">
      <div className="site-shell grid gap-6 py-6 lg:grid-cols-[230px_1fr]">
        <aside className="rounded-lg border border-line bg-surface p-3 lg:sticky lg:top-24 lg:self-start">
          <div className="px-3 py-3">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-market">Admin</p>
            <p className="mt-2 text-sm font-semibold text-muted">{session.email}</p>
          </div>
          <nav className="mt-2 grid gap-1">
            {adminLinks
              .filter((link) => {
                const resource = resourceFromHref(link.href);
                return !resource || canViewAdminResource(session, resource);
              })
              .map((link) => (
                <AdminNavLink href={link.href} icon={link.icon} key={link.href} label={link.label} />
              ))}
          </nav>
          <form action={logoutAction} className="mt-4 border-t border-line pt-3">
            <PendingSubmitButton
              className="w-full justify-start border border-danger/30 bg-danger/10 px-3 py-2 text-left font-semibold text-danger hover:bg-danger/15"
              pendingLabel="Deconnexion..."
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Deconnexion
            </PendingSubmitButton>
          </form>
        </aside>
        <div>{children}</div>
      </div>
    </div>
  );
}
