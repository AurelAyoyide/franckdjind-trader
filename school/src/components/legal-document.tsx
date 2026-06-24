import Link from "next/link";
import type { ReactNode } from "react";
import type { Locale } from "@/lib/i18n";
import { localePath } from "@/lib/i18n";

export type LegalDetails = {
  platformName: string;
  whatsappNumber: string;
  legalPublisherName: string;
  legalContactEmail: string;
  legalAddress: string;
  legalRegistrationNumber: string;
  hostingProvider: string;
};

type LegalDocumentProps = {
  eyebrow: string;
  title: string;
  description: string;
  updatedAt?: string;
  children: ReactNode;
};

export function LegalDocument({ eyebrow, title, description, updatedAt = "Derniere mise a jour : 23 juin 2026", children }: LegalDocumentProps) {
  return (
    <>
      <section className="border-b border-line bg-background-soft">
        <div className="site-shell py-14 md:py-20">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-market">{eyebrow}</p>
          <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight tracking-tight text-balance md:text-6xl">
            {title}
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-muted md:text-lg">{description}</p>
        </div>
      </section>
      <section className="site-shell py-12 md:py-16">
        <article className="mx-auto max-w-4xl rounded-lg border border-line bg-surface p-6 md:p-8">
          <p className="border-b border-line pb-5 text-sm font-semibold text-muted">
            {updatedAt}
          </p>
          <div className="mt-8 grid gap-9 text-sm leading-8 text-muted">{children}</div>
        </article>
      </section>
    </>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-black leading-tight text-foreground">{title}</h2>
      <div className="mt-3 grid gap-3">{children}</div>
    </section>
  );
}

export function LegalList({ children }: { children: ReactNode }) {
  return <ul className="grid list-disc gap-2 pl-5 marker:text-market">{children}</ul>;
}

export function LegalContact({ details, locale = "fr" }: { details: LegalDetails; locale?: Locale }) {
  const whatsappHref = `https://wa.me/${details.whatsappNumber}`;

  if (locale === "en") {
    return (
      <p>
        For questions about these documents or your personal data, contact the publisher
        {details.legalContactEmail ? (
          <>
            {" "}by email at{" "}
            <a className="font-black text-market underline decoration-market underline-offset-4" href={`mailto:${details.legalContactEmail}`}>
              {details.legalContactEmail}
            </a>
          </>
        ) : (
          <>
            {" "}through the official{" "}
            <a
              className="font-black text-market underline decoration-market underline-offset-4"
              href={whatsappHref}
              rel="noreferrer"
              target="_blank"
            >
              WhatsApp channel
            </a>
          </>
        )}
        . You can also read the{" "}
        <Link className="font-black text-market underline decoration-market underline-offset-4" href={localePath(locale, "/terms")}>
          terms of use
        </Link>{" "}
        and the{" "}
        <Link className="font-black text-market underline decoration-market underline-offset-4" href={localePath(locale, "/privacy-policy")}>
          privacy policy
        </Link>
        .
      </p>
    );
  }

  return (
    <p>
      Pour toute question relative a ces documents ou a vos donnees, contactez l&apos;editeur
      {details.legalContactEmail ? (
        <>
          {" "}par email a{" "}
          <a className="font-black text-market underline decoration-market underline-offset-4" href={`mailto:${details.legalContactEmail}`}>
            {details.legalContactEmail}
          </a>
        </>
      ) : (
        <>
          {" "}via le canal{" "}
          <a
            className="font-black text-market underline decoration-market underline-offset-4"
            href={whatsappHref}
            rel="noreferrer"
            target="_blank"
          >
            WhatsApp officiel
          </a>
        </>
      )}
      . Vous pouvez egalement consulter les{" "}
      <Link className="font-black text-market underline decoration-market underline-offset-4" href="/terms">
        conditions d&apos;utilisation
      </Link>{" "}
      et la{" "}
      <Link className="font-black text-market underline decoration-market underline-offset-4" href="/privacy-policy">
        politique de confidentialite
      </Link>
      .
    </p>
  );
}
