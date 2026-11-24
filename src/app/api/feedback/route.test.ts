import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const post = (body: unknown) =>
  POST(
    new Request("http://localhost/api/feedback", {
      method: "POST",
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );

beforeEach(() => {
  vi.spyOn(console, "info").mockImplementation(() => {});
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("POST /api/feedback", () => {
  it("returns 204 and forwards to the webhook when configured", async () => {
    vi.stubEnv("FEEDBACK_WEBHOOK_URL", "https://hooks.example/x");
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const res = await post({ value: "up", text: "super", ref: "ig" });
    expect(res.status).toBe(204);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://hooks.example/x");
    expect(JSON.parse(init.body)).toEqual({
      value: "up",
      text: "super",
      ref: "ig",
    });
  });

  it("swallows webhook failures", async () => {
    vi.stubEnv("FEEDBACK_WEBHOOK_URL", "https://hooks.example/x");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")));
    expect((await post({ value: "down" })).status).toBe(204);
  });

  it("logs to console.info when no webhook is set", async () => {
    vi.stubEnv("FEEDBACK_WEBHOOK_URL", "");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    expect((await post({ value: "up" })).status).toBe(204);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(
      vi.mocked(console.info).mock.calls.some((c) => c[0] === "[feedback]"),
    ).toBe(true);
  });

  it("returns 400 for text longer than 1000 chars", async () => {
    expect((await post({ value: "up", text: "a".repeat(1001) })).status).toBe(
      400,
    );
  });

  it("returns 400 for a bad value, bad types or invalid JSON", async () => {
    expect((await post({ value: "meh" })).status).toBe(400);
    expect((await post({ value: "up", text: 5 })).status).toBe(400);
    expect((await post("nope")).status).toBe(400);
  });
});
