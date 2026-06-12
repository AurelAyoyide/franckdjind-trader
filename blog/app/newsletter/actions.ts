"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createId, readData, writeData } from "@/lib/data-store";

const newsletterSchema = z.object({
  email: z.string().trim().email().max(160),
  name: z.string().trim().max(120).optional(),
  consent: z.literal("on")
});

export async function subscribeNewsletterAction(formData: FormData) {
  const parsed = newsletterSchema.safeParse({
    email: formData.get("email"),
    name: formData.get("name") || undefined,
    consent: formData.get("consent")
  });

  if (!parsed.success) {
    redirect("/?newsletter=invalid#newsletter");
  }

  const data = await readData();
  const existing = data.subscribers.find(
    (subscriber) => subscriber.email.toLowerCase() === parsed.data.email.toLowerCase()
  );

  if (existing) {
    existing.active = true;
    existing.consent = true;
    existing.name = parsed.data.name;
  } else {
    data.subscribers.unshift({
      id: createId("subscriber"),
      email: parsed.data.email,
      name: parsed.data.name,
      active: true,
      consent: true,
      createdAt: new Date().toISOString()
    });
  }

  data.activityLogs.unshift({
    id: createId("log"),
    action: "newsletter_subscribed",
    entity: "subscriber",
    entityId: parsed.data.email,
    createdAt: new Date().toISOString()
  });

  await writeData(data);
  redirect("/?newsletter=sent#newsletter");
}
