type ContactEmailPayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

type OutgoingEmail = {
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
};

function escapeHtml(value: string) {
  const entities: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;"
  };

  return value.replace(/[&<>'"]/g, (character) => entities[character] ?? character);
}

function emailLayout({ eyebrow, title, content, cta }: { eyebrow: string; title: string; content: string; cta?: { label: string; url: string } }) {
  return `<!doctype html>
<html lang="fr">
  <body style="margin:0;background:#f4f7f6;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#111816;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #dce5e0;border-radius:16px;overflow:hidden;">
      <tr><td style="background:#07110d;padding:28px 32px;">
        <p style="margin:0;color:#18c985;font-size:11px;font-weight:800;letter-spacing:2px;text-transform:uppercase;">Bono Trading</p>
        <h1 style="margin:12px 0 0;color:#ffffff;font-size:26px;line-height:1.2;">${escapeHtml(title)}</h1>
      </td></tr>
      <tr><td style="padding:32px;">
        <p style="margin:0 0 20px;color:#607169;font-size:12px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;">${escapeHtml(eyebrow)}</p>
        ${content}
        ${cta ? `<p style="margin:28px 0 0;"><a href="${escapeHtml(cta.url)}" style="display:inline-block;border-radius:9px;background:#18c985;padding:13px 18px;color:#04100b;font-size:14px;font-weight:800;text-decoration:none;">${escapeHtml(cta.label)}</a></p>` : ""}
      </td></tr>
      <tr><td style="border-top:1px solid #dce5e0;padding:18px 32px;color:#75837c;font-size:12px;line-height:1.6;">
        Message envoyé depuis le site Bono Trading. Ne partage jamais tes informations sensibles par email.
      </td></tr>
    </table>
  </body>
</html>`;
}

async function sendEmail(email: OutgoingEmail) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return { sent: false, reason: "missing_config" as const };
  }

  const from = process.env.CONTACT_FROM_EMAIL || "Bono Trading <onboarding@resend.dev>";

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from,
        to: email.to,
        reply_to: email.replyTo,
        subject: email.subject,
        text: email.text,
        html: email.html
      }),
      signal: AbortSignal.timeout(8000)
    });

    return { sent: response.ok, reason: response.ok ? "sent" as const : "provider_error" as const };
  } catch {
    return { sent: false, reason: "network_error" as const };
  }
}

export async function sendContactEmail(payload: ContactEmailPayload) {
  const to = process.env.CONTACT_TO_EMAIL;

  if (!to) {
    return { sent: false, reason: "missing_config" as const };
  }

  const safeName = escapeHtml(payload.name);
  const safeEmail = escapeHtml(payload.email);
  const safeMessage = escapeHtml(payload.message).replace(/\r?\n/g, "<br />");

  return sendEmail({
    to,
    replyTo: payload.email,
    subject: `[Bono Trading • Contact] ${payload.subject}`,
    text: `Nouveau message depuis le site Bono Trading\n\nSujet : ${payload.subject}\nDe : ${payload.name} <${payload.email}>\n\n${payload.message}`,
    html: emailLayout({
      eyebrow: "Nouveau message contact",
      title: payload.subject,
      content: `<p style="margin:0;color:#25322c;font-size:16px;line-height:1.7;">Tu as reçu un nouveau message depuis le formulaire du site.</p>
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width:100%;margin:24px 0;border:1px solid #dce5e0;border-radius:10px;background:#f8fbf9;">
          <tr><td style="padding:16px 18px;border-bottom:1px solid #dce5e0;"><strong style="font-size:13px;">Expéditeur</strong><br /><a href="mailto:${safeEmail}" style="color:#078f5e;text-decoration:none;">${safeName} — ${safeEmail}</a></td></tr>
          <tr><td style="padding:16px 18px;"><strong style="font-size:13px;">Message</strong><p style="margin:8px 0 0;color:#25322c;font-size:15px;line-height:1.7;">${safeMessage}</p></td></tr>
        </table>`,
      cta: { label: "Répondre à ce message", url: `mailto:${payload.email}?subject=${encodeURIComponent(`Re: ${payload.subject}`)}` }
    })
  });
}

export async function sendPasswordResetEmail(payload: { email: string; resetUrl: string }) {
  return sendEmail({
    to: payload.email,
    subject: "Bono Trading — Réinitialisation du mot de passe",
    text: `Une demande de réinitialisation de mot de passe a été reçue.\n\nUtilise ce lien dans les 30 prochaines minutes :\n${payload.resetUrl}\n\nSi tu n'es pas à l'origine de cette demande, tu peux ignorer cet email.`,
    html: emailLayout({
      eyebrow: "Sécurité du compte",
      title: "Réinitialiser ton mot de passe",
      content: `<p style="margin:0;color:#25322c;font-size:16px;line-height:1.7;">Une demande de réinitialisation a été reçue pour ce compte administrateur.</p>
        <p style="margin:18px 0 0;color:#607169;font-size:14px;line-height:1.7;">Le lien est valable <strong>30 minutes</strong> et ne peut être utilisé qu'une seule fois. Si tu n'es pas à l'origine de cette demande, ignore simplement cet email.</p>`,
      cta: { label: "Choisir un nouveau mot de passe", url: payload.resetUrl }
    })
  });
}
