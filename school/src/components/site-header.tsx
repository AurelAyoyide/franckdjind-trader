import Link from "next/link";
import { GraduationCap, LogIn } from "lucide-react";
import { MarketTicker } from "@/components/market-ticker";
import { MobileMenu } from "@/components/mobile-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { ButtonLink } from "@/components/ui/button-link";
import { siteConfig } from "@/lib/platform-content";

const navItems = [
  { href: "/", label: "Accueil" },
  { href: "/register", label: "Inscription" },
  { href: "/access-choice", label: "Demander un acces" },
  { href: "/certificates/verify", label: "Verifier certificat" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-background/86 backdrop-blur-xl">
      <MarketTicker />
      <div className="site-shell relative flex min-h-16 items-center justify-between gap-4">
        <Link className="flex items-center gap-3" href="/">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-market/12 text-market">
            <GraduationCap className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="leading-none">
            <span className="block text-sm font-black uppercase tracking-[0.18em] text-foreground">
              {siteConfig.name}
            </span>
            <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.26em] text-muted">
              {siteConfig.tagline}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Link
              className="rounded-lg px-3 py-2 text-sm font-semibold text-muted transition hover:bg-foreground/[0.06] hover:text-foreground"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <ThemeToggle />
          <ButtonLink href="/login" variant="secondary">
            <LogIn className="h-4 w-4" aria-hidden="true" />
            Connexion
          </ButtonLink>
          <ButtonLink href="/register" showArrow>
            Creer un compte
          </ButtonLink>
        </div>

        <MobileMenu />
      </div>
    </header>
  );
}
