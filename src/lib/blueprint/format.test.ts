import { describe, expect, it } from "vitest";
import { sk } from "@/i18n/sk";
import okFixture from "@/lib/blueprint/__fixtures__/blueprint-ok.sk.json";
import type { BarberCheatSheet, BlueprintResponse } from "@/lib/blueprint/types";
import { cheatSheetToText, mmToGuard } from "./format";

const card = (okFixture as BlueprintResponse).blueprint!.card_barber;

describe("mmToGuard", () => {
  it.each([
    [6, "#2"],
    [10, "#3"],
    [9, "#3"],
    [13, "#4"],
    [1.5, "#0.5"],
    [0, "#0"],
    [3, "#1"],
    [4.5, "#1.5"],
    [16, "#5"],
    [19, "#6"],
    [22, "#7"],
    [25, "#8"],
    [26, "#8"],
    [7, "#2"],
  ])("%s mm → %s", (mm, guard) => {
    expect(mmToGuard(mm)).toBe(guard);
  });

  it.each([40, 8, 27, 100])("%s mm has no clipper guard (scissors)", (mm) => {
    expect(mmToGuard(mm)).toBeNull();
  });
});

describe("cheatSheetToText", () => {
  const text = cheatSheetToText(card, sk);

  it("contains the cut name and its local name", () => {
    expect(text).toContain(card.cut_name);
    expect(text).toContain(card.cut_name_local);
  });

  it("lists every length in mm with the guard where one exists", () => {
    expect(text).toContain(`${sk.cards.barber.lengths.top}: 40 mm`);
    expect(text).toContain(`${sk.cards.barber.lengths.sides}: 6 mm (#2)`);
    expect(text).toContain(`${sk.cards.barber.lengths.back}: 10 mm (#3)`);
    expect(text).not.toContain("40 mm (#");
  });

  it("uses the transition and neckline labels from the dictionary", () => {
    expect(text).toContain(sk.cards.barber.transitions.low_taper);
    expect(text).toContain(sk.cards.barber.necklines.natural_tapered);
  });

  it("numbers every instruction line", () => {
    card.instructions_for_barber.forEach((line, i) => {
      expect(text).toContain(`${i + 1}. ${line}`);
    });
  });

  it("includes the styling product and how to apply it", () => {
    expect(text).toContain(sk.cards.barber.products.matte_clay);
    expect(text).toContain(card.styling_product.how_to_apply);
  });

  it("does not include the why text", () => {
    expect(text).not.toContain(card.why);
  });

  it("omits the beard line when there is no beard and adds it when there is one", () => {
    expect(text).not.toContain(sk.cards.barber.beardLabel);
    const withBeard: BarberCheatSheet = {
      ...card,
      beard: { style: "Krátke strniská", length_mm: 3, note: "Línia na lícach prirodzená." },
    };
    const beardText = cheatSheetToText(withBeard, sk);
    expect(beardText).toContain(sk.cards.barber.beardLabel);
    expect(beardText).toContain("Krátke strniská");
    expect(beardText).toContain("3 mm (#1)");
    expect(beardText).toContain("Línia na lícach prirodzená.");
  });
});
