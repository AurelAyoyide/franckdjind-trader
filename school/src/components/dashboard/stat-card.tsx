import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  tone?: "market" | "cyan" | "amber";
};

const toneClasses = {
  market: "text-market bg-market/10",
  cyan: "text-cyan bg-cyan/10",
  amber: "text-amber bg-amber/10",
};

export function StatCard({ label, value, detail, icon: Icon, tone = "market" }: StatCardProps) {
  return (
    <article className="rounded-lg border border-line bg-surface p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-muted">{label}</p>
          <p className="mt-3 font-mono text-3xl font-black">{value}</p>
        </div>
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${toneClasses[tone]}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-4 text-sm leading-6 text-muted">{detail}</p>
    </article>
  );
}
