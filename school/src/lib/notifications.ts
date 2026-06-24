import { NotificationType, type PrismaClient } from "@prisma/client";
import { deliverLoggedEmail, escapeHtml } from "@/lib/mail";

export async function notifyUser(
  prisma: PrismaClient,
  input: { userId: string; senderId?: string; title: string; body: string; email?: boolean },
) {
  await prisma.notification.create({ data: { userId: input.userId, senderId: input.senderId, type: input.email ? NotificationType.BOTH : NotificationType.INTERNAL, title: input.title, body: input.body } });
  if (!input.email) return;
  const user = await prisma.user.findUnique({ where: { id: input.userId }, select: { email: true, firstName: true } });
  if (!user) return;
  await deliverLoggedEmail(prisma, { to: user.email, userId: input.userId, subject: input.title, html: `<p>Bonjour ${escapeHtml(user.firstName)},</p><p>${escapeHtml(input.body)}</p><p>Connecte-toi a ton espace pour consulter le detail.</p>` });
}
