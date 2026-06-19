import { formatPercent } from "@/lib/utils";

export function ProgressBar({ value }: { value: number }) {
  const bounded = Math.max(0, Math.min(100, value));

  return (
    <div>
      <div className="flex items-center justify-between text-xs font-bold text-muted">
        <span>Progression</span>
        <span className="font-mono text-foreground">{formatPercent(bounded)}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-lg bg-foreground/[0.08]">
        <div className="h-full rounded-lg bg-market" style={{ width: `${bounded}%` }} />
      </div>
    </div>
  );
}
