type ContactEmailPayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export async function sendContactEmail(payload: ContactEmailPayload) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;

  if (!apiKey || !to) {
    return { sent: false, reason: "missing_config" };
  }

  const from = process.env.CONTACT_FROM_EMAIL || "Bono Trading <onboarding@resend.dev>";
  const subject = `[Contact blog] ${payload.subject}`;
  const text = [
    `Nom: ${payload.name}`,
    `Email: ${payload.email}`,
    "",
    payload.message
  ].join("\n");

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from,
        to,
        reply_to: payload.email,
        subject,
        text
      }),
      signal: AbortSignal.timeout(8000)
    });

    return { sent: response.ok, reason: response.ok ? "sent" : "provider_error" };
  } catch {
    return { sent: false, reason: "network_error" };
  }
}
