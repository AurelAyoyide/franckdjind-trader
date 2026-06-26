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
    ? "Bonjour, j'ai cree mon compte et je viens de demander l'acces a une formation gratuite. Peux-tu verifier et activer mon acces si tout est correct ?"
    : "Bonjour, j'ai cree mon compte et je souhaite finaliser ou verifier l'acces a une formation payante.";

  return [
    intro,
    ...(courseTitle ? [`Formation souhaitee: ${courseTitle}`] : []),
    `Nom: ${name}`,
    `Email: ${email}`,
    `WhatsApp: ${phone}`,
  ].join("\n");
}
