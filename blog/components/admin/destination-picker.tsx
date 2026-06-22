"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Link2, ListTree } from "lucide-react";

type Destination = { value: string; label: string };

export function DestinationPicker({ name, label, initialValue = "", destinations }: { name: string; label: string; initialValue?: string; destinations: Destination[] }) {
  const initiallyInternal = initialValue.startsWith("/");
  const [mode, setMode] = useState<"internal" | "external">(initiallyInternal ? "internal" : "external");
  const [internalValue, setInternalValue] = useState(initiallyInternal ? initialValue : destinations[0]?.value || "/contact");
  const [externalValue, setExternalValue] = useState(initiallyInternal ? "" : initialValue);
  const id = useId();
  const value = mode === "internal" ? internalValue : externalValue;
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    hiddenInputRef.current?.dispatchEvent(new Event("input", { bubbles: true }));
  }, [value]);

  return (
    <fieldset className="rounded-lg border border-line bg-background p-4">
      <legend className="px-1 text-sm font-black text-foreground">{label}</legend>
      <input name={name} ref={hiddenInputRef} type="hidden" value={value} />
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <button className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md border px-3 text-sm font-bold transition ${mode === "internal" ? "border-market bg-market/10 text-market" : "border-line bg-surface text-muted hover:text-foreground"}`} onClick={() => setMode("internal")} type="button"><ListTree className="h-4 w-4" />Page du site</button>
        <button className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md border px-3 text-sm font-bold transition ${mode === "external" ? "border-market bg-market/10 text-market" : "border-line bg-surface text-muted hover:text-foreground"}`} onClick={() => setMode("external")} type="button"><Link2 className="h-4 w-4" />URL externe</button>
      </div>
      {mode === "internal" ? (
        <div className="mt-4 grid gap-2"><label className="text-sm font-semibold text-muted" htmlFor={`${id}-internal`}>Destination interne</label><select className="min-h-12 rounded-md border border-line bg-surface px-4 text-foreground outline-none focus:border-market" id={`${id}-internal`} onChange={(event) => setInternalValue(event.target.value)} value={internalValue}>{destinations.map((destination) => <option key={destination.value} value={destination.value}>{destination.label}</option>)}</select></div>
      ) : (
        <div className="mt-4 grid gap-2"><label className="text-sm font-semibold text-muted" htmlFor={`${id}-external`}>Destination HTTPS</label><input className="min-h-12 rounded-md border border-line bg-surface px-4 text-foreground outline-none focus:border-market" id={`${id}-external`} onChange={(event) => setExternalValue(event.target.value)} placeholder="https://..." type="url" value={externalValue} /></div>
      )}
      <p className="mt-3 text-xs leading-5 text-muted-strong">Le lien est validé avant publication. Les URL externes doivent utiliser HTTPS.</p>
    </fieldset>
  );
}
