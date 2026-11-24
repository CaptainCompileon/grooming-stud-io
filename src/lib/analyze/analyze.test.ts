import { describe, expect, it } from "vitest";
import okFixture from "../blueprint/__fixtures__/blueprint-ok.sk.json";
import { analyzePhotos } from "./analyze";
import type { ModelInput, ModelOutput, VisionModel } from "./model-client";
import type { AnalyzeRequest } from "./request";

const req: AnalyzeRequest = {
  photos: { front: "/9j/front", profile: "/9j/profile", full_body: "/9j/full" },
  inputs: { height_cm: 180, hair_type: "wavy", preferred_style: "casual" },
  measurements: null,
  locale: "sk",
};

type Step = ModelOutput | Error;

function fakeModel(
  steps: Step[],
  onCall?: () => void,
): VisionModel & { calls: ModelInput[] } {
  const calls: ModelInput[] = [];
  return {
    calls,
    async generate(input) {
      calls.push(input);
      onCall?.();
      const step = steps[calls.length - 1];
      if (step === undefined) throw new Error("fake model called too often");
      if (step instanceof Error) throw step;
      return step;
    },
  };
}

const valid: ModelOutput = {
  text: JSON.stringify(okFixture),
  stopReason: "end_turn",
};
const invalid: ModelOutput = { text: "{}", stopReason: "end_turn" };

function lastBlockText(input: ModelInput): string {
  const last = input.content[input.content.length - 1];
  return last.type === "text" ? last.text : "";
}

function hasKey(node: unknown, key: string): boolean {
  if (Array.isArray(node)) return node.some((n) => hasKey(n, key));
  if (node && typeof node === "object") {
    return Object.entries(node).some(([k, v]) => k === key || hasKey(v, key));
  }
  return false;
}

describe("analyzePhotos", () => {
  it("returns the blueprint after one call when the first output is valid", async () => {
    const model = fakeModel([valid]);
    const result = await analyzePhotos(req, model);
    expect(result).toEqual({ ok: true, response: okFixture, attempts: 1 });
    expect(model.calls).toHaveLength(1);
    expect(hasKey(model.calls[0].outputSchema, "minItems")).toBe(false);
    expect(model.calls[0].system.length).toBeGreaterThan(0);
    expect(lastBlockText(model.calls[0])).not.toContain("failed validation");
  });

  it("retries once with the violations as corrections", async () => {
    const model = fakeModel([invalid, valid]);
    const result = await analyzePhotos(req, model);
    expect(result).toEqual({ ok: true, response: okFixture, attempts: 2 });
    expect(model.calls).toHaveLength(2);
    const text = lastBlockText(model.calls[1]);
    expect(text).toContain("failed validation");
    expect(text).toMatch(/SCHEMA: /);
  });

  it("puts the first violation into the second call's last content block", async () => {
    const banned = structuredClone(okFixture) as Record<string, unknown>;
    (
      (banned.blueprint as Record<string, unknown>).observations as Record<
        string,
        unknown
      >
    ).hair_notes = "Si veľmi atraktívny.";
    const model = fakeModel([
      { text: JSON.stringify(banned), stopReason: "end_turn" },
      valid,
    ]);
    const result = await analyzePhotos(req, model);
    expect(result.ok).toBe(true);
    expect(lastBlockText(model.calls[1])).toMatch(/atraktív/);
  });

  it("fails with invalid_output after two invalid outputs", async () => {
    const model = fakeModel([invalid, invalid]);
    const result = await analyzePhotos(req, model);
    expect(result).toMatchObject({
      ok: false,
      reason: "invalid_output",
      attempts: 2,
    });
    expect(result.ok === false && result.violations?.[0]).toMatch(/^SCHEMA: /);
    expect(model.calls).toHaveLength(2);
  });

  it("returns refusal immediately without a retry", async () => {
    const model = fakeModel([{ text: null, stopReason: "refusal" }, valid]);
    const result = await analyzePhotos(req, model);
    expect(result).toEqual({ ok: false, reason: "refusal", attempts: 1 });
    expect(model.calls).toHaveLength(1);
  });

  it("retries without corrections when the model throws, then succeeds", async () => {
    const model = fakeModel([new Error("network down"), valid]);
    const result = await analyzePhotos(req, model);
    expect(result).toEqual({ ok: true, response: okFixture, attempts: 2 });
    expect(lastBlockText(model.calls[1])).not.toContain("failed validation");
  });

  it("fails with model_error when the model throws twice", async () => {
    const model = fakeModel([new Error("a"), new Error("b")]);
    const result = await analyzePhotos(req, model);
    expect(result).toEqual({
      ok: false,
      reason: "model_error",
      attempts: 2,
      errorName: "Error",
    });
  });

  it("reports errorName with the numeric status and never the message", async () => {
    class ApiError extends Error {
      constructor(
        message: string,
        readonly status: number,
      ) {
        super(message);
      }
    }
    const model = fakeModel([
      new ApiError("secret /9j/AAAA", 500),
      new ApiError("secret /9j/AAAA", 401),
    ]);
    const result = await analyzePhotos(req, model);
    expect(result).toMatchObject({
      ok: false,
      reason: "model_error",
      errorName: "ApiError:401",
    });
    expect(JSON.stringify(result)).not.toContain("secret");
  });

  describe("client errors (4xx)", () => {
    class ApiError extends Error {
      constructor(readonly status: number) {
        super(`status ${status}`);
      }
    }

    it.each([400, 401, 403, 404, 413, 422])(
      "does not retry when the first attempt fails with status %i",
      async (status) => {
        const model = fakeModel([new ApiError(status), valid]);
        const result = await analyzePhotos(req, model);
        expect(result).toEqual({
          ok: false,
          reason: "model_error",
          attempts: 1,
          errorName: `ApiError:${status}`,
        });
        expect(model.calls).toHaveLength(1);
      },
    );

    it.each([408, 409, 429, 500, 529])("retries when the first attempt fails with status %i", async (status) => {
      const model = fakeModel([new ApiError(status), valid]);
      const result = await analyzePhotos(req, model);
      expect(result).toEqual({ ok: true, response: okFixture, attempts: 2 });
      expect(model.calls).toHaveLength(2);
    });
  });

  it("reports invalid_output with the first violations when the retry after an invalid output throws", async () => {
    class APIConnectionTimeoutError extends Error {}
    const model = fakeModel([invalid, new APIConnectionTimeoutError("timed out")]);
    const result = await analyzePhotos(req, model);
    expect(result).toMatchObject({
      ok: false,
      reason: "invalid_output",
      attempts: 2,
      errorName: "APIConnectionTimeoutError",
    });
    expect(result.ok === false && result.violations?.[0]).toMatch(/^SCHEMA: /);
    expect(model.calls).toHaveLength(2);
  });

  it("treats a max_tokens stop with truncated text as a parse failure and retries", async () => {
    const truncated = JSON.stringify(okFixture).slice(0, 200);
    const model = fakeModel([
      { text: truncated, stopReason: "max_tokens" },
      valid,
    ]);
    const result = await analyzePhotos(req, model);
    expect(result).toEqual({ ok: true, response: okFixture, attempts: 2 });
    expect(lastBlockText(model.calls[1])).toMatch(/PARSE: /);
  });

  it("treats null text and non-JSON text as parse failures", async () => {
    const model = fakeModel([
      { text: null, stopReason: "end_turn" },
      { text: "not json", stopReason: "end_turn" },
    ]);
    const result = await analyzePhotos(req, model);
    expect(result).toMatchObject({
      ok: false,
      reason: "invalid_output",
      attempts: 2,
    });
    expect(lastBlockText(model.calls[1])).toMatch(/PARSE: /);
    expect(result.ok === false && result.violations?.[0]).toMatch(/^PARSE: /);
  });

  it("returns refusal with attempts 2 when the retry is refused", async () => {
    const model = fakeModel([invalid, { text: null, stopReason: "refusal" }]);
    const result = await analyzePhotos(req, model);
    expect(result).toEqual({ ok: false, reason: "refusal", attempts: 2 });
    expect(model.calls).toHaveLength(2);
  });
});

