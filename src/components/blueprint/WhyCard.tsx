import { useId } from "react";
import { sk } from "@/i18n/sk";
import type { CardWhy } from "@/lib/blueprint/types";

export function WhyCard({ card }: { card: CardWhy }) {
  const t = sk.cards.why;
  const headingId = useId();

  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-col gap-5 rounded-2xl border border-line bg-surface p-5 break-words"
    >
      <h2 id={headingId} className="text-lg font-semibold">
        {t.title}
      </h2>

      <p className="leading-relaxed">{card.summary}</p>

      {card.proportion_points.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="font-semibold">{t.proportionsLabel}</h3>
          <ul className="flex flex-col gap-2">
            {card.proportion_points.map((point, i) => (
              <li key={i} className="rounded-xl bg-canvas p-3 leading-snug">
                <p>{point.observation}</p>
                <p className="font-medium text-accent">
                  <span aria-hidden>→ </span>
                  {point.implication}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {card.uncertainties.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="font-semibold">{t.uncertaintiesLabel}</h3>
          <ul className="flex list-disc flex-col gap-1 pl-5 text-sm leading-snug text-muted">
            {card.uncertainties.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
