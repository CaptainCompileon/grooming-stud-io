import type Anthropic from "@anthropic-ai/sdk";
import { afterEach, describe, expect, it, vi } from "vitest";
import okFixture from "../blueprint/__fixtures__/blueprint-ok.sk.json";
import {
  createAnthropicModel,
  createFixtureModel,
  getVisionModel,
  isFixtureModel,
  type ModelInput,
} from "./model-client";

const input: ModelInput = {
  system: [{ type: "text", text: "system" }],
  content: [{ type: "text", text: "hello" }],
  outputSchema: { type: "object" },
};

function fakeClient(response: unknown) {
  const create = vi.fn().mockResolvedValue(response);
  const client = { beta: { messages: { create } } } as unknown as Anthropic;
  return { client, create };
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.useRealTimers();
});

describe("getVisionModel", () => {
  it("returns the fixture model outside production when ANALYZE_MOCK=fixture", async () => {
    vi.stubEnv("ANALYZE_MOCK", "fixture");
    vi.stubEnv("NODE_ENV", "test");
    vi.useFakeTimers();
    const model = getVisionModel();
    expect(isFixtureModel(model)).toBe(true);
    const pending = model.generate(input);
    await vi.advanceTimersByTimeAsync(1500);
    const out = await pending;
    expect(out.stopReason).toBe("end_turn");
    expect(JSON.parse(out.text ?? "")).toEqual(okFixture);
  });

  it("never returns the fixture model in production", () => {
    vi.stubEnv("ANALYZE_MOCK", "fixture");
    vi.stubEnv("NODE_ENV", "production");
    expect(isFixtureModel(getVisionModel())).toBe(false);
  });

  it("returns the Anthropic model when ANALYZE_MOCK is unset", () => {
    vi.stubEnv("ANALYZE_MOCK", "");
    vi.stubEnv("NODE_ENV", "test");
    expect(isFixtureModel(getVisionModel())).toBe(false);
  });
});

describe("createFixtureModel", () => {
  it("waits the configured delay before answering", async () => {
    vi.useFakeTimers();
    let done = false;
    const pending = createFixtureModel().generate(input).then(() => (done = true));
    await vi.advanceTimersByTimeAsync(1499);
    expect(done).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    await pending;
    expect(done).toBe(true);
  });
});

describe("createAnthropicModel", () => {
  const response = {
    stop_reason: "end_turn",
    content: [
      { type: "thinking", thinking: "", signature: "x" },
      { type: "text", text: '{"a":1}' },
      { type: "text", text: "second" },
    ],
    usage: { input_tokens: 10, output_tokens: 20, cache_read_input_tokens: 5 },
  };

  it("sends the documented request shape with env defaults", async () => {
    vi.stubEnv("ANTHROPIC_MODEL", undefined);
    vi.stubEnv("ANTHROPIC_EFFORT", undefined);
    const { client, create } = fakeClient(response);
    await createAnthropicModel({ client }).generate(input);

    expect(create).toHaveBeenCalledTimes(1);
    const params = create.mock.calls[0][0];
    expect(params).toEqual({
      model: "claude-opus-5-5",
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: input.system,
      messages: [{ role: "user", content: input.content }],
      output_config: { effort: "medium", format: { type: "json_schema", schema: input.outputSchema } },
    });
    expect(params).not.toHaveProperty("thinking");
    expect(params).not.toHaveProperty("temperature");
    expect(params).not.toHaveProperty("stream");
    expect(create.mock.calls[0][1]).toEqual({ maxRetries: 0 });
  });

  it("passes timeoutMs as the request timeout and disables SDK retries", async () => {
    const { client, create } = fakeClient(response);
    await createAnthropicModel({ client }).generate({ ...input, timeoutMs: 30_000 });
    expect(create.mock.calls[0][1]).toEqual({ timeout: 30_000, maxRetries: 0 });
    expect(create.mock.calls[0][0]).not.toHaveProperty("timeoutMs");
  });

  it("falls back to defaults when env vars are empty strings", async () => {
    vi.stubEnv("ANTHROPIC_MODEL", "");
    vi.stubEnv("ANTHROPIC_EFFORT", "");
    const { client, create } = fakeClient(response);
    await createAnthropicModel({ client }).generate(input);
    expect(create.mock.calls[0][0]).toMatchObject({
      model: "claude-opus-5-5",
      output_config: { effort: "medium" },
    });
  });

  it("falls back to medium effort when ANTHROPIC_EFFORT is not a known level", async () => {
    vi.stubEnv("ANTHROPIC_EFFORT", "turbo");
    const { client, create } = fakeClient(response);
    await createAnthropicModel({ client }).generate(input);
    expect(create.mock.calls[0][0]).toMatchObject({ output_config: { effort: "medium" } });
  });

  it("reads model and effort from env, and options override env", async () => {
    vi.stubEnv("ANTHROPIC_MODEL", "claude-sonnet-5-5");
    vi.stubEnv("ANTHROPIC_EFFORT", "high");
    const a = fakeClient(response);
    await createAnthropicModel({ client: a.client }).generate(input);
    expect(a.create.mock.calls[0][0]).toMatchObject({
      model: "claude-sonnet-5-5",
      output_config: { effort: "high" },
    });

    const b = fakeClient(response);
    await createAnthropicModel({ client: b.client, model: "m", effort: "low" }).generate(input);
    expect(b.create.mock.calls[0][0]).toMatchObject({ model: "m", output_config: { effort: "low" } });
  });

  it("maps the first text block, stop reason and usage", async () => {
    const { client } = fakeClient(response);
    const out = await createAnthropicModel({ client }).generate(input);
    expect(out).toEqual({
      text: '{"a":1}',
      stopReason: "end_turn",
      usage: { input_tokens: 10, output_tokens: 20, cache_read_input_tokens: 5 },
    });
  });

  it("returns null text when there is no text block", async () => {
    const { client } = fakeClient({ ...response, stop_reason: "refusal", content: [] });
    const out = await createAnthropicModel({ client }).generate(input);
    expect(out.text).toBeNull();
    expect(out.stopReason).toBe("refusal");
  });

  it("propagates client errors", async () => {
    const create = vi.fn().mockRejectedValue(new Error("boom"));
    const client = { beta: { messages: { create } } } as unknown as Anthropic;
    await expect(createAnthropicModel({ client }).generate(input)).rejects.toThrow("boom");
  });
});
