import Link from "next/link";
import { CandlestickChart, Mail, MessageCircle } from "lucide-react";
import { siteConfig } from "@/lib/content";
import { getPublicData } from "@/lib/data-store";

export async function SiteFooter() {
  const { categories } = await getPublicData();

  return (
    <footer className="border-t border-line bg-background-soft">
      <div className="site-shell py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-market/12 text-market">
                <CandlestickChart className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="text-sm font-black uppercase tracking-[0.18em]">
                {siteConfig.name}
              </span>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-7 text-muted">
              Blog, formation et accompagnement pour apprendre a trader avec un cadre clair,
              une gestion du risque stricte et une lecture sobre du marche.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                className="inline-flex items-center gap-2 rounded-lg border border-line bg-foreground/[0.06] px-3 py-2 text-sm font-semibold text-muted hover:text-foreground"
                href={siteConfig.telegramPath}
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Telegram
              </Link>
              <Link
                className="inline-flex items-center gap-2 rounded-lg border border-line bg-foreground/[0.06] px-3 py-2 text-sm font-semibold text-muted hover:text-foreground"
                href={`mailto:${siteConfig.email}`}
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                Email
              </Link>
            </div>
          </div>

          <div>
            <h2 className="text-xs font-black uppercase tracking-[0.25em] text-muted-strong">
              Navigation
            </h2>
            <ul className="mt-5 grid gap-3 text-sm text-muted">
              <li><Link href="/blog">Blog</Link></li>
              <li><Link href="/recherche">Recherche</Link></li>
              <li><Link href="/formations">Formations</Link></li>
              <li><Link href="/temoignages">Temoignages</Link></li>
              <li><Link href="/a-propos">A propos</Link></li>
              <li><Link href="/contact">Contact</Link></li>
              <li><Link href="/#newsletter">Newsletter</Link></li>
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-black uppercase tracking-[0.25em] text-muted-strong">
              Categories
            </h2>
            <ul className="mt-5 grid gap-3 text-sm text-muted">
              {categories.slice(0, 4).map((category) => (
                <li key={category.slug}>
                  <Link href={`/categorie/${category.slug}`}>{category.title}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-black uppercase tracking-[0.25em] text-muted-strong">
              Legal
            </h2>
            <ul className="mt-5 grid gap-3 text-sm text-muted">
              <li><Link href="/disclaimer">Disclaimer trading</Link></li>
              <li><Link href="/politique-confidentialite">Confidentialite</Link></li>
              <li><Link href="/conditions-utilisation">Conditions</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-line pt-6 text-xs leading-6 text-muted-strong md:flex-row md:items-center md:justify-between">
          <p>(c) 2026 {siteConfig.name}. Tous droits reserves.</p>
          <p className="max-w-2xl">
            Le trading comporte un risque de perte. Les contenus publies sont educatifs et ne constituent pas un conseil financier personnalise.
          </p>
        </div>
      </div>
    </footer>
  );
}
