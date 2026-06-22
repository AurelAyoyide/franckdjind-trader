import { marketPairs } from "@/lib/content";
import { cn } from "@/lib/utils";

export function MarketTicker() {
  const pairs = [...marketPairs, ...marketPairs];

  return (
    <div className="hidden overflow-hidden border-b border-line bg-background/90 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-muted md:block">
      <div className="ticker-track flex w-max gap-10">
        <div className="flex items-center gap-2 text-market">
          <span className="h-1.5 w-1.5 rounded-full bg-market" />
          <span>Forex et indices — repères indicatifs</span>
        </div>
        {pairs.map((pair, index) => (
          <div className="flex items-center gap-3" key={`${pair.name}-${index}`}>
            <span>{pair.name}</span>
            <span className="font-mono text-foreground/80">{pair.value}</span>
            <span
              className={cn(
                "font-mono",
                pair.change.startsWith("-") ? "text-danger" : "text-market"
              )}
            >
              {pair.change}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
