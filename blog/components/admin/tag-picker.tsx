"use client";

import { useState } from "react";

type TagOption = { slug: string; title: string };

export function TagPicker({ name, options, selected = [] }: { name: string; options: TagOption[]; selected?: string[] }) {
  const [selectedTags, setSelectedTags] = useState<string[]>(selected);

  const toggle = (slug: string) => {
    setSelectedTags((current) => current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug]);
  };

  return (
    <fieldset className="rounded-lg border border-line bg-background p-4">
      <legend className="px-1 text-sm font-black text-foreground">Tags associés</legend>
      <p className="mt-1 text-xs leading-5 text-muted-strong">Choisis les tags de l&apos;article. La sélection est visible, sans le bleu du champ système.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {options.map((tag) => {
          const active = selectedTags.includes(tag.slug);
          return (
            <button
              aria-pressed={active}
              className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${active ? "border-market bg-market/15 text-market shadow-[0_0_0_1px_rgba(23,201,133,0.15)]" : "border-line bg-surface text-muted hover:border-market/50 hover:text-foreground"}`}
              key={tag.slug}
              onClick={() => toggle(tag.slug)}
              type="button"
            >
              {tag.title}
            </button>
          );
        })}
      </div>
      {selectedTags.map((slug) => <input key={slug} name={name} type="hidden" value={slug} />)}
    </fieldset>
  );
}
