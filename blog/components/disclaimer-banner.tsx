import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export function DisclaimerBanner() {
  return (
    <aside className="rounded-lg border border-amber/30 bg-amber/10 p-4 text-sm leading-7 text-foreground">
      <div className="flex gap-3">
        <ShieldAlert className="mt-1 h-5 w-5 shrink-0 text-amber" aria-hidden="true" />
        <p>
          Le trading comporte un risque eleve de perte en capital. Les contenus sont
          educatifs et doivent etre lus avec le{" "}
          <Link className="font-semibold text-amber underline-offset-4 hover:underline" href="/disclaimer">
            disclaimer trading
          </Link>.
        </p>
      </div>
    </aside>
  );
}
