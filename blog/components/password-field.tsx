"use client";

import { Eye, EyeOff } from "lucide-react";
import { useId, useState } from "react";

type PasswordFieldProps = {
  id?: string;
  name: string;
  required?: boolean;
  autoComplete?: string;
  placeholder?: string;
  defaultValue?: string;
  minLength?: number;
  className?: string;
};

export function PasswordField({
  id,
  name,
  required,
  autoComplete,
  placeholder,
  defaultValue,
  minLength,
  className
}: PasswordFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        autoComplete={autoComplete}
        className={className ?? "min-h-12 w-full rounded-md border border-line bg-background px-4 pr-12 text-foreground outline-none transition focus:border-market"}
        defaultValue={defaultValue}
        id={inputId}
        minLength={minLength}
        name={name}
        placeholder={placeholder}
        required={required}
        type={visible ? "text" : "password"}
      />
      <button
        aria-controls={inputId}
        aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        className="absolute inset-y-0 right-0 inline-flex w-12 items-center justify-center text-muted transition hover:text-foreground"
        onClick={() => setVisible((value) => !value)}
        type="button"
      >
        {visible ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
      </button>
    </div>
  );
}
