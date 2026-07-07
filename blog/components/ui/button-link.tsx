import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type ButtonLinkProps = ComponentPropsWithoutRef<typeof Link> & {
  variant?: "primary" | "secondary" | "ghost" | "hero";
  showArrow?: boolean;
};

const variants = {
  primary:
    "bg-market text-on-market shadow-market hover:bg-market-strong",
  secondary:
    "border border-line bg-foreground/[0.06] text-foreground hover:border-line-strong hover:bg-foreground/[0.1]",
  ghost:
    "text-muted hover:bg-foreground/[0.06] hover:text-foreground",
  hero: "hero-action-secondary"
};

export function ButtonLink({
  className,
  children,
  href,
  as,
  legacyBehavior,
  locale,
  passHref,
  prefetch,
  replace,
  scroll,
  shallow,
  variant = "primary",
  showArrow = false,
  ...props
}: ButtonLinkProps) {
  const buttonClassName = cn(
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition active:scale-[0.98]",
    variants[variant],
    className
  );
  const content = (
    <>
      <span className="inline-flex items-center justify-center gap-2">{children}</span>
      {showArrow ? <ArrowRight className="h-4 w-4" aria-hidden="true" /> : null}
    </>
  );

  if (typeof href === "string" && href.startsWith("/go/")) {
    return (
      <a className={buttonClassName} href={href} {...props}>
        {content}
      </a>
    );
  }

  return (
    <Link
      as={as}
      className={buttonClassName}
      href={href}
      legacyBehavior={legacyBehavior}
      locale={locale}
      passHref={passHref}
      prefetch={prefetch}
      replace={replace}
      scroll={scroll}
      shallow={shallow}
      {...props}
    >
      {content}
    </Link>
  );
}
