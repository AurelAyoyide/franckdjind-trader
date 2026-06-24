"use client";

import { MessageCircle } from "lucide-react";
import { useActionState, useState } from "react";
import { requestAccessAction, type AccessChoiceState } from "@/app/access-choice/actions";
import { useTranslate } from "@/components/locale-provider";

const initialState: AccessChoiceState = {
  ok: false,
  message: "",
};

export function AccessChoiceForm({
  account,
  courses,
}: {
  account: { name: string; email: string; phone: string };
  courses: { id: string; title: string; type: "FREE" | "PAID" }[];
}) {
  const [state, formAction, pending] = useActionState(requestAccessAction, initialState);
  const [kind, setKind] = useState<"free" | "paid">("free");
  const t = useTranslate();
  const matchingCourses = courses.filter((course) => course.type === (kind === "free" ? "FREE" : "PAID"));

  return (
    <form action={formAction} className="rounded-lg border border-line bg-surface p-6">
      <div className="grid gap-3 md:grid-cols-2">
        {[
          { value: "free", label: "Formation gratuite", text: "Demande simple a valider par le formateur." },
          { value: "paid", label: "Payee hors plateforme", text: "Paiement signale puis verifie manuellement." },
        ].map((choice) => (
          <label className="rounded-lg border border-line bg-foreground/[0.04] p-4" key={choice.value}>
            <input
              checked={kind === choice.value}
              className="mr-2 accent-[var(--market)]"
              name="kind"
              onChange={() => setKind(choice.value as "free" | "paid")}
              required
              type="radio"
              value={choice.value}
            />
            <span className="font-black">{t(choice.label)}</span>
            <span className="mt-2 block text-xs leading-6 text-muted">{t(choice.text)}</span>
          </label>
        ))}
      </div>
      {state.errors?.kind ? <p className="mt-2 text-xs font-semibold text-danger">{state.errors.kind[0]}</p> : null}

      {matchingCourses.length ? (
        <label className="mt-5 block text-sm font-black">
          Formation souhaitee <span className="font-medium text-muted">(facultatif)</span>
          <select className="mt-2 min-h-11 w-full rounded-lg border border-line bg-background px-3 text-sm" name="courseId">
            <option value="">Je laisse le formateur choisir</option>
            {matchingCourses.map((course) => (
              <option key={course.id} value={course.id}>{course.title}</option>
            ))}
          </select>
          <span className="mt-2 block text-xs font-medium text-muted">Seules les formations publiees correspondant a ta demande sont proposees.</span>
          {state.errors?.courseId ? <span className="mt-2 block text-xs text-danger">{state.errors.courseId[0]}</span> : null}
        </label>
      ) : null}

      <div className="mt-5 rounded-lg border border-line bg-foreground/[0.04] p-4">
        <p className="text-sm font-black">Coordonnees utilisees pour la demande</p>
        <div className="mt-3 grid gap-2 text-sm text-muted md:grid-cols-3">
          <p><span className="font-semibold text-foreground">{t("Nom complet")} :</span> {account.name}</p>
          <p><span className="font-semibold text-foreground">Email :</span> {account.email}</p>
          <p><span className="font-semibold text-foreground">WhatsApp :</span> {account.phone || "Non renseigne"}</p>
        </div>
        <p className="mt-3 text-xs leading-6 text-muted">Mets a jour ton profil avant la demande si une information est incorrecte.</p>
      </div>

      {state.message ? (
        <p
          className={`mt-5 rounded-lg border p-3 text-sm font-semibold ${state.ok ? "border-market/30 bg-market/10 text-market" : "border-danger/30 bg-danger/10 text-danger"
            }`}
        >
          {state.message}
        </p>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          className="inline-flex min-h-11 flex-1 items-center justify-center rounded-lg bg-market px-4 text-sm font-black text-on-market shadow-market transition hover:bg-market-strong disabled:cursor-not-allowed disabled:opacity-60"
          disabled={pending}
          type="submit"
        >
          {t(pending ? "Preparation..." : "Preparer la demande")}
        </button>
        {state.whatsappUrl ? (
          <a
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-line bg-foreground/[0.06] px-4 text-sm font-black transition hover:border-line-strong hover:bg-foreground/[0.1]"
            href={state.whatsappUrl}
            rel="noreferrer"
            target="_blank"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            {kind === "paid"
              ? t("Discuter avec le formateur afin de payer ma formation")
              : t("Ouvrir WhatsApp pour envoyer la demande")}
          </a>
        ) : null}
      </div>
    </form>
  );
}
