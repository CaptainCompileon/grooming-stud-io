import { useId } from "react";
import { sk } from "@/i18n/sk";
import type { CardStyle } from "@/lib/blueprint/types";

type Props = {
  card: CardStyle;
  /** Notes for observations read with low confidence (undertone, body frame). */
  lowConfidenceNotes: string[];
};

export function StyleCard({ card, lowConfidenceNotes }: Props) {
  const t = sk.cards.style;
  const headingId = useId();

  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-col gap-5 rounded-2xl border border-line bg-surface p-5 break-words"
    >
      <h2 id={headingId} className="text-lg font-semibold">
        {t.title}
      </h2>

      <div className="flex flex-col gap-3">
        <h3 className="font-semibold">{t.paletteLabel}</h3>
        <ul className="grid grid-cols-2 gap-3">
          {card.palette.map((color) => (
            <li key={`${color.hex}-${color.name}`} data-testid="swatch" className="flex min-w-0 flex-col gap-1">
              <div
                aria-hidden
                className="h-14 rounded-lg border border-line"
                style={{ background: color.hex }}
              />
              <p className="text-sm leading-tight font-medium">{color.name}</p>
              <p className="font-mono text-xs text-muted">{color.hex}</p>
              <p className="text-xs leading-tight text-muted">{t.whereToWear[color.where_to_wear]}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="font-semibold">{t.paletteWhyLabel}</h3>
        <p className="leading-snug">{card.palette_why}</p>
      </div>

      {lowConfidenceNotes.map((note) => (
        <p key={note} className="rounded-lg bg-canvas px-3 py-2 text-sm text-muted">
          {note}
        </p>
      ))}

      <div className="flex flex-col gap-3">
        <h3 className="font-semibold">{t.keyCutsLabel}</h3>
        <ol className="flex flex-col gap-3">
          {card.key_cuts.map((cut, i) => (
            <li key={`${i}-${cut.item}`} className="rounded-xl bg-canvas p-4">
              <p className="font-semibold">{cut.item}</p>
              <dl className="mt-2 grid gap-2 text-sm leading-snug">
                <Row label={t.fitLabel} value={cut.fit} />
                <Row label={t.shoppingTipLabel} value={cut.shopping_tip} />
                <Row label={sk.cards.whyLabel} value={cut.why} />
              </dl>
            </li>
          ))}
        </ol>
      </div>

      {card.avoid.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="font-semibold">{t.avoidLabel}</h3>
          <ul className="flex flex-col gap-2">
            {card.avoid.map((item, i) => (
              <li key={`${i}-${item.what}`} className="leading-snug">
                <span className="font-medium">{item.what}</span>
                <span className="text-muted"> – {item.why}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-muted">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
