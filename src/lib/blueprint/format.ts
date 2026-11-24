import type { Dictionary } from "@/i18n/sk";
import type { BarberCheatSheet } from "./types";

// Clipper guard ↔ mm, per knowledge-base/barber-terminology.md §1 (mm is the source of truth).
const GUARDS: readonly (readonly [mm: number, guard: string])[] = [
  [0, "#0"],
  [1.5, "#0.5"],
  [3, "#1"],
  [4.5, "#1.5"],
  [6, "#2"],
  [10, "#3"],
  [13, "#4"],
  [16, "#5"],
  [19, "#6"],
  [22, "#7"],
  [25, "#8"],
];

const GUARD_TOLERANCE_MM = 1;

/**
 * The guard number for a clipper length: the nearest table entry within ±1 mm
 * (ties go to the shorter guard). `null` means no clipper guard fits, i.e. scissors.
 */
export function mmToGuard(mm: number): string | null {
  let best: string | null = null;
  let bestDistance = Infinity;
  for (const [guardMm, guard] of GUARDS) {
    const distance = Math.abs(mm - guardMm);
    if (distance <= GUARD_TOLERANCE_MM && distance < bestDistance) {
      best = guard;
      bestDistance = distance;
    }
  }
  return best;
}

/** "6 mm (#2)", or "40 mm (nožnice)" when no guard fits. */
export function formatLength(mm: number, t: Dictionary): string {
  return `${mm} mm (${mmToGuard(mm) ?? t.cards.barber.scissors})`;
}

/** Plain-text cheat sheet for the clipboard: everything the barber needs, without the `why`. */
export function cheatSheetToText(card: BarberCheatSheet, t: Dictionary): string {
  const b = t.cards.barber;
  const lines = [
    card.cut_name,
    card.cut_name_local,
    "",
    `${b.lengths.top}: ${formatLength(card.top_length_mm, t)}`,
    `${b.lengths.sides}: ${formatLength(card.sides_length_mm, t)}`,
    `${b.lengths.back}: ${formatLength(card.back_length_mm, t)}`,
    `${b.transitionLabel}: ${b.transitions[card.transition]}`,
    `${b.necklineLabel}: ${b.necklines[card.neckline]}`,
    `${b.textureLabel}: ${card.texture_finish}`,
    "",
    `${b.instructionsLabel}:`,
    ...card.instructions_for_barber.map((line, i) => `${i + 1}. ${line}`),
    "",
    `${b.stylingLabel}: ${b.products[card.styling_product.type]} – ${card.styling_product.how_to_apply}`,
  ];
  if (card.beard) {
    const { style, length_mm, note } = card.beard;
    lines.push(`${b.beardLabel}: ${style}, ${formatLength(length_mm, t)} – ${note}`);
  }
  return lines.join("\n");
}
