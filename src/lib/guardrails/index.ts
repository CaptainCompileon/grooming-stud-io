import { validateBlueprintSchema } from "../blueprint/validate";
import type { BlueprintResponse } from "../blueprint/types";

export type GuardrailResult =
  | { ok: true; data: BlueprintResponse; violations: [] }
  | { ok: false; violations: string[] };

// No attractiveness / rating / flaw language. Flags `iu`: case-insensitive, Unicode.
// `\b` is ASCII-only in JS, so it is used only where the pattern starts/ends with an ASCII letter.
export const BANNED_PATTERNS: RegExp[] = [
  /\b\d{1,2}\s*\/\s*10\b/iu,
  /skór/iu,
  /atraktív/iu,
  /atraktiv/iu,
  /\battractive/iu,
  /unattractive/iu,
  /škared/iu,
  /oškliv/iu,
  /nepekn/iu,
  /\bugly\b/iu,
  /\bhandsome\b/iu,
  /\bflaws?\b/iu,
  /nedostat(ok|ky|kom|kami)\b/iu,
  /problematick/iu,
  /problém s pleťou/iu,
];

function walkStrings(value: unknown, path: string, visit: (path: string, s: string) => void): void {
  if (typeof value === "string") {
    visit(path, value);
  } else if (Array.isArray(value)) {
    value.forEach((item, i) => walkStrings(item, `${path}[${i}]`, visit));
  } else if (value !== null && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      walkStrings(child, path ? `${path}.${key}` : key, visit);
    }
  }
}

export function checkBlueprint(data: unknown): GuardrailResult {
  const schema = validateBlueprintSchema(data);
  if (!schema.valid) {
    return { ok: false, violations: schema.errors.map((e) => `SCHEMA: ${e.trim()}`) };
  }

  const response = schema.data;
  const violations: string[] = [];
  const { status, blueprint, photo_issues } = response;

  if (status === "ok") {
    if (blueprint === null) violations.push("STATUS: status ok requires a blueprint");
    if (photo_issues.length !== 0) violations.push("STATUS: status ok requires no photo_issues");
  } else {
    if (blueprint !== null) violations.push("STATUS: status photo_issue requires blueprint null");
    if (photo_issues.length < 1) violations.push("STATUS: status photo_issue requires at least one photo_issue");
  }

  if (blueprint) {
    const steps = blueprint.card_grooming.routine.map((r) => r.step).sort((a, b) => a - b);
    if (steps.length !== 3 || steps.some((s, i) => s !== i + 1)) {
      violations.push(`ROUTINE: steps must be exactly 1, 2, 3 (got ${steps.join(", ")})`);
    }

    const { palette } = blueprint.card_style;
    if (palette.filter((c) => c.where_to_wear === "top_near_face").length < 2) {
      violations.push("PALETTE: at least 2 colors must be top_near_face");
    }
    const hexes = palette.map((c) => c.hex.toLowerCase());
    if (new Set(hexes).size !== hexes.length) {
      violations.push("PALETTE: hex values must be unique");
    }

    if (!blueprint.card_barber.instructions_for_barber.some((line) => /\d+\s*mm/i.test(line))) {
      violations.push("BARBER: at least one instruction must give a length in mm");
    }
  }

  walkStrings(response, "", (path, s) => {
    for (const pattern of BANNED_PATTERNS) {
      if (pattern.test(s)) violations.push(`BANNED: ${path} matches ${pattern}`);
    }
  });

  return violations.length === 0
    ? { ok: true, data: response, violations: [] }
    : { ok: false, violations };
}
