import { describe, expect, it } from "vitest";
import okFixture from "../blueprint/__fixtures__/blueprint-ok.sk.json";
import photoIssueFixture from "../blueprint/__fixtures__/photo-issue.sk.json";
import { checkBlueprint } from "./index";

const clone = () => structuredClone(okFixture);

function violationsOf(data: unknown): string[] {
  const result = checkBlueprint(data);
  expect(result.ok).toBe(false);
  return result.violations;
}

describe("checkBlueprint", () => {
  it("ok fixture passes", () => {
    const result = checkBlueprint(okFixture);
    expect(result.ok).toBe(true);
    expect(result.violations).toEqual([]);
  });

  it("photo_issue fixture passes", () => {
    expect(checkBlueprint(photoIssueFixture).ok).toBe(true);
  });

  it("status ok with blueprint null fails with SCHEMA or STATUS", () => {
    const data = { ...clone(), blueprint: null };
    const v = violationsOf(data);
    expect(v.some((x) => x.startsWith("SCHEMA:") || x.startsWith("STATUS:"))).toBe(true);
  });

  it("status photo_issue with blueprint present fails with STATUS", () => {
    const data = clone() as Record<string, unknown>;
    data.status = "photo_issue";
    data.photo_issues = structuredClone(photoIssueFixture.photo_issues);
    expect(violationsOf(data).some((x) => x.startsWith("STATUS:"))).toBe(true);
  });

  it("routine steps [1,1,3] fail with ROUTINE", () => {
    const data = clone();
    data.blueprint.card_grooming.routine[1].step = 1;
    expect(violationsOf(data).some((x) => x.startsWith("ROUTINE:"))).toBe(true);
  });

  it("only one top_near_face color fails with PALETTE", () => {
    const data = clone();
    data.blueprint.card_style.palette[3].where_to_wear = "accent";
    expect(violationsOf(data).some((x) => x.startsWith("PALETTE:"))).toBe(true);
  });

  it("duplicate hex fails with PALETTE (case-insensitive)", () => {
    const data = clone();
    data.blueprint.card_style.palette[1].hex = data.blueprint.card_style.palette[0].hex.toLowerCase();
    expect(violationsOf(data).some((x) => x.startsWith("PALETTE:"))).toBe(true);
  });

  it("barber instructions without mm fail with BARBER", () => {
    const data = clone();
    data.blueprint.card_barber.instructions_for_barber = ["Hore nechať dlhšie", "Boky nakrátko", "Zátylok prirodzene zúžený"];
    expect(violationsOf(data).some((x) => x.startsWith("BARBER:"))).toBe(true);
  });

  it("banned attractiveness language reports each match with its path", () => {
    const data = clone();
    data.blueprint.card_why.summary = "Si veľmi atraktívny, 8/10";
    const banned = violationsOf(data).filter((x) => x.startsWith("BANNED:"));
    expect(banned).toHaveLength(2);
    expect(banned.every((x) => x.includes("blueprint.card_why.summary"))).toBe(true);
  });

  it("reports array indices in banned paths", () => {
    const data = clone();
    data.blueprint.card_barber.instructions_for_barber[2] = "Boky 6 mm, ugly neckline";
    const banned = violationsOf(data).filter((x) => x.startsWith("BANNED:"));
    expect(banned).toHaveLength(1);
    expect(banned[0]).toContain("blueprint.card_barber.instructions_for_barber[2]");
  });

  it("neutral words are not flagged", () => {
    const data = clone();
    data.blueprint.card_style.avoid[0].why = "Pekne upravené obočie";
    data.blueprint.card_why.summary = "hodnotenie proporcií";
    expect(checkBlueprint(data).ok).toBe(true);
  });
});
