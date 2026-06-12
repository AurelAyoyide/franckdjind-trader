import type { Metadata } from "next";
import { Mail, MessageCircle, Send } from "lucide-react";
import { submitContactAction } from "@/app/contact/actions";
import { PageHero } from "@/components/page-hero";
import { ButtonLink } from "@/components/ui/button-link";
import { siteConfig } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Contact",
  description:
    "Contacter le trader-formateur pour une formation, une question ou une demande d'accompagnement.",
  path: "/contact"
});

type ContactPageProps = {
  searchParams: Promise<{
    status?: string;
  }>;
};

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const { status } = await searchParams;

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Une question, un besoin de cadre, une formation a clarifier."
        description="Le formulaire est pense pour aller droit au sujet : niveau actuel, objectif, blocage principal."
      />
      <section className="site-shell grid gap-8 py-12 md:grid-cols-[1fr_0.8fr] md:py-16">
        <form action={submitContactAction} className="rounded-lg border border-line bg-surface p-5 md:p-6">
          {status === "sent" ? (
            <p className="mb-5 rounded-md border border-market/30 bg-market/10 px-3 py-2 text-sm font-semibold text-market">
              Message envoye. Une reponse sera faite via les coordonnees indiquees.
            </p>
          ) : null}
          {status === "invalid" ? (
            <p className="mb-5 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm font-semibold text-danger">
              Merci de verifier les champs du formulaire.
            </p>
          ) : null}
          {status === "limited" ? (
            <p className="mb-5 rounded-md border border-amber/30 bg-amber/10 px-3 py-2 text-sm font-semibold text-amber">
              Trop de messages envoyes recemment. Reessaie un peu plus tard.
            </p>
          ) : null}
          <input autoComplete="off" className="hidden" name="website" tabIndex={-1} />
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold text-muted">
              Nom
              <input className="min-h-12 rounded-md border border-line bg-background px-4 text-foreground outline-none transition focus:border-market" name="name" required />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-muted">
              Email
              <input className="min-h-12 rounded-md border border-line bg-background px-4 text-foreground outline-none transition focus:border-market" name="email" required type="email" />
            </label>
          </div>
          <label className="mt-4 grid gap-2 text-sm font-semibold text-muted">
            Sujet
            <select className="min-h-12 rounded-md border border-line bg-background px-4 text-foreground outline-none transition focus:border-market" name="subject" required>
              <option>Formation</option>
              <option>Accompagnement</option>
              <option>Partenariat</option>
              <option>Autre demande</option>
            </select>
          </label>
          <label className="mt-4 grid gap-2 text-sm font-semibold text-muted">
            Message
            <textarea className="min-h-40 rounded-md border border-line bg-background px-4 py-3 text-foreground outline-none transition focus:border-market" minLength={10} name="message" required />
          </label>
          <button className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-market px-5 text-sm font-black text-on-market transition hover:bg-market-strong" type="submit">
            <Send className="h-4 w-4" aria-hidden="true" />
            Envoyer
          </button>
        </form>

        <aside className="grid gap-4 self-start">
          <div className="rounded-lg border border-line bg-surface p-5">
            <MessageCircle className="h-5 w-5 text-market" aria-hidden="true" />
            <h2 className="mt-4 text-xl font-black">Canaux rapides</h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              Pour une question courte, WhatsApp ou Telegram peuvent etre plus rapides que le formulaire.
            </p>
            <div className="mt-5 grid gap-3">
              <ButtonLink href={siteConfig.whatsappPath}>WhatsApp</ButtonLink>
              <ButtonLink href={siteConfig.telegramPath} variant="secondary">
                Telegram
              </ButtonLink>
            </div>
          </div>
          <div className="rounded-lg border border-line bg-background-soft p-5">
            <Mail className="h-5 w-5 text-cyan" aria-hidden="true" />
            <h2 className="mt-4 text-xl font-black">Email</h2>
            <a className="mt-3 block text-sm leading-7 text-muted underline-offset-4 hover:text-foreground hover:underline" href={`mailto:${siteConfig.email}`}>
              {siteConfig.email}
            </a>
          </div>
        </aside>
      </section>
    </>
  );
}
