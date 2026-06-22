"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ImagePlus, Link2, LibraryBig, Upload } from "lucide-react";

type ImageOption = { url: string; title: string };
type ImageSourcePickerProps = {
  label: string;
  sourceName: string;
  fileName: string;
  initialValue?: string;
  media?: ImageOption[];
  allowLibrary?: boolean;
  allowDefault?: boolean;
};

type SourceMode = "library" | "upload" | "url";

export function ImageSourcePicker({
  label,
  sourceName,
  fileName,
  initialValue = "",
  media = [],
  allowLibrary = true,
  allowDefault = false
}: ImageSourcePickerProps) {
  const defaultImage = "/hero-trading-desk.png";
  const initialMode: SourceMode = allowLibrary && (media.some((item) => item.url === initialValue) || (allowDefault && initialValue === defaultImage)) ? "library" : initialValue ? "url" : allowLibrary && (allowDefault || media.length > 0) ? "library" : "upload";
  const [mode, setMode] = useState<SourceMode>(initialMode);
  const [selectedMedia, setSelectedMedia] = useState(initialMode === "library" ? initialValue || (allowDefault ? defaultImage : media[0]?.url || "") : "");
  const [externalUrl, setExternalUrl] = useState(initialMode === "url" ? initialValue : "");
  const id = useId();
  const value = mode === "library" ? selectedMedia : mode === "url" ? externalUrl : "";
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    hiddenInputRef.current?.dispatchEvent(new Event("input", { bubbles: true }));
  }, [mode, value]);

  return (
    <fieldset className="rounded-lg border border-line bg-background p-4">
      <legend className="px-1 text-sm font-black text-foreground">{label}</legend>
      <input name={sourceName} ref={hiddenInputRef} type="hidden" value={value} />
      <input name={`${sourceName}Mode`} type="hidden" value={mode} />
      <div className="mt-2 grid gap-2 sm:grid-cols-3">
        {allowLibrary ? <SourceButton active={mode === "library"} icon={<LibraryBig className="h-4 w-4" />} label="Médiathèque" onClick={() => setMode("library")} /> : null}
        <SourceButton active={mode === "upload"} icon={<Upload className="h-4 w-4" />} label="Importer" onClick={() => setMode("upload")} />
        <SourceButton active={mode === "url"} icon={<Link2 className="h-4 w-4" />} label="Lien externe" onClick={() => setMode("url")} />
      </div>

      {mode === "library" && allowLibrary ? (
        <div className="mt-4 grid gap-2">
          <label className="text-sm font-semibold text-muted" htmlFor={`${id}-library`}>Choisir une image déjà présente</label>
          <select className="min-h-12 rounded-md border border-line bg-surface px-4 text-foreground outline-none focus:border-market" id={`${id}-library`} onChange={(event) => setSelectedMedia(event.target.value)} value={selectedMedia}>
            {allowDefault ? <option value={defaultImage}>Image par défaut du site</option> : null}
            {media.map((item) => <option key={item.url} value={item.url}>{item.title}</option>)}
          </select>
        </div>
      ) : null}

      {mode === "upload" ? (
        <div className="mt-4 grid gap-2">
          <label className="text-sm font-semibold text-muted" htmlFor={`${id}-upload`}>Image depuis ton appareil</label>
          <input accept=".jpg,.jpeg,.png,.webp,.avif,image/jpeg,image/png,image/webp,image/avif" className="min-h-12 rounded-md border border-dashed border-line bg-surface px-4 py-3 text-foreground file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-market file:px-3 file:py-2 file:text-sm file:font-black file:text-on-market" id={`${id}-upload`} name={fileName} type="file" />
        </div>
      ) : null}

      {mode === "url" ? (
        <div className="mt-4 grid gap-2">
          <label className="text-sm font-semibold text-muted" htmlFor={`${id}-url`}>URL HTTPS de l&apos;image</label>
          <input className="min-h-12 rounded-md border border-line bg-surface px-4 text-foreground outline-none focus:border-market" id={`${id}-url`} onChange={(event) => setExternalUrl(event.target.value)} placeholder="https://..." type="url" value={externalUrl} />
        </div>
      ) : null}

      <p className="mt-3 inline-flex items-center gap-2 text-xs leading-5 text-muted-strong"><ImagePlus className="h-3.5 w-3.5 text-market" aria-hidden="true" />Une seule source est conservée à l&apos;enregistrement.</p>
    </fieldset>
  );
}

function SourceButton({ active, icon, label, onClick }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) {
  return <button className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md border px-3 text-sm font-bold transition ${active ? "border-market bg-market/10 text-market" : "border-line bg-surface text-muted hover:text-foreground"}`} onClick={onClick} type="button">{icon}{label}</button>;
}