describe("analyzePhotos time budget", () => {
  function clock(stepMs: number) {
    let t = 1_000_000;
    return { now: () => t, advance: () => (t += stepMs) };
  }

  it("passes the remaining budget as timeoutMs, decreasing between attempts", async () => {
    const c = clock(10_000);
    const model = fakeModel([invalid, valid], c.advance);
    const result = await analyzePhotos(req, model, { now: c.now });
    expect(result).toMatchObject({ ok: true, attempts: 2 });
    expect(model.calls[0].timeoutMs).toBe(55_000);
    expect(model.calls[1].timeoutMs).toBe(45_000);
  });

  it("uses a 55 s default deadline with the real clock", async () => {
    const model = fakeModel([valid]);
    await analyzePhotos(req, model);
    expect(model.calls[0].timeoutMs).toBeGreaterThan(50_000);
    expect(model.calls[0].timeoutMs).toBeLessThanOrEqual(55_000);
  });

  it("still retries when exactly 15 s remain", async () => {
    const c = clock(25_000);
    const model = fakeModel([invalid, valid], c.advance);
    const result = await analyzePhotos(req, model, {
      deadlineMs: 40_000,
      now: c.now,
    });
    expect(result).toMatchObject({ ok: true, attempts: 2 });
    expect(model.calls[1].timeoutMs).toBe(15_000);
  });

  it("skips the retry and returns invalid_output when under 15 s remain", async () => {
    const c = clock(41_000);
    const model = fakeModel([invalid, valid], c.advance);
    const result = await analyzePhotos(req, model, { now: c.now });
    expect(result).toMatchObject({
      ok: false,
      reason: "invalid_output",
      attempts: 1,
    });
    expect(result.ok === false && result.violations?.[0]).toMatch(/^SCHEMA: /);
    expect(model.calls).toHaveLength(1);
  });

  it("skips the retry and returns model_error when the model threw and under 15 s remain", async () => {
    const c = clock(41_000);
    const model = fakeModel([new Error("timeout"), valid], c.advance);
    const result = await analyzePhotos(req, model, { now: c.now });
    expect(result).toEqual({
      ok: false,
      reason: "model_error",
      attempts: 1,
      errorName: "Error",
    });
    expect(model.calls).toHaveLength(1);
  });
});
