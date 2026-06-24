import Link from "next/link";
import { Fragment } from "react";
import { LogOut } from "lucide-react";
import { adminNav, assistantTrainerNav, studentNav, trainerNav } from "@/lib/platform-content";
import { localePath, translate } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n-server";
import type { AppRole } from "@/lib/session-core";
import { roleLabels } from "@/lib/session-core";

type DashboardShellProps = {
  role: AppRole;
  title: string;
  description: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  isAssistantTrainer?: boolean;
};

const navByRole = {
  student: studentNav,
  trainer: trainerNav,
  admin: adminNav,
};

export async function DashboardShell({ role, title, description, children, action, isAssistantTrainer = false }: DashboardShellProps) {
  const navItems = role === "trainer" && isAssistantTrainer ? assistantTrainerNav : navByRole[role];
  const locale = await getRequestLocale();
  const t = (source: string) => translate(locale, source);

  return (
    <section className="site-shell py-8 md:py-10">
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-lg border border-line bg-surface p-3">
            <p className="px-3 pb-3 pt-2 text-[10px] font-black uppercase tracking-[0.24em] text-market">
              {t(roleLabels[role])}
            </p>
            <nav className="grid gap-1">
              {navItems.map((item, index) => {
                const section = item.section !== navItems[index - 1]?.section ? item.section : undefined;

                return (
                  <Fragment key={item.href}>
                    {section ? (
                      <p className="px-3 pb-1 pt-4 text-[10px] font-black uppercase tracking-[0.18em] text-muted">
                        {t(section)}
                      </p>
                    ) : null}
                    <Link
                      className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-muted transition hover:bg-foreground/[0.06] hover:text-foreground"
                      href={localePath(locale, item.href)}
                    >
                      <item.icon className="h-4 w-4" aria-hidden="true" />
                      {t(item.label)}
                    </Link>
                  </Fragment>
                );
              })}
            </nav>
            <div className="mt-3 border-t border-line pt-3">
              <form action={localePath(locale, "/logout")} method="post">
                <button
                  className="flex min-h-11 w-full items-center gap-3 rounded-lg border border-danger/30 bg-danger/10 px-3 text-sm font-semibold text-danger transition hover:bg-danger/15"
                  type="submit"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  {t("Deconnexion")}
                </button>
              </form>
            </div>
          </div>
        </aside>

        <div>
          <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan">{t("Espace prive")}</p>
              <h1 className="mt-3 text-3xl font-black leading-tight tracking-tight md:text-5xl">{t(title)}</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted">{t(description)}</p>
            </div>
            {action}
          </div>
          {children}
        </div>
      </div>
    </section>
  );
}
