"use client";

import { useEffect, useState } from "react";
import { formatUploadLimit, maxImageUploadBytes } from "@/lib/upload-limits";

function restoreSubmitControls(form: HTMLFormElement) {
  delete form.dataset.submitting;
  form.removeAttribute("aria-busy");
  form.querySelectorAll<HTMLButtonElement | HTMLInputElement>('button[type="submit"], input[type="submit"]').forEach((control) => {
    control.disabled = false;
    control.removeAttribute("aria-disabled");
  });
}

function firstOversizedFile(form: HTMLFormElement) {
  const fileInputs = Array.from(form.querySelectorAll<HTMLInputElement>('input[type="file"]'));

  for (const input of fileInputs) {
    const file = Array.from(input.files ?? []).find((candidate) => candidate.size > maxImageUploadBytes);
    if (file) {
      return { file, input };
    }
  }

  return null;
}

export function FormSubmissionGuard() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    const handleSubmit = (event: SubmitEvent) => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement)) {
        return;
      }

      const oversized = firstOversizedFile(form);
      if (oversized) {
        event.preventDefault();
        restoreSubmitControls(form);
        setMessage(`"${oversized.file.name}" est trop lourd. Choisis une image de ${formatUploadLimit()} maximum, puis reessaie.`);
        oversized.input.focus();
        return;
      }

      if (form.dataset.submitting === "true") {
        event.preventDefault();
        return;
      }

      form.dataset.submitting = "true";
      form.setAttribute("aria-busy", "true");
      form.querySelectorAll<HTMLButtonElement | HTMLInputElement>('button[type="submit"], input[type="submit"]').forEach((control) => {
        control.disabled = true;
        control.setAttribute("aria-disabled", "true");
      });
    };

    document.addEventListener("submit", handleSubmit, true);
    return () => document.removeEventListener("submit", handleSubmit, true);
  }, []);

  if (!message) {
    return null;
  }

  return (
    <div className="fixed inset-x-4 top-4 z-[100] mx-auto max-w-xl rounded-lg border border-danger/30 bg-surface p-4 text-sm shadow-2xl shadow-black/20">
      <p className="font-black text-foreground">Fichier trop lourd</p>
      <p className="mt-1 leading-6 text-muted">{message}</p>
      <div className="mt-3 flex justify-end">
        <button
          className="inline-flex min-h-10 items-center justify-center rounded-md bg-market px-4 text-sm font-black text-on-market"
          onClick={() => setMessage("")}
          type="button"
        >
          Compris
        </button>
      </div>
    </div>
  );
}
