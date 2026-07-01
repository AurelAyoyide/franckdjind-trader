"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="mx-auto grid min-h-[60vh] max-w-2xl place-items-center px-4 py-20 text-center">
      <div className="rounded-lg border border-line bg-surface p-6 shadow-xl shadow-black/10">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-market">Erreur temporaire</p>
        <h1 className="mt-3 text-3xl font-black text-foreground">Une action n&apos;a pas pu aboutir</h1>
        <p className="mt-4 text-sm leading-7 text-muted">
          La page a rencontre un probleme pendant le chargement. Reessayez dans un instant. Si le probleme revient,
          transmettez le code ci-dessous a l&apos;administrateur.
        </p>
        {error.digest ? <p className="mt-4 rounded-md bg-background px-3 py-2 font-mono text-xs text-muted">Code: {error.digest}</p> : null}
        <button className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg bg-market px-5 text-sm font-black text-on-market" onClick={reset} type="button">
          Reessayer
        </button>
      </div>
    </section>
  );
}
