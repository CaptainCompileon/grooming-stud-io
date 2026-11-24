import { describe, expect, it } from "vitest";
import schema from "../../../docs/product/blueprint.schema.json";
import { toModelSchema } from "./model-schema";

const STRIPPED = ["minimum", "maximum", "minItems", "maxItems", "pattern", "minLength", "maxLength", "$schema", "$id"];

function findKeys(node: unknown, found: string[] = []): string[] {
  if (Array.isArray(node)) node.forEach((n) => findKeys(n, found));
  else if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) {
      if (STRIPPED.includes(k)) found.push(k);
      findKeys(v, found);
    }
  }
  return found;
}

describe("toModelSchema", () => {
  it("strips unsupported keywords at every depth and keeps the rest", () => {
    const out = toModelSchema(schema as Record<string, unknown>);
    expect(findKeys(out)).toEqual([]);
    expect((out as { $defs: Record<string, unknown> }).$defs.blueprint).toBeDefined();
  });

  it("does not mutate its input", () => {
    const before = JSON.parse(JSON.stringify(schema));
    toModelSchema(schema as Record<string, unknown>);
    expect(schema).toEqual(before);
  });

  it("keeps description, const, anyOf and $ref", () => {
    const out = toModelSchema({
      $id: "x",
      a: { description: "d", const: 1, minimum: 0, anyOf: [{ $ref: "#/$defs/z", maxLength: 3 }] },
    });
    expect(out).toEqual({ a: { description: "d", const: 1, anyOf: [{ $ref: "#/$defs/z" }] } });
  });
});
