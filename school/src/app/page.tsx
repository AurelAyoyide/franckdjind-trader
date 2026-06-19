import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  CalendarDays,
  GraduationCap,
  LockKeyhole,
  MessageCircle,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { publicMetrics, siteConfig } from "@/lib/platform-content";

const workflow = [
  { title: "Creer ton compte", text: "Inscris-toi comme apprenant, puis valide ton email." },
  { title: "Demander l'acces", text: "Choisis la formation et envoie la demande au formateur." },
  { title: "Suivre les cours", text: "Avance dans les lecons, quiz, documents et annonces." },
  { title: "Recevoir le certificat", text: "Le certificat devient verifiable avec son code public." },
];

const privateSpaces = [
  {
    href: "/student/dashboard",
    icon: GraduationCap,
    title: "Apprenant",
    text: "Cours, progression, quiz, notifications et certificats.",
  },
  {
    href: "/trainer/dashboard",
    icon: UsersRound,
    title: "Formateur",
    text: "Demandes, attributions, contenus, appels et relances.",
  },
  {
    href: "/admin/dashboard",
    icon: ShieldCheck,
    title: "Admin",
    text: "Utilisateurs, parametres, audit et certificats.",
  },
];

const highlights = [
  {
    icon: LockKeyhole,
    title: "Acces controle",
    text: "Chaque formation reste visible seulement aux comptes autorises.",
  },
  {
    icon: BookOpen,
    title: "Parcours clair",
    text: "Les lecons, quiz et documents sont regroupes dans un espace simple.",
  },
  {
    icon: CalendarDays,
    title: "Suivi humain",
    text: "Le formateur garde la main sur les demandes, appels et messages.",
  },
  {
    icon: BadgeCheck,
    title: "Preuve verifiable",
    text: "Un code public permet de confirmer un certificat sans connexion.",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="relative isolate min-h-[82svh] overflow-hidden border-b border-line">
        <Image
          src={siteConfig.heroImage}
          alt=""
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 -z-20 object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(5,7,6,0.98)_0%,rgba(5,7,6,0.86)_44%,rgba(5,7,6,0.44)_78%,rgba(5,7,6,0.2)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/72 via-black/20 to-transparent" />

        <div className="site-shell relative flex min-h-[82svh] items-center py-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-3 rounded-lg border border-white/18 bg-black/55 px-3 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-white shadow-[0_18px_45px_rgba(0,0,0,0.25)]">
              <span className="h-2 w-2 rounded-full bg-market" />
              Espace prive de formation
            </div>
            <h1 className="mt-7 text-5xl font-black leading-[0.98] tracking-tight text-white text-balance sm:text-6xl lg:text-7xl">
              School
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/78 md:text-lg">
              Une plateforme privee pour rejoindre une formation, suivre sa progression et garder une preuve claire de fin de parcours.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/register" className="w-full sm:w-auto" showArrow>
                Creer un compte
              </ButtonLink>
              <ButtonLink href="/login" className="w-full sm:w-auto" variant="hero">
                Se connecter
              </ButtonLink>
              <ButtonLink href="/certificates/verify" className="w-full sm:w-auto" variant="hero">
                Verifier un certificat
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
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-muted">{metric.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="site-shell py-16 md:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-market">Parcours</p>
            <h2 className="mt-4 text-3xl font-black leading-tight text-balance md:text-5xl">
              De l&apos;inscription au certificat, le chemin reste lisible.
            </h2>
          </div>
          <p className="text-base leading-8 text-muted">
            La plateforme ne vend pas de paiement en ligne. Elle sert a creer le compte, demander un acces,
            suivre la formation et verifier la fin de parcours.
          </p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-4">
          {workflow.map((item, index) => (
            <article className="min-h-48 rounded-lg border border-line bg-surface p-5" key={item.title}>
              <span className="font-mono text-xs font-black text-amber">0{index + 1}</span>
              <h3 className="mt-5 text-xl font-black leading-tight">{item.title}</h3>
              <p className="mt-4 text-sm leading-7 text-muted">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-background-soft py-16 md:py-24">
        <div className="site-shell grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan">Espaces</p>
            <h2 className="mt-4 text-3xl font-black leading-tight md:text-5xl">
              Chaque role arrive directement sur ce dont il a besoin.
            </h2>
            <p className="mt-6 text-base leading-8 text-muted">
              Les espaces prives sont separes pour eviter les confusions entre apprenant, formateur et admin.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {privateSpaces.map((space) => (
              <Link
                className="group rounded-lg border border-line bg-surface p-5 transition hover:-translate-y-1 hover:border-line-strong"
                href={space.href}
                key={space.title}
              >
                <space.icon className="h-5 w-5 text-market" aria-hidden="true" />
                <h3 className="mt-6 text-xl font-black group-hover:text-market">{space.title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted">{space.text}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-market">
                  Ouvrir <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="site-shell py-16 md:py-24">
        <div className="mb-10 max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-amber">Ce qui compte</p>
          <h2 className="mt-4 text-3xl font-black leading-tight md:text-5xl">
            Moins de bruit, plus de suivi.
          </h2>
          <p className="mt-5 text-base leading-8 text-muted">
            Les actions importantes restent accessibles : entrer, demander un acces, progresser, recevoir les relances et verifier un certificat.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-4">
          {highlights.map((item) => (
            <article className="rounded-lg border border-line bg-surface p-5" key={item.title}>
              <item.icon className="h-5 w-5 text-cyan" aria-hidden="true" />
              <h3 className="mt-5 text-xl font-black">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-muted">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-line bg-background-soft py-16 md:py-20">
        <div className="site-shell grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <MessageCircle className="h-5 w-5 text-market" aria-hidden="true" />
            <h2 className="mt-4 text-3xl font-black leading-tight md:text-5xl">Pret a commencer ?</h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-muted">
              Cree ton compte apprenant, puis fais ta demande d&apos;acces. Si tu as deja un compte, connecte-toi directement.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
            <ButtonLink href="/register" className="w-full" showArrow>
              Creer un compte
            </ButtonLink>
            <ButtonLink href="/login" className="w-full" variant="secondary">
              Se connecter
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
