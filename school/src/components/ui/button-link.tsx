import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type ButtonLinkProps = ComponentPropsWithoutRef<typeof Link> & {
  variant?: "primary" | "secondary" | "ghost" | "hero";
  showArrow?: boolean;
};

const variants = {
  primary: "bg-market text-on-market shadow-market hover:bg-market-strong",
  secondary:
    "border border-line bg-foreground/[0.06] text-foreground hover:border-line-strong hover:bg-foreground/[0.1]",
  ghost: "text-muted hover:bg-foreground/[0.06] hover:text-foreground",
  hero: "hero-action-secondary",
};

export function ButtonLink({
  className,
  children,
  variant = "primary",
  showArrow = false,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition active:scale-[0.98]",
        variants[variant],
        className,
      )}
      {...props}
    >
      <span className="inline-flex items-center justify-center gap-2">{children}</span>
      {showArrow ? <ArrowRight className="h-4 w-4" aria-hidden="true" /> : null}
    </Link>
  );
}
