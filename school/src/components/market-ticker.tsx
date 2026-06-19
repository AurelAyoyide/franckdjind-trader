const items = [
  { label: "Compte", value: "email valide", tone: "text-market" },
  { label: "Acces", value: "sur validation", tone: "text-cyan" },
  { label: "Cours", value: "progression suivie", tone: "text-amber" },
  { label: "Quiz", value: "acquis verifies", tone: "text-market" },
  { label: "Certificat", value: "code verifiable", tone: "text-cyan" },
];

export function MarketTicker() {
  const duplicated = [...items, ...items];

  return (
    <div className="hidden overflow-hidden border-b border-line bg-background/90 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-muted md:block">
      <div className="ticker-track flex w-max gap-10">
        {duplicated.map((item, index) => (
          <div className="flex items-center gap-3" key={`${item.label}-${index}`}>
            <span>{item.label}</span>
            <span className={`font-mono ${item.tone}`}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
