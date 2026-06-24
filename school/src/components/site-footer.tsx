import Link from "next/link";
import { BadgeCheck, GraduationCap, MessageCircle, Send } from "lucide-react";
import { localePath, translate, type Locale } from "@/lib/i18n";
import { siteConfig } from "@/lib/platform-content";

const footerLinks = [
  { href: "/login", label: "Se connecter" },
  { href: "/register", label: "Creer un compte" },
  { href: "/certificates/verify", label: "Verifier un certificat" },
  { href: "/legal-notice", label: "Mentions legales" },
  { href: "/terms", label: "Conditions d'utilisation" },
  { href: "/privacy-policy", label: "Politique de confidentialite" },
];

export function SiteFooter({ locale }: { locale: Locale }) {
  return (
    <footer className="border-t border-line bg-background-soft">
      <div className="site-shell grid gap-8 py-10 md:grid-cols-[1fr_1.2fr_0.8fr] md:py-12">
        <div>
          <Link className="inline-flex items-center gap-3" href={localePath(locale, "/")}>
            <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-market/12 text-market">
              <GraduationCap className="h-5 w-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-sm font-black uppercase tracking-[0.18em]">{siteConfig.name}</span>
              <span className="mt-1 block text-xs font-semibold text-muted">{translate(locale, "Formation privee et suivi apprenant")}</span>
            </span>
          </Link>
          <p className="mt-5 max-w-sm text-sm leading-7 text-muted">
            {translate(locale, "Une plateforme privee pour structurer les parcours, accompagner les apprenants et certifier les acquis.")}
          </p>
        </div>

        <nav aria-label={locale === "en" ? "Useful links" : "Liens utiles"} className="grid content-start gap-x-8 gap-y-3 sm:grid-cols-2">
          {footerLinks.map((item) => (
            <Link
              className="w-fit text-sm font-semibold text-muted decoration-market decoration-2 underline-offset-4 transition hover:text-foreground hover:underline"
              href={localePath(locale, item.href)}
              key={item.href}
            >
              {translate(locale, item.label)}
            </Link>
          ))}
        </nav>

        <div className="grid content-start gap-4">
          <div className="rounded-lg border border-line bg-surface p-4">
            <BadgeCheck className="h-5 w-5 text-market" aria-hidden="true" />
            <p className="mt-3 text-sm font-black">{translate(locale, "Certificat public")}</p>
            <p className="mt-2 text-xs leading-6 text-muted">{translate(locale, "Verifiez la validite d'un certificat avec son code unique.")}</p>
            <Link
              className="mt-3 inline-flex text-sm font-black text-market decoration-market decoration-2 underline-offset-4 transition hover:text-market-strong hover:underline"
              href={localePath(locale, "/certificates/verify")}
            >
              {translate(locale, "Acceder a la verification")}
            </Link>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 text-sm font-black text-[#062b16] shadow-[0_12px_28px_rgba(37,211,102,0.24)] transition hover:bg-[#1fbd5b]"
              href={siteConfig.whatsappUrl}
              rel="noreferrer"
              target="_blank"
              title={locale === "en" ? "Contact Bono Trading on WhatsApp" : "Contacter Bono Trading sur WhatsApp"}
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              WhatsApp
            </a>
            <a
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#229ED9] px-4 text-sm font-black text-white shadow-[0_12px_28px_rgba(34,158,217,0.22)] transition hover:bg-[#168bc5]"
              href={siteConfig.telegramUrl}
              rel="noreferrer"
              target="_blank"
              title={locale === "en" ? "Join Bono Trading on Telegram" : "Rejoindre Bono Trading sur Telegram"}
            >
              <Send className="h-4 w-4" aria-hidden="true" />
              Telegram
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-line py-4">
        <div className="site-shell flex flex-col gap-2 text-xs font-semibold text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} {siteConfig.name}. {translate(locale, "Tous droits reserves.")}</p>
          <p>{translate(locale, "Les acces sont ouverts apres validation du parcours.")}</p>
        </div>
      </div>
    </footer>
  );
}
