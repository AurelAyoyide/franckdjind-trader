type RatingStarsProps = {
  rating: number;
  compact?: boolean;
};

export function RatingStars({ rating, compact = false }: RatingStarsProps) {
  const safeRating = Math.min(5, Math.max(1, rating));
  const percentage = `${(safeRating / 5) * 100}%`;

  return (
    <span aria-label={`Note : ${safeRating.toFixed(1).replace(".", ",")} sur 5`} className="inline-flex items-center gap-1.5 whitespace-nowrap">
      <span
        aria-hidden="true"
        className={compact ? "select-none text-base tracking-[0.06em]" : "select-none text-xl tracking-[0.08em]"}
        style={{
          background: `linear-gradient(90deg, #f5b946 ${percentage}, #d7ddd9 ${percentage})`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}
      >
        ★★★★★
      </span>
      <span className={compact ? "rounded-md border border-amber/25 bg-amber/10 px-2 py-1 text-xs font-black text-amber" : "rounded-md border border-amber/25 bg-amber/10 px-2.5 py-1 text-sm font-black text-amber"}>{safeRating.toFixed(1).replace(".", ",")} / 5</span>
    </span>
  );
}
