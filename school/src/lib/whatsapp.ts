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
  const label = kind === "free" ? "formation gratuite" : "formation payante deja reglee";

  return [
    `Bonjour, je souhaite demander l'acces a une ${label}.`,
    ...(courseTitle ? [`Formation souhaitee: ${courseTitle}`] : []),
    `Nom: ${name}`,
    `Email: ${email}`,
    `WhatsApp: ${phone}`,
  ].join("\n");
}
