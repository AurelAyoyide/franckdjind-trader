type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageHero({ eyebrow, title, description }: PageHeroProps) {
  return (
    <section className="border-b border-line bg-background-soft">
      <div className="site-shell py-14 md:py-20">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-market">{eyebrow}</p>
        <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight tracking-tight text-balance md:text-6xl">
          {title}
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-8 text-muted md:text-lg">{description}</p>
      </div>
    </section>
  );
}
