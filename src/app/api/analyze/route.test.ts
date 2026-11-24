import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import okFixture from "@/lib/blueprint/__fixtures__/blueprint-ok.sk.json";
import type { ModelOutput, VisionModel } from "@/lib/analyze/model-client";

const PHOTO = "/9j/" + "QUJD".repeat(50);
let model: VisionModel;

vi.mock("@/lib/analyze/model-client", () => ({
  getVisionModel: () => model,
}));

import { POST } from "./route";

const validBody = () => ({
  photos: { front: PHOTO, profile: PHOTO, full_body: PHOTO },
  inputs: { height_cm: 180, hair_type: "wavy", preferred_style: "casual" },
  measurements: null,
  locale: "sk",
});

const post = (body: string, headers: Record<string, string> = {}) =>
  POST(
    new Request("http://localhost/api/analyze", {
      method: "POST",
      body,
      headers,
    }),
  );

const modelReturning = (out: ModelOutput): VisionModel => ({
  generate: async () => out,
});

let spies: ReturnType<typeof vi.spyOn>[];
const loggedText = () =>
  spies
    .flatMap((s) => s.mock.calls.flat())
    .map(String)
    .join("\n");

beforeEach(() => {
  spies = (["log", "info", "warn", "error"] as const).map((m) =>
    vi.spyOn(console, m).mockImplementation(() => {}),
  );
});
afterEach(() => vi.restoreAllMocks());

describe("POST /api/analyze", () => {
  it("returns 200 with the blueprint and an x-request-id header", async () => {
    model = modelReturning({
      text: JSON.stringify(okFixture),
      stopReason: "end_turn",
    });
    const res = await post(JSON.stringify(validBody()));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(okFixture);
    expect(res.headers.get("x-request-id")).toMatch(/^[0-9a-f-]{36}$/);
    expect(loggedText()).not.toContain(PHOTO);
  });

  it("returns 400 invalid_json for a body that is not JSON", async () => {
    const res = await post("{not json " + PHOTO);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: "invalid_request",
      code: "invalid_json",
    });
    expect(loggedText()).not.toContain(PHOTO);
  });

  it("returns 400 with the parse code for a PNG photo", async () => {
    const body = validBody();
    body.photos.front = "iVBORw0KGgo" + "A".repeat(100);
    const res = await post(JSON.stringify(body));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: "invalid_request",
      code: "photo_not_jpeg:front",
    });
  });

  it("returns 413 when content-length exceeds 6 000 000", async () => {
    const res = await post("{}", { "content-length": "6000001" });
    expect(res.status).toBe(413);
    expect(await res.json()).toEqual({ error: "payload_too_large" });
  });

  it("returns 413 when the actual body exceeds 6 000 000 bytes", async () => {
    const res = await post(JSON.stringify({ pad: "x".repeat(6_000_001) }));
    expect(res.status).toBe(413);
    expect(await res.json()).toEqual({ error: "payload_too_large" });
  });

  it("returns 502 refusal when the model refuses", async () => {
    model = modelReturning({ text: null, stopReason: "refusal" });
    const res = await post(JSON.stringify(validBody()));
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({
      error: "analysis_failed",
      reason: "refusal",
    });
  });

  it("returns 502 model_error and logs no photo data when the model throws", async () => {
    model = {
      generate: async () => {
        throw new Error("boom /9j/AAAA " + PHOTO);
      },
    };
    const res = await post(JSON.stringify(validBody()));
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({
      error: "analysis_failed",
      reason: "model_error",
    });
    const logs = loggedText();
    expect(logs).not.toContain("/9j/");
    expect(logs).not.toContain("boom");
    expect(logs).toContain('"errorName":"Error"');
    expect(logs).toContain(res.headers.get("x-request-id")!);
  });
});
