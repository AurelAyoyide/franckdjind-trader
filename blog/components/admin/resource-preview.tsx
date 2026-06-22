/* eslint-disable @next/next/no-img-element -- Admin preview accepts server-validated partner visual URLs. */
"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Eye } from "lucide-react";

type PreviewValues = Record<string, string>;

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 120);
}

function textFromHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function escapeAttribute(value: string) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function pagePreviewDocument({ title, excerpt, content, image, label, theme }: { title: string; excerpt: string; content: string; image?: string; label: string; theme: "light" | "dark" }) {
  const colors = theme === "dark"
    ? { background: "#0d1511", foreground: "#eef7f1", muted: "#a6bbb0", surface: "#15211b", line: "#2b3b33", soft: "#101b15" }
    : { background: "#f7faf8", foreground: "#15211b", muted: "#587066", surface: "#ffffff", line: "#d8e1dc", soft: "#edf3ef" };
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8" /><style>body{margin:0;background:${colors.background};color:${colors.foreground};font-family:Arial,Helvetica,sans-serif}.wrap{max-width:760px;margin:auto;padding:28px}.eyebrow{color:#17c985;font-weight:800;font-size:11px;letter-spacing:1.4px;text-transform:uppercase}.hero{margin:18px 0;border:1px solid ${colors.line};border-radius:12px;overflow:hidden;aspect-ratio:16/8;background:${colors.soft}}.hero img{width:100%;height:100%;object-fit:cover;display:block}h1{font-size:34px;line-height:1.08;margin:10px 0 14px}p{line-height:1.7;color:${colors.muted}}.content{margin-top:28px;background:${colors.surface};border:1px solid ${colors.line};border-radius:12px;padding:24px;color:${colors.foreground};line-height:1.75}.content p{color:${colors.foreground}}.content img{max-width:100%;height:auto;border-radius:8px}.content h2{font-size:24px}.content a{color:#17c985;font-weight:700}</style></head><body><main class="wrap"><div class="eyebrow">${escapeAttribute(label)}</div><h1>${escapeAttribute(title)}</h1><p>${escapeAttribute(excerpt)}</p>${image ? `<div class="hero"><img src="${escapeAttribute(image)}" alt="" /></div>` : ""}<article class="content">${content || "<p>Le contenu de la page apparaîtra ici.</p>"}</article></main></body></html>`;
}

function PreviewContent({ resource, values, theme }: { resource: string; values: PreviewValues; theme: "light" | "dark" }) {
  const title = values.title || values.label || values.name || "Titre de l’élément";
  const description = values.description || textFromHtml(values.content || "") || "Le texte de présentation apparaîtra ici.";
  const slug = slugify(title) || "adresse-generee";

  if (resource === "posts" || resource === "pages") {
    const excerpt = resource === "posts" ? textFromHtml(values.content || "").slice(0, 240) || "L’extrait sera généré depuis le contenu." : values.excerpt || textFromHtml(values.content || "").slice(0, 240);
    const image = resource === "posts" ? values.image : undefined;
    return (
      <div className="overflow-hidden rounded-lg border border-line bg-background">
        <div className="border-b border-line px-4 py-3 text-xs font-semibold text-muted-strong">Aperçu de la page publique — mise en page WYSIWYG</div>
        <iframe className="h-[520px] w-full bg-background" sandbox="" srcDoc={pagePreviewDocument({ title, excerpt, content: values.content || "", image, label: resource === "posts" ? values.categorySlug || "Article" : "Page", theme })} title="Aperçu de la page publique" />
      </div>
    );
  }

  if (resource === "links") {
    const color = /^#[0-9a-f]{6}$/i.test(values.brandColor) ? values.brandColor : "#17c985";
    return (
      <div className="rounded-lg border border-line bg-background p-4" style={{ borderTop: `4px solid ${color}` }}>
        {values.imageUrl ? <img alt="Aperçu de la bannière partenaire" className="mb-4 aspect-[16/6] w-full rounded-md border border-line object-cover" src={values.imageUrl} /> : null}
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-strong">Aperçu partenaire</p>
        <h3 className="mt-2 text-lg font-black">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-muted">{values.description || "L’accroche de ce partenaire apparaîtra ici."}</p>
        <span className="mt-4 inline-flex items-center gap-2 text-sm font-black" style={{ color }}>{values.ctaLabel || "Voir l’offre"}<ExternalLink className="h-4 w-4" /></span>
      </div>
    );
  }

  if (resource === "redirects") {
    return <p className="rounded-lg border border-line bg-background p-4 text-sm leading-7 text-muted"><strong className="text-foreground">{values.source || "/ancienne-adresse"}</strong> redirigera automatiquement vers <strong className="text-foreground">{values.destination || "/nouvelle-adresse"}</strong>.</p>;
  }

  if (resource === "services") {
    const price = values.priceMode === "ON_REQUEST" ? "Sur demande" : values.priceMode === "FREE" ? "Gratuit" : values.priceAmount ? `${values.priceAmount} ${values.currency || "XOF"}` : "Prix à définir";
    return <div className="rounded-lg border border-line bg-background p-5"><p className="text-xs font-black uppercase tracking-[0.2em] text-market">Formation</p><h3 className="mt-3 text-xl font-black">{title}</h3><p className="mt-2 text-sm leading-7 text-muted">{description}</p><div className="mt-4 flex items-center justify-between gap-4"><span className="font-black">{price}</span><span className="rounded-md bg-market px-3 py-2 text-xs font-black text-on-market">{values.ctaLabel || "En savoir plus"}</span></div></div>;
  }

  const path = resource === "posts" ? `/blog/${slug}` : resource === "categories" ? `/categorie/${slug}` : resource === "tags" ? `/tag/${slug}` : `/${slug}`;
  return <div className="rounded-lg border border-line bg-background p-5"><p className="text-xs font-black uppercase tracking-[0.2em] text-market">Aperçu public</p><h3 className="mt-3 text-xl font-black text-balance">{title}</h3><p className="mt-2 text-sm leading-7 text-muted">{resource === "posts" ? textFromHtml(values.content || "") || "L’extrait sera généré depuis le contenu." : description}</p><p className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-muted-strong"><ExternalLink className="h-3.5 w-3.5" />{path}</p></div>;
}

export function ResourcePreview({ formId, resource }: { formId: string; resource: string }) {
  const [values, setValues] = useState<PreviewValues>({});
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const updateTheme = () => setTheme(document.documentElement.dataset.theme === "light" ? "light" : "dark");
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const form = document.getElementById(formId);
    if (!(form instanceof HTMLFormElement)) return;

    const refresh = () => {
      const next: PreviewValues = {};
      new FormData(form).forEach((value, key) => {
        if (typeof value === "string") next[key] = value;
      });
      setValues(next);
    };

    refresh();
    form.addEventListener("input", refresh);
    form.addEventListener("change", refresh);
    return () => {
      form.removeEventListener("input", refresh);
      form.removeEventListener("change", refresh);
    };
  }, [formId]);

  return (
    <section className="rounded-lg border border-line bg-surface-strong p-4" aria-label="Aperçu avant publication">
      <div className="mb-4 flex items-center gap-2 text-sm font-black"><Eye className="h-4 w-4 text-market" aria-hidden="true" />Aperçu avant enregistrement</div>
      <PreviewContent resource={resource} theme={theme} values={values} />
    </section>
  );
}
