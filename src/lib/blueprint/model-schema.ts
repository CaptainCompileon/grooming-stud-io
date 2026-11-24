// Structured-output schemas reject these keywords; validation of them stays in ajv (validate.ts).
const UNSUPPORTED_KEYS = new Set([
  "minimum",
  "maximum",
  "minItems",
  "maxItems",
  "pattern",
  "minLength",
  "maxLength",
  "$schema",
  "$id",
]);

function strip(node: unknown): unknown {
  if (Array.isArray(node)) return node.map(strip);
  if (node && typeof node === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(node)) {
      if (!UNSUPPORTED_KEYS.has(key)) out[key] = strip(value);
    }
    return out;
  }
  return node;
}

export function toModelSchema(schema: Record<string, unknown>): Record<string, unknown> {
  return strip(schema) as Record<string, unknown>;
}
