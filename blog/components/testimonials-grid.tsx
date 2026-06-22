import { Sparkles } from "lucide-react";
import type { StoredTestimonial } from "@/lib/data-store";
import { RatingStars } from "@/components/rating-stars";

export function TestimonialsGrid({ testimonials }: { testimonials: StoredTestimonial[] }) {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {testimonials.map((testimonial) => (
          <figure className="flex min-h-72 flex-col rounded-lg border border-line bg-surface p-6" key={testimonial.id}>
            <div className="flex items-center justify-between gap-3">
              <Sparkles className="h-5 w-5 text-cyan" aria-hidden="true" />
              <RatingStars compact rating={testimonial.rating} />
            </div>
            <blockquote className="mt-5 flex-1 text-base font-semibold leading-8 text-pretty">
              &quot;{testimonial.quote}&quot;
            </blockquote>
            <figcaption className="mt-6 border-t border-line pt-4 text-sm text-muted">
              <span className="font-black text-foreground">{testimonial.name}</span>
              <span className="block">{testimonial.role}</span>
            </figcaption>
          </figure>
      ))}
    </div>
  );
}
