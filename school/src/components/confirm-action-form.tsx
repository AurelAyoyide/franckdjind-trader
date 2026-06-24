"use client";

import { useState } from "react";

export function ConfirmActionForm({ action, values, label, title, description, danger = true }: { action: (formData: FormData) => void | Promise<void>; values: Record<string, string>; label: string; title: string; description: string; danger?: boolean }) {
  const [open, setOpen] = useState(false);
  return <><button className={`inline-flex min-h-10 items-center rounded-lg border px-3 text-sm font-black ${danger ? "border-danger/30 bg-danger/10 text-danger" : "border-line bg-background"}`} onClick={() => setOpen(true)} type="button">{label}</button>{open ? <div className="fixed inset-0 z-[100] grid place-items-center bg-black/60 p-4" role="dialog" aria-modal="true"><div className="w-full max-w-md rounded-xl border border-line bg-surface p-6 shadow-2xl"><h2 className="text-xl font-black">{title}</h2><p className="mt-3 text-sm leading-7 text-muted">{description}</p><form action={action} className="mt-6 flex justify-end gap-3">{Object.entries(values).map(([name, value]) => <input key={name} name={name} type="hidden" value={value} />)}<button className="min-h-10 rounded-lg border border-line px-3 text-sm font-black" onClick={() => setOpen(false)} type="button">Annuler</button><button className="min-h-10 rounded-lg bg-danger px-3 text-sm font-black text-white" type="submit">Confirmer</button></form></div></div> : null}</>;
}
