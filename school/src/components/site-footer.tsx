import Link from "next/link";
import { BadgeCheck, GraduationCap, MessageCircle } from "lucide-react";
import { siteConfig } from "@/lib/platform-content";

const footerLinks = [
  { href: "/login", label: "Connexion" },
  { href: "/register", label: "Creer un compte" },
  { href: "/certificates/verify", label: "Verifier un certificat" },
  { href: "/terms", label: "Conditions" },
  { href: "/privacy-policy", label: "Confidentialite" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-background-soft">
      <div className="site-shell grid gap-8 py-10 md:grid-cols-[1fr_1.2fr_0.8fr] md:py-12">
        <div>
          <Link className="inline-flex items-center gap-3" href="/">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-market/12 text-market">
              <GraduationCap className="h-5 w-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-sm font-black uppercase tracking-[0.18em]">{siteConfig.name}</span>
              <span className="mt-1 block text-xs font-semibold text-muted">Formation privee et suivi apprenant</span>
            </span>
          </Link>
          <p className="mt-5 max-w-sm text-sm leading-7 text-muted">
            Une plateforme privee pour suivre les formations, attribuer les acces et verifier les certificats.
          </p>
        </div>

        <nav className="grid gap-2 sm:grid-cols-2">
          {footerLinks.map((item) => (
            <Link
              className="rounded-lg px-3 py-2 text-sm font-semibold text-muted transition hover:bg-foreground/[0.06] hover:text-foreground"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="grid gap-3">
          <div className="rounded-lg border border-line bg-surface p-4">
            <BadgeCheck className="h-5 w-5 text-market" aria-hidden="true" />
            <p className="mt-3 text-sm font-black">Certificat public</p>
            <p className="mt-2 text-xs leading-6 text-muted">Entre le code du certificat pour confirmer sa validite.</p>
          </div>
          <a
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-line bg-foreground/[0.06] px-4 text-sm font-black transition hover:border-line-strong"
            href={`https://wa.me/${siteConfig.whatsappNumber}`}
            rel="noreferrer"
            target="_blank"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            WhatsApp
          </a>
        </div>
      </div>
      <div className="border-t border-line py-4">
        <div className="site-shell flex flex-col gap-2 text-xs font-semibold text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} {siteConfig.name}. Tous droits reserves.</p>
          <p>Acces aux formations sur validation du formateur.</p>
        </div>
      </div>
    </footer>
  );
}
