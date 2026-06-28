"use client";

import { Moon, Sun } from "lucide-react";
import { useTranslate } from "@/components/locale-provider";
import { useTheme } from "@/components/theme-provider";

export function ThemeToggle() {
  const { toggleTheme } = useTheme();
  const t = useTranslate();

  return (
    <button
      type="button"
      aria-label={t("Changer le thème")}
      title={t("Changer le thème")}
      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-foreground/[0.06] text-foreground transition hover:bg-foreground/[0.1]"
      onClick={toggleTheme}
    >
      <Moon className="theme-icon-moon h-4 w-4" aria-hidden="true" />
      <Sun className="theme-icon-sun h-4 w-4" aria-hidden="true" />
    </button>
  );
}
