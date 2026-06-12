import Link from "next/link";
import { logoutAction } from "@/app/admin/actions";
import { getAdminSession } from "@/lib/auth";

const adminLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/posts", label: "Articles" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/tags", label: "Tags" },
  { href: "/admin/pages", label: "Pages" },
  { href: "/admin/media", label: "Medias" },
  { href: "/admin/testimonials", label: "Temoignages" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/links", label: "Liens" },
  { href: "/admin/contact-messages", label: "Messages" },
  { href: "/admin/redirects", label: "Redirections" },
  { href: "/admin/settings", label: "Parametres" },
  { href: "/admin/users", label: "Utilisateurs" },
  { href: "/admin/subscribers", label: "Newsletter" }
];

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
            {adminLinks.map((link) => (
              <Link
                className="rounded-md px-3 py-2 text-sm font-semibold text-muted transition hover:bg-foreground/[0.06] hover:text-foreground"
                href={link.href}
                key={link.href}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <form action={logoutAction} className="mt-4 border-t border-line pt-3">
            <button className="w-full rounded-md bg-foreground/[0.06] px-3 py-2 text-left text-sm font-semibold text-muted transition hover:text-foreground" type="submit">
              Deconnexion
            </button>
          </form>
        </aside>
        <div>{children}</div>
      </div>
    </div>
  );
}
