"use client";

import { Eye, EyeOff } from "lucide-react";
import { useId, useState } from "react";
import { useTranslate } from "@/components/locale-provider";
import { cn } from "@/lib/utils";

type PasswordFieldProps = {
  id?: string;
  name: string;
  label: string;
  placeholder?: string;
  error?: string;
  autoComplete?: string;
  className?: string;
};

export function PasswordField({
  id,
  name,
  label,
  placeholder,
  error,
  autoComplete,
  className,
}: PasswordFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [visible, setVisible] = useState(false);
  const t = useTranslate();

  return (
    <div className={className}>
      <label className="block text-sm font-black" htmlFor={inputId}>
        {t(label)}
      </label>
      <div className="mt-2 flex min-h-12 overflow-hidden rounded-lg border border-line bg-background transition focus-within:border-market">
        <input
          autoComplete={autoComplete}
          className="min-w-0 flex-1 bg-transparent px-4 text-sm outline-none"
          id={inputId}
          name={name}
          placeholder={placeholder ? t(placeholder) : undefined}
          type={visible ? "text" : "password"}
        />
        <button
          aria-label={t(visible ? "Masquer le mot de passe" : "Afficher le mot de passe")}
          className={cn(
            "inline-flex w-12 items-center justify-center border-l border-line text-muted transition hover:bg-foreground/[0.06] hover:text-foreground",
          )}
          onClick={() => setVisible((value) => !value)}
          title={t(visible ? "Masquer" : "Afficher")}
          type="button"
        >
          {visible ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
        </button>
      </div>
      {error ? <p className="mt-2 text-xs font-semibold text-danger">{error}</p> : null}
    </div>
  );
}
