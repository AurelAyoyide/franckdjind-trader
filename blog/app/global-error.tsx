"use client";

import { useEffect } from "react";
import "./globals.css";

export default function GlobalError({
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
    <html lang="fr">
      <head>
        <title>Erreur | Bono Trading</title>
      </head>
      <body>
        <main className="grid min-h-screen place-items-center bg-background px-4 py-16 text-center text-foreground">
          <section className="max-w-xl rounded-lg border border-line bg-surface p-6 shadow-2xl shadow-black/15">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-market">Erreur temporaire</p>
            <h1 className="mt-3 text-3xl font-black">Une action n&apos;a pas pu aboutir</h1>
            <p className="mt-4 text-sm leading-7 text-muted">
              Le site a rencontre un probleme pendant le chargement. Reessayez dans un instant. Si le probleme revient,
              envoyez le code ci-dessous a l&apos;administrateur.
            </p>
            {error.digest ? <p className="mt-4 rounded-md bg-background px-3 py-2 font-mono text-xs text-muted">Code: {error.digest}</p> : null}
            <button className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg bg-market px-5 text-sm font-black text-on-market" onClick={reset} type="button">
              Reessayer
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
