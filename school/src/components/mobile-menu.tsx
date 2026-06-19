"use client";

import Link from "next/link";
import { GraduationCap, Menu, X } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { ButtonLink } from "@/components/ui/button-link";

const navItems = [
  { href: "/", label: "Accueil" },
  { href: "/register", label: "Creer un compte" },
  { href: "/login", label: "Connexion" },
  { href: "/certificates/verify", label: "Verifier certificat" },
  { href: "/privacy-policy", label: "Confidentialite" },
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <button
          type="button"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-foreground/[0.06] text-foreground"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="absolute inset-x-4 top-[calc(100%+12px)] rounded-lg border border-line bg-background/96 p-3 shadow-2xl backdrop-blur-xl">
          <nav className="grid gap-1">
            {navItems.map((item) => (
              <Link
                className="rounded-md px-3 py-3 text-sm font-semibold text-muted transition hover:bg-foreground/[0.06] hover:text-foreground"
                href={item.href}
                key={item.href}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <ButtonLink href="/login" variant="secondary" className="w-full">
              Connexion
            </ButtonLink>
            <ButtonLink href="/register" className="w-full">
              <GraduationCap className="h-4 w-4" aria-hidden="true" />
              Compte
            </ButtonLink>
          </div>
        </div>
      ) : null}
    </div>
  );
}
