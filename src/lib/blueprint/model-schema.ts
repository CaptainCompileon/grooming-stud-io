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

// Keywords whose value maps names to subschemas: the names there are user
// property / definition names (a property may be called "pattern"), not keywords.
const SCHEMA_MAPS = new Set(["properties", "$defs"]);

function isObject(node: unknown): node is Record<string, unknown> {
  return typeof node === "object" && node !== null && !Array.isArray(node);
}

function strip(node: unknown): unknown {
  if (Array.isArray(node)) return node.map(strip);
  if (isObject(node)) {
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(node)) {
      if (UNSUPPORTED_KEYS.has(key)) continue;
      out[key] = SCHEMA_MAPS.has(key) && isObject(value) ? stripEach(value) : strip(value);
    }
    return out;
  }
  return node;
}

function stripEach(map: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [name, subschema] of Object.entries(map)) out[name] = strip(subschema);
  return out;
}

export function toModelSchema(schema: Record<string, unknown>): Record<string, unknown> {
  return strip(schema) as Record<string, unknown>;
}
