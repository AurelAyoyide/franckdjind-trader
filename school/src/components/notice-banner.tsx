import { cn } from "@/lib/utils";

type NoticeBannerProps = {
  message?: string | null;
  tone?: "success" | "info" | "warning" | "danger";
  className?: string;
};

const toneClasses = {
  success: "border-market/30 bg-market/10 text-market",
  info: "border-cyan/30 bg-cyan/10 text-cyan",
  warning: "border-amber/30 bg-amber/10 text-amber",
  danger: "border-danger/30 bg-danger/10 text-danger",
};

export function NoticeBanner({ message, tone = "success", className }: NoticeBannerProps) {
  if (!message) {
    return null;
  }

  return (
    <p className={cn("mb-5 rounded-lg border p-3 text-sm font-semibold", toneClasses[tone], className)}>
      {message}
    </p>
  );
}
