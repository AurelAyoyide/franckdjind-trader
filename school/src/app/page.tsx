import Image from "next/image";
import {
  BadgeCheck,
  BookOpen,
  CalendarDays,
  LockKeyhole,
  MessageCircle,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { localePath, translate } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n-server";
import { publicMetrics, siteConfig } from "@/lib/platform-content";

const workflow = [
  { title: "Créez votre compte", text: "Inscrivez-vous, puis confirmez votre adresse email." },
  { title: "Demandez l'accès", text: "Sélectionnez le parcours qui vous a été proposé." },
  { title: "Suivez la formation", text: "Retrouvez vos leçons, quiz, documents et annonces au même endroit." },
  { title: "Obtenez le certificat", text: "Votre certificat est vérifiable avec son code unique." },
];

const highlights = [
  {
    icon: LockKeyhole,
    title: "Accès protégé",
    text: "Votre espace affiche uniquement les ressources associées à votre parcours.",
  },
  {
    icon: BookOpen,
    title: "Parcours structuré",
    text: "Les leçons, quiz et documents sont regroupés dans un espace clair.",
  },
  {
    icon: CalendarDays,
    title: "Suivi personnalisé",
    text: "Les informations utiles restent accessibles au bon moment, sans dispersion.",
  },
  {
    icon: BadgeCheck,
    title: "Preuve vérifiable",
    text: "Un code public permet de confirmer un certificat sans connexion.",
  },
];

export default async function HomePage() {
  const locale = await getRequestLocale();
  const t = (source: string) => translate(locale, source);

  return (
    <>
      <section className="relative isolate min-h-[82svh] overflow-hidden border-b border-line">
        <Image
          src={siteConfig.heroImage}
          alt=""
          fill
          priority
          fetchPriority="high"
          decoding="sync"
          sizes="100vw"
          className="absolute inset-0 -z-20 object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(5,7,6,0.98)_0%,rgba(5,7,6,0.86)_44%,rgba(5,7,6,0.44)_78%,rgba(5,7,6,0.2)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/72 via-black/20 to-transparent" />

        <div className="site-shell relative flex min-h-[82svh] items-center py-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-3 rounded-lg border border-white/18 bg-black/55 px-3 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-white shadow-[0_18px_45px_rgba(0,0,0,0.25)]">
              <span className="h-2 w-2 rounded-full bg-market" />
              {t("Espace privé de formation")}
            </div>
            <h1 className="mt-7 text-5xl font-black leading-[0.98] tracking-tight text-white text-balance sm:text-6xl lg:text-7xl">
              School
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/78 md:text-lg">
              {t("Un espace privé pour rejoindre votre formation, suivre votre progression et valoriser votre parcours.")}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href={localePath(locale, "/register")} className="w-full sm:w-auto" showArrow>
                {t("Créez votre compte")}
              </ButtonLink>
              <ButtonLink href={localePath(locale, "/login")} className="w-full sm:w-auto" variant="hero">
                {t("Se connecter")}
              </ButtonLink>
              <ButtonLink href={localePath(locale, "/certificates/verify")} className="w-full sm:w-auto" variant="hero">
                {t("Verifier un certificat")}
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-background-soft">
        <div className="site-shell grid grid-cols-2 gap-px overflow-hidden md:grid-cols-4">
          {publicMetrics.map((metric) => (
            <div className="border-x border-line px-4 py-6 md:px-7" key={metric.label}>
              <p className="font-mono text-2xl font-black text-market md:text-3xl">{metric.value}</p>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-muted">{t(metric.label)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="site-shell py-16 md:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-market">{t("Parcours")}</p>
            <h2 className="mt-4 text-3xl font-black leading-tight text-balance md:text-5xl">
              {t("De l'inscription au certificat, le chemin reste lisible.")}
            </h2>
          </div>
          <p className="text-base leading-8 text-muted">
            {t("Votre parcours se construit en quatre étapes simples. Les modalités d'accès sont confirmées avec votre interlocuteur avant l'ouverture de votre espace.")}
          </p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-4">
          {workflow.map((item, index) => (
            <article className="min-h-48 rounded-lg border border-line bg-surface p-5" key={item.title}>
              <span className="font-mono text-xs font-black text-amber">0{index + 1}</span>
              <h3 className="mt-5 text-xl font-black leading-tight">{t(item.title)}</h3>
              <p className="mt-4 text-sm leading-7 text-muted">{t(item.text)}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="site-shell py-16 md:py-24">
        <div className="mb-10 max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-amber">{t("Ce qui compte")}</p>
          <h2 className="mt-4 text-3xl font-black leading-tight md:text-5xl">
            {t("Un parcours clair, du premier pas au certificat.")}
          </h2>
          <p className="mt-5 text-base leading-8 text-muted">
            {t("Les informations importantes restent accessibles : votre demande, vos contenus, votre progression et votre certificat.")}
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-4">
          {highlights.map((item) => (
            <article className="rounded-lg border border-line bg-surface p-5" key={item.title}>
              <item.icon className="h-5 w-5 text-cyan" aria-hidden="true" />
              <h3 className="mt-5 text-xl font-black">{t(item.title)}</h3>
              <p className="mt-3 text-sm leading-7 text-muted">{t(item.text)}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-line bg-background-soft py-16 md:py-20">
        <div className="site-shell grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <MessageCircle className="h-5 w-5 text-market" aria-hidden="true" />
            <h2 className="mt-4 text-3xl font-black leading-tight md:text-5xl">{t("Pret a commencer ?")}</h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-muted">
              {t("Créez votre compte, confirmez votre adresse email, puis accédez à votre espace pour poursuivre votre parcours.")}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
            <ButtonLink href={localePath(locale, "/register")} className="w-full" showArrow>
              {t("Créez votre compte")}
            </ButtonLink>
            <ButtonLink href={localePath(locale, "/login")} className="w-full" variant="secondary">
              {t("Se connecter")}
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
