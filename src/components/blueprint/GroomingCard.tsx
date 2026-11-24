import { useId } from "react";
import { sk } from "@/i18n/sk";
import type { CardGrooming } from "@/lib/blueprint/types";

export function GroomingCard({ card }: { card: CardGrooming }) {
  const t = sk.cards.grooming;
  const headingId = useId();
  const tip = card.targeted_tip;
  const steps = [...card.routine].sort((a, b) => a.step - b.step);

  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-col gap-5 rounded-2xl border border-line bg-surface p-5 break-words"
    >
      <h2 id={headingId} className="text-lg font-semibold">
        {t.title}
      </h2>

      <div className="flex flex-col gap-3">
        <h3 className="font-semibold">{t.routineLabel}</h3>
        <ol className="flex flex-col gap-3">
          {steps.map((step) => (
            <li key={step.step} data-testid="routine-step" className="flex gap-3">
              <span
                aria-hidden
                className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent-soft font-semibold text-accent"
              >
                {step.step}
              </span>
              <div className="flex min-w-0 flex-col gap-0.5 leading-snug">
                <p className="text-xs font-semibold tracking-wide text-accent uppercase">{t.when[step.when]}</p>
                <p className="font-medium">{step.product_type}</p>
                <p className="text-sm text-muted">{step.why}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {tip.area !== "none" && (
        <div className="flex flex-col gap-1 rounded-xl bg-canvas p-4 leading-snug">
          <h3 className="font-semibold">
            {t.targetedTipLabel} · {t.areas[tip.area]}
          </h3>
          <p>{tip.tip}</p>
          <p className="text-sm text-muted">{tip.why}</p>
        </div>
      )}
    </section>
  );
}
