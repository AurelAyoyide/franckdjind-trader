/* eslint-disable @next/next/no-img-element -- Partner visuals can be remote and are server-validated. */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ExternalLink, Image as ImageIcon, Sparkles } from "lucide-react";
import type { StoredActionLink } from "@/lib/data-store";

type AffiliateCarouselProps = {
  links: StoredActionLink[];
  title?: string;
  variant?: "inline" | "banner";
};

function normalizeColor(value: string | undefined) {
  return /^#[0-9a-fA-F]{6}$/.test(value ?? "") ? value! : "#17c985";
}

export function AffiliateCarousel({ links, title = "Opportunités partenaires", variant = "inline" }: AffiliateCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeLink = links[activeIndex];

  useEffect(() => {
    if (links.length < 2) return;
    const timer = window.setInterval(() => setActiveIndex((current) => (current + 1) % links.length), 10_000);
    return () => window.clearInterval(timer);
  }, [links.length]);

  if (!activeLink) return null;

  const color = normalizeColor(activeLink.brandColor);
  const move = (offset: number) => setActiveIndex((current) => (current + offset + links.length) % links.length);

  return (
    <section className={variant === "banner" ? "rounded-xl border border-line bg-background-soft p-4 md:p-5" : "rounded-lg border border-line bg-surface p-4 md:p-5"} aria-label={title}>
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.24em] text-market"><Sparkles className="h-4 w-4" aria-hidden="true" />Espace partenaire</p>
          <h2 className="mt-2 text-xl font-black">{title}</h2>
        </div>
        {links.length > 1 ? <p className="text-xs font-bold text-muted-strong" aria-live="polite">{activeIndex + 1} / {links.length}</p> : null}
      </div>

      <article className="relative overflow-hidden rounded-xl border border-line bg-surface" style={{ borderTop: `4px solid ${color}` }}>
        <div className="absolute inset-0 opacity-70" style={{ background: `radial-gradient(circle at 84% 14%, ${color}33, transparent 38%), linear-gradient(125deg, ${color}12, transparent 55%)` }} />
        <div className="relative grid min-h-64 gap-0 md:grid-cols-[minmax(0,1fr)_300px]">
          <div className="flex flex-col justify-center p-6 md:p-8">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-strong">{activeLink.type === "AFFILIATE" ? "Partenaire affilié" : "Partenaire"}</p>
            <h3 className="mt-3 max-w-xl text-2xl font-black leading-tight text-balance md:text-3xl">{activeLink.label}</h3>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">{activeLink.description || "Découvre cette offre partenaire et vérifie ses conditions avant toute décision."}</p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 text-sm font-black text-on-market transition hover:brightness-95" href={`/go/${activeLink.slug}`} style={{ backgroundColor: color }}>
                {activeLink.ctaLabel || "Découvrir l’offre"}<ExternalLink className="h-4 w-4" aria-hidden="true" />
              </Link>
              {links.length > 1 ? <div className="flex items-center gap-2"><button aria-label="Publicité précédente" className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-line bg-background/80 text-muted transition hover:text-foreground" onClick={() => move(-1)} type="button"><ChevronLeft className="h-4 w-4" /></button><button aria-label="Publicité suivante" className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-line bg-background/80 text-muted transition hover:text-foreground" onClick={() => move(1)} type="button"><ChevronRight className="h-4 w-4" /></button></div> : null}
            </div>
          </div>
          <div className="relative min-h-52 overflow-hidden border-t border-line bg-foreground/[0.04] md:min-h-full md:border-l md:border-t-0">
            {activeLink.imageUrl ? <img alt={`Visuel ${activeLink.label}`} className="absolute inset-0 h-full w-full object-cover" src={activeLink.imageUrl} /> : <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center" style={{ background: `linear-gradient(145deg, ${color}30, transparent)` }}><ImageIcon className="h-10 w-10" style={{ color }} aria-hidden="true" /><p className="max-w-48 text-sm font-bold text-muted">Ajoute un visuel dans l’administration pour transformer cette carte en bannière.</p></div>}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          </div>
        </div>
      </article>
    </section>
  );
}
