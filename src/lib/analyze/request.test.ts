import { describe, expect, it } from "vitest";
import { MAX_PHOTO_BYTES, parseAnalyzeRequest } from "./request";

const jpeg = "/9j/" + "A".repeat(100);
const valid = () => ({
  photos: { front: jpeg, profile: jpeg, full_body: jpeg },
  inputs: { height_cm: 180, hair_type: "wavy", preferred_style: "casual" },
});
const withInputs = (patch: Record<string, unknown>) => ({
  ...valid(),
  inputs: { ...valid().inputs, ...patch },
});
const err = (body: unknown) => {
  const r = parseAnalyzeRequest(body);
  if (r.ok) throw new Error("expected error");
  return r.error;
};
const withPhoto = (key: string, v: unknown) => ({
  ...valid(),
  photos: { ...valid().photos, [key]: v },
});

describe("parseAnalyzeRequest", () => {
  it("accepts a valid body with defaults", () => {
    const r = parseAnalyzeRequest(valid());
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.measurements).toBeNull();
      expect(r.value.locale).toBe("sk");
      expect(r.value.inputs).toEqual({ height_cm: 180, hair_type: "wavy", preferred_style: "casual" });
    }
  });

  it("strips unknown keys", () => {
    const r = parseAnalyzeRequest({ ...valid(), extra: 1, photos: { ...valid().photos, x: "y" } });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(Object.keys(r.value).sort()).toEqual(["inputs", "locale", "measurements", "photos"]);
      expect(Object.keys(r.value.photos).sort()).toEqual(["front", "full_body", "profile"]);
    }
  });

  it("accepts explicit null measurements and locale sk", () => {
    expect(parseAnalyzeRequest({ ...valid(), measurements: null, locale: "sk" }).ok).toBe(true);
  });

  it.each([null, "string", []])("rejects non-object body %j", (b) => {
    expect(err(b)).toBe("body_not_object");
  });

  it("missing photos → missing_photo:front", () => {
    const { photos: _p, ...rest } = valid();
    expect(err(rest)).toBe("missing_photo:front");
    expect(err({ ...rest, photos: "x" })).toBe("missing_photo:front");
  });

  it.each(["front", "profile", "full_body"])("missing photo %s", (k) => {
    expect(err(withPhoto(k, undefined))).toBe(`missing_photo:${k}`);
    expect(err(withPhoto(k, 5))).toBe(`missing_photo:${k}`);
  });

  it("non-jpeg photo", () => {
    expect(err(withPhoto("front", "iVBORw0..."))).toBe("photo_not_jpeg:front");
  });

  it("too large photo, and error never leaks data", () => {
    const big = "/9j/" + "A".repeat(2_100_000);
    const e = err(withPhoto("profile", big));
    expect(e).toBe("photo_too_large:profile");
    expect(e).not.toContain("/9j/");
  });

  it("size boundary accounts for padding", () => {
    // 2_000_000 chars, 2 padding → 1_500_000 - 2 = 1_499_998 bytes: ok
    const ok = "/9j/" + "A".repeat(2_000_000 - 4 - 2) + "==";
    expect(parseAnalyzeRequest(withPhoto("front", ok)).ok).toBe(true);
    // 2_000_004 chars, 0 padding → 1_500_003 bytes: too large
    const bad = "/9j/" + "A".repeat(2_000_000);
    expect(err(withPhoto("front", bad))).toBe("photo_too_large:front");
    expect(MAX_PHOTO_BYTES).toBe(1_500_000);
  });

  it("checks photos in order, jpeg before size", () => {
    const b = withPhoto("profile", "nope");
    b.photos.front = "/9j/" + "A".repeat(2_100_000);
    expect(err(b)).toBe("photo_too_large:front");
  });

  it.each([139, 221, 180.5, "180", null, NaN])("invalid height %j", (h) => {
    expect(err(withInputs({ height_cm: h }))).toBe("invalid_height");
  });
  it.each([undefined, null, "x", []])("missing or non-object inputs %j → invalid_height", (inputs) => {
    expect(err({ ...valid(), inputs })).toBe("invalid_height");
  });

  it("rejects the old top-level input shape", () => {
    const { inputs, ...rest } = valid();
    expect(err({ ...rest, ...inputs })).toBe("invalid_height");
  });

  it("accepts height bounds", () => {
    expect(parseAnalyzeRequest(withInputs({ height_cm: 140 })).ok).toBe(true);
    expect(parseAnalyzeRequest(withInputs({ height_cm: 220 })).ok).toBe(true);
  });

  it("invalid hair_type / style / locale", () => {
    expect(err(withInputs({ hair_type: "bald" }))).toBe("invalid_hair_type");
    expect(err(withInputs({ preferred_style: "goth" }))).toBe("invalid_style");
    expect(err({ ...valid(), locale: "en" })).toBe("invalid_locale");
  });

  it("rejects measurements", () => {
    expect(err({ ...valid(), measurements: {} })).toBe("measurements_not_supported");
  });
});
