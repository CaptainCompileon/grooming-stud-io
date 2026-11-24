import type { HairType, Locale, PhotoKey, PreferredStyle } from "../blueprint/types";

export interface AnalyzeRequest {
  photos: Record<PhotoKey, string>;
  inputs: { height_cm: number; hair_type: HairType; preferred_style: PreferredStyle };
  measurements: null;
  locale: Locale;
}

export const MAX_PHOTO_BYTES = 1_500_000;

const PHOTO_KEYS: PhotoKey[] = ["front", "profile", "full_body"];
const HAIR_TYPES: readonly string[] = ["straight", "wavy", "curly", "thinning"];
const STYLES: readonly string[] = ["casual", "smart_casual", "streetwear", "minimal"];

export type ParseResult = { ok: true; value: AnalyzeRequest } | { ok: false; error: string };

const fail = (error: string): ParseResult => ({ ok: false, error });

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function decodedSize(b64: string): number {
  let padding = 0;
  while (padding < 2 && b64[b64.length - 1 - padding] === "=") padding++;
  return Math.floor((b64.length * 3) / 4) - padding;
}

// Error strings are fixed codes; they never include request content (photos).
export function parseAnalyzeRequest(body: unknown): ParseResult {
  if (!isRecord(body)) return fail("body_not_object");

  const rawPhotos = isRecord(body.photos) ? body.photos : {};
  const photos = {} as Record<PhotoKey, string>;
  for (const key of PHOTO_KEYS) {
    const p = rawPhotos[key];
    if (typeof p !== "string") return fail(`missing_photo:${key}`);
    if (!p.startsWith("/9j/")) return fail(`photo_not_jpeg:${key}`);
    if (decodedSize(p) > MAX_PHOTO_BYTES) return fail(`photo_too_large:${key}`);
    photos[key] = p;
  }

  // Inputs are nested under `inputs` (architecture §3.2); a missing object fails the first input check.
  const inputs = isRecord(body.inputs) ? body.inputs : {};
  const h = inputs.height_cm;
  if (typeof h !== "number" || !Number.isInteger(h) || h < 140 || h > 220) {
    return fail("invalid_height");
  }
  if (typeof inputs.hair_type !== "string" || !HAIR_TYPES.includes(inputs.hair_type)) {
    return fail("invalid_hair_type");
  }
  if (typeof inputs.preferred_style !== "string" || !STYLES.includes(inputs.preferred_style)) {
    return fail("invalid_style");
  }
  if (body.locale !== undefined && body.locale !== "sk") return fail("invalid_locale");
  if (body.measurements !== undefined && body.measurements !== null) {
    return fail("measurements_not_supported");
  }

  return {
    ok: true,
    value: {
      photos,
      inputs: {
        height_cm: h,
        hair_type: inputs.hair_type as HairType,
        preferred_style: inputs.preferred_style as PreferredStyle,
      },
      measurements: null,
      locale: "sk",
    },
  };
}
