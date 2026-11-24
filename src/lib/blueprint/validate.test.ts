import { describe, expect, it } from "vitest";
import okFixture from "./__fixtures__/blueprint-ok.sk.json";
import photoIssueFixture from "./__fixtures__/photo-issue.sk.json";
import { validateBlueprintSchema } from "./validate";

const clone = () => structuredClone(okFixture);

describe("validateBlueprintSchema", () => {
  it("accepts the ok fixture", () => {
    expect(validateBlueprintSchema(okFixture).valid).toBe(true);
  });

  it("accepts the photo_issue fixture", () => {
    expect(validateBlueprintSchema(photoIssueFixture).valid).toBe(true);
  });

  it("rejects palette with 5 colors", () => {
    const data = clone();
    data.blueprint.card_style.palette.pop();
    const result = validateBlueprintSchema(data);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.some((e) => e.includes("palette"))).toBe(true);
    }
  });

  it("rejects invalid hex", () => {
    const data = clone();
    data.blueprint.card_style.palette[0].hex = "#12345";
    expect(validateBlueprintSchema(data).valid).toBe(false);
  });

  it("rejects unknown property", () => {
    const data = clone() as Record<string, any>;
    data.blueprint.extra = 1;
    expect(validateBlueprintSchema(data).valid).toBe(false);
  });
});
