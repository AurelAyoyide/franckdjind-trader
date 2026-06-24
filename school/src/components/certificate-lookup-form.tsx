"use client";

import { useRouter } from "next/navigation";
import { BadgeCheck, Search } from "lucide-react";
import { useState } from "react";
import { useLocale, useTranslate } from "@/components/locale-provider";
import { localePath } from "@/lib/i18n";

export function CertificateLookupForm({ initialCode = "" }: { initialCode?: string }) {
  const router = useRouter();
  const [code, setCode] = useState(initialCode);
  const locale = useLocale();
  const t = useTranslate();

  return (
    <form
      className="rounded-lg border border-line bg-surface p-6"
      onSubmit={(event) => {
        event.preventDefault();
        const normalizedCode = code.trim().toUpperCase();
        if (normalizedCode) {
          router.push(localePath(locale, `/certificates/verify/${encodeURIComponent(normalizedCode)}`));
        }
      }}
    >
      <div className="flex items-center gap-3">
        <BadgeCheck className="h-5 w-5 text-market" aria-hidden="true" />
        <h2 className="text-2xl font-black">{t("Verifier un certificat")}</h2>
      </div>
      <p className="mt-3 text-sm leading-7 text-muted">
        {t("Entre le code present sur le certificat pour confirmer qu'il existe et qu'il n'a pas ete revoque.")}
      </p>
      <label className="mt-6 block text-sm font-black" htmlFor="certificateCode">
        {t("Code certificat")}
      </label>
      <div className="mt-2 flex min-h-12 overflow-hidden rounded-lg border border-line bg-background transition focus-within:border-market">
        <input
          className="min-w-0 flex-1 bg-transparent px-4 font-mono text-sm uppercase outline-none"
          id="certificateCode"
          name="code"
          onChange={(event) => setCode(event.target.value)}
          placeholder="SCH-2026-0001"
          value={code}
        />
        <button
          aria-label={t("Verifier le certificat")}
          className="inline-flex w-12 items-center justify-center border-l border-line text-market transition hover:bg-market/10"
          title={t("Verifier")}
          type="submit"
        >
          <Search className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </form>
  );
}
