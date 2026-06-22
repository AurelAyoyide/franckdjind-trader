export default function Loading() {
  return (
    <section aria-busy="true" aria-live="polite" className="site-shell py-10 md:py-16">
      <span className="sr-only">Chargement de la page…</span>
      <div className="animate-pulse space-y-7">
        <div className="h-4 w-28 rounded bg-foreground/10" />
        <div className="h-12 max-w-2xl rounded bg-foreground/10 md:h-16" />
        <div className="h-5 max-w-3xl rounded bg-foreground/10" />
        <div className="grid gap-5 pt-6 md:grid-cols-3">
          {["first", "second", "third"].map((item) => (
            <div className="h-56 rounded-lg border border-line bg-surface" key={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
