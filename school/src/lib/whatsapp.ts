import { siteConfig } from "@/lib/platform-content";

export function buildWhatsAppLink(message: string) {
  return `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export function buildTrainingRequestMessage(
  kind: "free" | "paid",
  name: string,
  email: string,
  phone: string,
  courseTitle?: string,
) {
  const intro = kind === "free"
    ? "Bonjour, j'ai créé mon compte et je viens de demander l'accès à une formation gratuite. Peux-tu vérifier et activer mon accès si tout est correct ?"
    : "Bonjour, j'ai créé mon compte et je souhaite finaliser ou vérifier l'accès à une formation payante.";

  return [
    intro,
    ...(courseTitle ? [`Formation souhaitee: ${courseTitle}`] : []),
    `Nom: ${name}`,
    `Email: ${email}`,
    `WhatsApp: ${phone}`,
  ].join("\n");
}
