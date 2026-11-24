import { describe, expect, it } from "vitest";
import okFixture from "../src/lib/blueprint/__fixtures__/blueprint-ok.sk.json";
import type { Blueprint, BlueprintResponse } from "../src/lib/blueprint/types";
import {
  blueprintSimilarity,
  compareObservations,
  findGenericPairs,
  renderReport,
  type EvalRun,
} from "./eval-lib";

const okResponse = okFixture as unknown as BlueprintResponse;
const base = okResponse.blueprint as Blueprint;

function different(): Blueprint {
  const c = structuredClone(base);
  c.card_barber.cut_name = "Classic side part";
  c.card_barber.transition = "high_fade";
  c.card_barber.top_length_mm = 70;
  c.card_barber.sides_length_mm = 3;
  c.card_barber.back_length_mm = 3;
  c.card_style.palette.forEach((p, i) => (p.hex = `#00000${i}`));
  c.card_style.key_cuts.forEach((k, i) => (k.item = `Other item ${i}`));
  return c;
}

describe("blueprintSimilarity", () => {
  it("is 1 for identical blueprints", () => {
    expect(blueprintSimilarity(base, structuredClone(base))).toBe(1);
  });
  it("is < 0.3 for clearly different blueprints", () => {
    expect(blueprintSimilarity(base, different())).toBeLessThan(0.3);
  });
  it("ignores hex case", () => {
    const c = structuredClone(base);
    c.card_style.palette.forEach((p) => (p.hex = p.hex.toLowerCase()));
    expect(blueprintSimilarity(base, c)).toBe(1);
  });
});

describe("findGenericPairs", () => {
  it("returns only the identical pair", () => {
    const pairs = findGenericPairs([
      { case_id: "a", blueprint: base },
      { case_id: "b", blueprint: structuredClone(base) },
      { case_id: "c", blueprint: different() },
    ]);
    expect(pairs).toEqual([{ a: "a", b: "b", similarity: 1 }]);
  });
});

describe("compareObservations", () => {
  it("matches a provided expectation only", () => {
    expect(compareObservations({ face_shape: "round" }, okResponse)).toEqual([
      { field: "face_shape", expected: "round", actual: "round", match: true },
    ]);
  });
  it("reports mismatches and photo_issue status", () => {
    const r = compareObservations({ contrast_level: "high", status: "ok" }, okResponse);
    expect(r).toContainEqual({ field: "contrast_level", expected: "high", actual: "medium", match: false });
    expect(r).toContainEqual({ field: "status", expected: "ok", actual: "ok", match: true });
  });
  it("returns nothing without expectations", () => {
    expect(compareObservations(undefined, okResponse)).toEqual([]);
  });
});

describe("renderReport", () => {
  const run: EvalRun = {
    started_at: "2026-11-24T10:00:00.000Z",
    model: "test-model",
    cases: [
      {
        case_id: "c1",
        ok: true,
        status: "ok",
        attempts: 1,
        latencyMs: 1000,
        usage: { input: 100, output: 50, cacheRead: 10 },
        violations: [],
        observations: [{ field: "face_shape", expected: "round", actual: "round", match: true }],
        blueprint: base,
      },
      {
        case_id: "c2",
        ok: true,
        status: "ok",
        attempts: 2,
        latencyMs: 3000,
        usage: { input: 200, output: 80, cacheRead: 0 },
        violations: [],
        observations: [],
        blueprint: structuredClone(base),
      },
      {
        case_id: "c3",
        ok: false,
        failure: "invalid_output",
        attempts: 2,
        latencyMs: 2000,
        usage: { input: 0, output: 0, cacheRead: 0 },
        violations: ["GUARDRAIL: banned phrase"],
        observations: [],
        // extra raw data must never leak into the report
        ...({ raw: "/9j/AAAA" } as object),
      },
    ],
  };
  it("has the required sections and no photo data", () => {
    const md = renderReport(run);
    expect(md).toContain("## Summary");
    expect(md).toContain("## Per case");
    expect(md).toContain("## Generic pairs");
    expect(md).toContain("## Violations");
    expect(md).toContain("c1 ~ c2");
    expect(md).toContain("GUARDRAIL: banned phrase");
    expect(md).toContain("Tokens input: 300"); // total input tokens
    expect(md).not.toContain("/9j/");
  });
});
