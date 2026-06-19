"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createId, readData, writeData } from "@/lib/data-store";
import { getClientIp, hashValue, isSameOriginRequest } from "@/lib/security";

const testimonialSchema = z.object({
  name: z.string().trim().min(2).max(120),
  role: z.string().trim().max(120).optional(),
  quote: z.string().trim().min(20).max(800),
  rating: z.coerce.number().min(1).max(5)
});

export async function submitTestimonialAction(formData: FormData) {
  const requestHeaders = await headers();

  if (!isSameOriginRequest(requestHeaders)) {
    redirect("/temoignages?status=invalid#donner-avis");
  }

  const parsed = testimonialSchema.safeParse({
    name: formData.get("name"),
    role: formData.get("role") || "Apprenant",
    quote: formData.get("quote"),
    rating: formData.get("rating") || 5
  });

  if (!parsed.success) {
    redirect("/temoignages?status=invalid#donner-avis");
  }

  const data = await readData();
  const ipHash = hashValue(getClientIp(requestHeaders));
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  const recentTestimonials = data.activityLogs.filter(
    (log) =>
      log.action === "testimonial_submitted" &&
      log.entityId === ipHash &&
      new Date(log.createdAt).getTime() >= oneHourAgo
  );

  if (recentTestimonials.length >= 3) {
    redirect("/temoignages?status=invalid#donner-avis");
  }

  data.testimonials.unshift({
    id: createId("testimonial"),
    name: parsed.data.name,
    role: parsed.data.role ?? "Apprenant",
    quote: parsed.data.quote,
    rating: parsed.data.rating,
    published: true,
    order: data.testimonials.length + 1,
    createdAt: new Date().toISOString()
  });

  data.activityLogs.unshift({
    id: createId("log"),
    action: "testimonial_submitted",
    entity: "testimonial",
    entityId: ipHash,
    createdAt: new Date().toISOString()
  });

  await writeData(data);
  redirect("/temoignages?status=sent#donner-avis");
}
