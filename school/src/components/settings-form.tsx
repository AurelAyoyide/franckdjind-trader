"use client";

import { useActionState } from "react";
import { saveSettingsAction, type SettingsState } from "@/app/admin/settings/actions";

const initialState: SettingsState = {
  ok: false,
  message: "",
};

const fields = [
  { name: "platformName", label: "PLATFORM_NAME" },
  { name: "platformLogoUrl", label: "PLATFORM_LOGO_URL" },
  { name: "primaryColor", label: "PLATFORM_PRIMARY_COLOR" },
  { name: "smtpHost", label: "SMTP_HOST" },
  { name: "smtpFrom", label: "SMTP_FROM" },
  { name: "whatsappNumber", label: "TRAINER_WHATSAPP_NUMBER" },
  { name: "legalPublisherName", label: "LEGAL_PUBLISHER_NAME" },
  { name: "legalContactEmail", label: "LEGAL_CONTACT_EMAIL" },
  { name: "legalAddress", label: "LEGAL_ADDRESS" },
  { name: "legalRegistrationNumber", label: "LEGAL_REGISTRATION_NUMBER" },
  { name: "hostingProvider", label: "HOSTING_PROVIDER" },
  { name: "emailTokenTtlHours", label: "EMAIL_TOKEN_TTL_HOURS" },
  { name: "resetPasswordTokenTtlHours", label: "RESET_PASSWORD_TOKEN_TTL_HOURS" },
  { name: "remindersEnabled", label: "REMINDERS_ENABLED" },
  { name: "reminderCooldownDays", label: "REMINDER_COOLDOWN_DAYS" },
  { name: "reminderMaxEmailsPerWeek", label: "REMINDER_MAX_EMAILS_PER_WEEK" },
  { name: "certificatePrefix", label: "CERTIFICATE_PREFIX" },
  { name: "maxPrivateUploadMb", label: "MAX_PRIVATE_UPLOAD_MB" },
  { name: "securityMaxLoginAttempts", label: "SECURITY_MAX_LOGIN_ATTEMPTS" },
  { name: "securityLoginWindowMinutes", label: "SECURITY_LOGIN_WINDOW_MINUTES" },
] as const;

export type SettingsFormValues = Record<(typeof fields)[number]["name"], string>;

export function SettingsForm({ values }: { values: SettingsFormValues }) {
  const [state, formAction, pending] = useActionState(saveSettingsAction, initialState);

  return (
    <form action={formAction} className="rounded-lg border border-line bg-surface p-6">
      <div className="grid gap-4 md:grid-cols-2">
        {fields.map((field) => (
          <label className="text-sm font-black" key={field.name}>
            {field.label}
            <input
              className="mt-2 min-h-12 w-full rounded-lg border border-line bg-background px-4 text-sm outline-none focus:border-market"
              defaultValue={values[field.name]}
              name={field.name}
            />
            {state.errors?.[field.name] ? (
              <span className="mt-2 block text-xs text-danger">{state.errors[field.name]?.[0]}</span>
            ) : null}
          </label>
        ))}
      </div>
      {state.message ? (
        <p
          className={`mt-5 rounded-lg border p-3 text-sm font-semibold ${
            state.ok ? "border-market/30 bg-market/10 text-market" : "border-danger/30 bg-danger/10 text-danger"
          }`}
        >
          {state.message}
        </p>
      ) : null}
      <button
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-market px-4 text-sm font-black text-on-market disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "Validation..." : "Enregistrer"}
      </button>
    </form>
  );
}
