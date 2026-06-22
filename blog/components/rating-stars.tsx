type RatingStarsProps = {
  rating: number;
  compact?: boolean;
};

export function RatingStars({ rating, compact = false }: RatingStarsProps) {
  const safeRating = Math.min(5, Math.max(1, rating));
  const percentage = `${(safeRating / 5) * 100}%`;

  return (
    <span aria-label={`Note : ${safeRating.toFixed(1).replace(".", ",")} sur 5`} className="inline-flex items-center gap-2">
      <span
        aria-hidden="true"
        className={compact ? "select-none text-sm tracking-[0.08em]" : "select-none text-xl tracking-[0.1em]"}
        style={{
          background: `linear-gradient(90deg, #f5b946 ${percentage}, #d7ddd9 ${percentage})`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}
      >
        ★★★★★
      </span>
      <span className={compact ? "text-xs font-black text-amber" : "text-sm font-black text-amber"}>{safeRating.toFixed(1).replace(".", ",")} / 5</span>
    </span>
  );
}
