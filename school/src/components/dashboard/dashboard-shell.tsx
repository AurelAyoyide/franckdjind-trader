import Link from "next/link";
import { LogOut } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { adminNav, studentNav, trainerNav } from "@/lib/platform-content";
import type { AppRole } from "@/lib/session";
import { roleLabels } from "@/lib/session";

type DashboardShellProps = {
  role: AppRole;
  title: string;
  description: string;
  children: React.ReactNode;
  action?: React.ReactNode;
};

const navByRole = {
  student: studentNav,
  trainer: trainerNav,
  admin: adminNav,
};

export function DashboardShell({ role, title, description, children, action }: DashboardShellProps) {
  const navItems = navByRole[role];

  return (
    <section className="site-shell py-8 md:py-10">
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-lg border border-line bg-surface p-3">
            <p className="px-3 pb-3 pt-2 text-[10px] font-black uppercase tracking-[0.24em] text-market">
              {roleLabels[role]}
            </p>
            <nav className="grid gap-1">
              {navItems.map((item) => (
                <Link
                  className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-muted transition hover:bg-foreground/[0.06] hover:text-foreground"
                  href={item.href}
                  key={item.href}
                >
                  <item.icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-3 border-t border-line pt-3">
              <Link
                className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-muted transition hover:bg-foreground/[0.06] hover:text-foreground"
                href="/logout"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Deconnexion
              </Link>
            </div>
          </div>
        </aside>

        <div>
          <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan">Espace prive</p>
              <h1 className="mt-3 text-3xl font-black leading-tight tracking-tight md:text-5xl">{title}</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted">{description}</p>
            </div>
            {action ?? <ButtonLink href="/" variant="secondary">Accueil</ButtonLink>}
          </div>
          {children}
        </div>
      </div>
    </section>
  );
}
