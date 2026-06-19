import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  children: React.ReactNode;
  tone?: "market" | "cyan" | "amber" | "danger" | "muted";
};

const tones = {
  market: "border-market/30 bg-market/10 text-market",
  cyan: "border-cyan/30 bg-cyan/10 text-cyan",
  amber: "border-amber/30 bg-amber/10 text-amber",
  danger: "border-danger/30 bg-danger/10 text-danger",
  muted: "border-line bg-foreground/[0.05] text-muted",
};

export function StatusBadge({ children, tone = "muted" }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center rounded-lg border px-2.5 text-[11px] font-black uppercase tracking-[0.16em]",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}
