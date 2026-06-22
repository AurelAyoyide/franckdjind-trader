"use client";

import { useId, useState } from "react";

type RatingSelectorProps = {
  initialRating?: number;
  name?: string;
  label?: string;
};

export function RatingSelector({ initialRating = 5, name = "rating", label = "Ta note" }: RatingSelectorProps) {
  const [rating, setRating] = useState(() => Math.min(5, Math.max(1, Math.round(initialRating * 10) / 10)));
  const id = useId();
  const percentage = `${(rating / 5) * 100}%`;

  return (
    <fieldset className="rounded-lg border border-line bg-background p-4">
      <legend className="px-1 text-sm font-black text-foreground">{label}</legend>
      <input name={name} type="hidden" value={rating} />
      <div className="mt-2">
        <div>
          <div
            aria-hidden="true"
            className="select-none text-3xl leading-none tracking-[0.16em]"
            style={{
              background: `linear-gradient(90deg, #f5b946 ${percentage}, #d7ddd9 ${percentage})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}
          >
            ★★★★★
          </div>
          <p className="mt-2 text-sm text-muted">Déplace le curseur pour choisir une note précise, par exemple 4,4 ou 4,5.</p>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <input
          aria-label={label}
          className="h-2 w-full cursor-pointer appearance-none rounded-full accent-amber"
          id={id}
          max="5"
          min="1"
          onChange={(event) => setRating(Number(event.target.value))}
          step="0.1"
          style={{ background: `linear-gradient(90deg, #f5b946 ${percentage}, var(--line) ${percentage})` }}
          type="range"
          value={rating}
        />
        <output className="rounded-md border border-amber/30 bg-amber/10 px-3 py-2 text-lg font-black text-amber" htmlFor={id}>
          {rating.toFixed(1).replace(".", ",")} / 5
        </output>
      </div>
      <div className="mt-2 flex justify-between text-[11px] font-bold text-muted-strong"><span>1,0</span><span>2,0</span><span>3,0</span><span>4,0</span><span>5,0</span></div>
    </fieldset>
  );
}
