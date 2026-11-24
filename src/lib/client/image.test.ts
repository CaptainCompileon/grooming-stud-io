import { describe, expect, it } from "vitest";
import { computeTargetSize } from "./image";

// prepareImage needs createImageBitmap + canvas, which jsdom/node lack;
// it is covered through computeTargetSize here and via PhotoSlot's `prepare` prop.
describe("computeTargetSize", () => {
  it("scales a landscape 12 MP photo down to 1024 on the longer side", () => {
    expect(computeTargetSize(4032, 3024)).toEqual({ width: 1024, height: 768 });
  });

  it("scales a portrait photo down to 1024 on the longer side", () => {
    expect(computeTargetSize(3024, 4032)).toEqual({ width: 768, height: 1024 });
  });

  it("never upscales a smaller photo", () => {
    expect(computeTargetSize(800, 600)).toEqual({ width: 800, height: 600 });
  });

  it("keeps a photo that is exactly at the limit", () => {
    expect(computeTargetSize(1024, 1024)).toEqual({ width: 1024, height: 1024 });
  });

  it("rounds the shorter side to whole pixels", () => {
    expect(computeTargetSize(1500, 1001)).toEqual({ width: 1024, height: 683 });
  });

  it("honours a custom max", () => {
    expect(computeTargetSize(2000, 1000, 500)).toEqual({ width: 500, height: 250 });
  });
});
