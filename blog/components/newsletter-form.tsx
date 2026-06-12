import { subscribeNewsletterAction } from "@/app/newsletter/actions";

export function NewsletterForm({ status }: { status?: string }) {
  return (
    <section id="newsletter" className="site-shell pb-16 md:pb-24">
      <div className="rounded-lg border border-line bg-surface p-6 md:p-8">
        <div className="grid gap-6 md:grid-cols-[0.8fr_1.2fr] md:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-market">
              Newsletter
            </p>
            <h2 className="mt-4 text-3xl font-black leading-tight text-balance">
              Recevoir les prochains contenus utiles.
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Collecte simple des emails pour une future newsletter. Aucun envoi automatique n&apos;est branche pour l&apos;instant.
            </p>
          </div>
          <form action={subscribeNewsletterAction} className="grid gap-3">
            {status === "sent" ? (
              <p className="rounded-md border border-market/30 bg-market/10 px-3 py-2 text-sm font-semibold text-market">
                Inscription enregistree.
              </p>
            ) : null}
            {status === "invalid" ? (
              <p className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm font-semibold text-danger">
                Merci de verifier l&apos;email et le consentement.
              </p>
            ) : null}
            <div className="grid gap-3 sm:grid-cols-2">
              <input className="min-h-12 rounded-md border border-line bg-background px-4 text-foreground outline-none focus:border-market" name="name" placeholder="Nom optionnel" />
              <input className="min-h-12 rounded-md border border-line bg-background px-4 text-foreground outline-none focus:border-market" name="email" placeholder="Email" required type="email" />
            </div>
            <label className="flex gap-3 text-xs leading-6 text-muted">
              <input className="mt-1 h-4 w-4 accent-market" name="consent" required type="checkbox" />
              J&apos;accepte que mon email soit conserve pour recevoir de futurs contenus.
            </label>
            <button className="min-h-12 cursor-pointer rounded-md bg-market px-5 text-sm font-black text-on-market transition hover:bg-market-strong" type="submit">
              S&apos;inscrire
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
