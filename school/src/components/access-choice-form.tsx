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
          { value: "free", label: "Formation gratuite", text: "Demande l'activation gratuite, puis previens le formateur sur WhatsApp." },
          { value: "paid", label: "Formation payante", text: "Demande l'acces apres paiement ou pour finaliser le paiement avec le formateur." },
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

      <div className="mt-5 rounded-lg border border-cyan/25 bg-cyan/10 p-4 text-sm leading-7 text-cyan">
        {kind === "free"
          ? "Formation gratuite : tu ne paies rien ici. La plateforme enregistre ta demande, puis WhatsApp sert uniquement a prevenir le formateur pour qu'il active ton acces."
          : "Formation payante : la plateforme enregistre ta demande, puis WhatsApp sert a finaliser le paiement hors plateforme ou a verifier ta preuve."}
      </div>

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
      </div>

      {state.whatsappUrl ? (
        <a
          className="mt-5 flex min-h-24 items-center gap-4 rounded-xl border border-market/40 bg-market/10 p-5 text-market shadow-sm transition hover:-translate-y-0.5 hover:border-market hover:bg-market/15 focus:outline-none focus:ring-2 focus:ring-market focus:ring-offset-2"
          href={state.whatsappUrl}
          rel="noreferrer"
          target="_blank"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-market text-on-market">
            <MessageCircle className="h-5 w-5" aria-hidden="true" />
          </span>
          <span>
            <span className="block text-base font-black">
              {t(state.whatsappInstruction ?? "Etape 2 : ouvrir WhatsApp")}
            </span>
            <span className="mt-1 block text-sm font-semibold text-foreground">
              {kind === "paid"
                ? t("Clique ici pour parler au formateur et finaliser l'acces payant.")
                : t("Clique ici pour envoyer le message pre-rempli et demander l'activation gratuite.")}
            </span>
          </span>
        </a>
      ) : null}
    </form>
  );
}
