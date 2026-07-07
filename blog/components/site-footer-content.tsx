"use client";

import Link from "next/link";
import { CandlestickChart, Mail, MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/lib/content";
import { englishCategoryLabels, localeFromPathname, localizePath, uiCopy } from "@/lib/localization";

type FooterCategory = { slug: string; title: string };

export function SiteFooterContent({ categories, email }: { categories: FooterCategory[]; email: string }) {
  const pathname = usePathname();
  const locale = localeFromPathname(pathname);
  const copy = uiCopy[locale];

  return (
    <footer className="border-t border-line bg-background-soft">
      <div className="site-shell py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-market/12 text-market">
                <CandlestickChart className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="text-sm font-black uppercase tracking-[0.18em]">{siteConfig.name}</span>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-7 text-muted">{copy.footerDescription}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <a className="inline-flex items-center gap-2 rounded-lg border border-line bg-foreground/[0.06] px-3 py-2 text-sm font-semibold text-muted hover:text-foreground" href={siteConfig.telegramPath}>
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Telegram
              </a>
              <Link className="inline-flex items-center gap-2 rounded-lg border border-line bg-foreground/[0.06] px-3 py-2 text-sm font-semibold text-muted hover:text-foreground" href={`mailto:${email}`}>
                <Mail className="h-4 w-4" aria-hidden="true" />
                Email
              </Link>
            </div>
          </div>

          <FooterSection title={copy.navigation}>
            <li><Link href={localizePath("/blog", locale)}>{copy.blog}</Link></li>
            <li><Link href={localizePath("/recherche", locale)}>{copy.search}</Link></li>
            <li><Link href={localizePath("/formations", locale)}>{copy.formations}</Link></li>
            <li><Link href={localizePath("/temoignages", locale)}>{copy.testimonials}</Link></li>
            <li><Link href={localizePath("/a-propos", locale)}>{copy.about}</Link></li>
            <li><Link href={localizePath("/contact", locale)}>{copy.contact}</Link></li>
            <li><Link href={`${localizePath("/", locale)}#newsletter`}>{copy.newsletter}</Link></li>
          </FooterSection>

          <FooterSection title={copy.categories}>
            {categories.slice(0, 4).map((category) => (
              <li key={category.slug}>
                <Link href={localizePath(`/categorie/${category.slug}`, locale)}>
                  {locale === "en" ? englishCategoryLabels[category.slug] || category.title : category.title}
                </Link>
              </li>
            ))}
            <li>
              <Link className="font-semibold text-market" href={localizePath("/recherche", locale)}>
                {locale === "fr" ? "Voir toutes les catégories" : "Browse all categories"}
              </Link>
            </li>
          </FooterSection>

          <FooterSection title={copy.legal}>
            <li><Link href={localizePath("/disclaimer", locale)}>{copy.disclaimer}</Link></li>
            <li><Link href={localizePath("/politique-confidentialite", locale)}>{copy.privacy}</Link></li>
            <li><Link href={localizePath("/conditions-utilisation", locale)}>{copy.terms}</Link></li>
          </FooterSection>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-line pt-6 text-xs leading-6 text-muted-strong md:flex-row md:items-center md:justify-between">
          <p>(c) 2026 {siteConfig.name}. {copy.allRights}</p>
          <p className="max-w-2xl">{copy.footerRisk}</p>
        </div>
      </div>
    </footer>
  );
}

function FooterSection({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div>
      <h2 className="text-xs font-black uppercase tracking-[0.25em] text-muted-strong">{title}</h2>
      <ul className="mt-5 grid gap-3 text-sm text-muted">{children}</ul>
    </div>
  );
}
