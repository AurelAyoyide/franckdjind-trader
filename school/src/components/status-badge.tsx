import { Archive, CheckCircle2, Clock, Edit3, Tag, XCircle } from "lucide-react";
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

const getIconKeyForText = (text: string) => {
  const norm = text.toUpperCase();
  if (norm === "PUBLISHED" || norm === "ACTIVE" || norm === "APPROVED" || norm === "VALIDE" || norm === "ACQUIS VERIFIES") return "success";
  if (norm === "PENDING" || norm === "IN PROGRESS") return "clock";
  if (norm === "DRAFT") return "draft";
  if (norm === "ARCHIVED") return "archive";
  if (norm === "REJECTED" || norm === "SUSPENDED" || norm === "DELETED" || norm === "REVOQUE") return "danger";
  if (norm === "FREE" || norm === "GRATUITE" || norm === "PAID" || norm === "PAYANTE") return "tag";
  return null;
};

export function StatusBadge({ children, tone = "muted" }: StatusBadgeProps) {
  const iconKey = typeof children === "string" ? getIconKeyForText(children) : null;

  return (
    <span
      className={cn(
        "inline-flex gap-1.5 min-h-7 items-center rounded-lg border px-2.5 py-0.5 text-[11px] font-black uppercase tracking-[0.16em]",
        tones[tone],
      )}
    >
      {iconKey === "success" ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
      {iconKey === "clock" ? <Clock className="h-3.5 w-3.5" /> : null}
      {iconKey === "draft" ? <Edit3 className="h-3.5 w-3.5" /> : null}
      {iconKey === "archive" ? <Archive className="h-3.5 w-3.5" /> : null}
      {iconKey === "danger" ? <XCircle className="h-3.5 w-3.5" /> : null}
      {iconKey === "tag" ? <Tag className="h-3.5 w-3.5" /> : null}
      <span>{children}</span>
    </span>
  );
}
