import { Moon, Sun } from "lucide-react";

export function ThemeToggle({ label }: { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      data-theme-toggle
      title={label}
      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-foreground/[0.06] text-foreground transition hover:bg-foreground/[0.1]"
    >
      <Moon className="theme-icon-moon h-4 w-4" aria-hidden="true" />
      <Sun className="theme-icon-sun h-4 w-4" aria-hidden="true" />
    </button>
  );
}
