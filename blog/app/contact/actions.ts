"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createId, readData, writeData } from "@/lib/data-store";
import { hashValue } from "@/lib/security";

const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(160),
  subject: z.string().trim().min(2).max(160),
  message: z.string().trim().min(10).max(4000),
  website: z.string().max(0).optional()
});

function oneHourAgo() {
  return Date.now() - 60 * 60 * 1000;
}

export async function submitContactAction(formData: FormData) {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
    website: formData.get("website") || undefined
  });

  if (!parsed.success) {
    redirect("/contact?status=invalid");
  }

  const requestHeaders = await headers();
  const ip = requestHeaders.get("x-forwarded-for") ?? "local";
  const ipHash = hashValue(ip);
  const data = await readData();
  const recentMessages = data.contactMessages.filter(
    (message) => message.ipHash === ipHash && new Date(message.createdAt).getTime() >= oneHourAgo()
  );

  if (recentMessages.length >= 5) {
    redirect("/contact?status=limited");
  }

  const messageData = {
    name: parsed.data.name,
    email: parsed.data.email,
    subject: parsed.data.subject,
    message: parsed.data.message
  };

  data.contactMessages.unshift({
    id: createId("message"),
    ...messageData,
    status: "UNREAD",
    ipHash,
    userAgent: requestHeaders.get("user-agent") ?? undefined,
    createdAt: new Date().toISOString()
  });

  data.activityLogs.unshift({
    id: createId("log"),
    action: "contact_message_created",
    entity: "contactMessage",
    createdAt: new Date().toISOString()
  });

  await writeData(data);
  redirect("/contact?status=sent");
}
