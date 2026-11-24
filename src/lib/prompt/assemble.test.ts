import { describe, expect, it } from "vitest";
import type { AnalyzeRequest } from "../analyze/request";
import { buildSystemBlocks, buildUserContent } from "./assemble";

describe("buildSystemBlocks", () => {
  const blocks = buildSystemBlocks("sk");

  it("returns the prompt block without header or placeholders", () => {
    expect(blocks).toHaveLength(2);
    const text = (blocks[0] as { text: string }).text;
    expect(text).toContain("Slovak");
    expect(text).not.toContain("{{");
    expect(text).not.toContain("=== PROMPT ===");
    expect(text).not.toContain("Assembly at runtime");
    expect(blocks[0]).not.toHaveProperty("cache_control");
  });

  it("returns the cached knowledge base block without README", () => {
    const text = (blocks[1] as { text: string }).text;
    expect(text.startsWith("<knowledge_base>\n")).toBe(true);
    expect(text.endsWith("</knowledge_base>")).toBe(true);
    expect(text).toContain('<file name="face-shapes.md">');
    expect(text).not.toContain('name="README.md"');
    expect(blocks[1].cache_control?.type).toBe("ephemeral");
  });

  it("is cached per locale", () => {
    expect(buildSystemBlocks("sk")).toBe(blocks);
  });
});

describe("buildUserContent", () => {
  const req: AnalyzeRequest = {
    photos: { front: "AAA", profile: "BBB", full_body: "CCC" },
    inputs: { height_cm: 180, hair_type: "wavy", preferred_style: "casual" },
    measurements: null,
    locale: "sk",
  };

  it("orders photos then inputs", () => {
    const c = buildUserContent(req);
    expect(c.map((b) => b.type)).toEqual(["text", "image", "text", "image", "text", "image", "text"]);
    expect([0, 2, 4].map((i) => (c[i] as { text: string }).text)).toEqual([
      "Photo: front",
      "Photo: profile",
      "Photo: full_body",
    ]);
    expect(c[1]).toEqual({ type: "image", source: { type: "base64", media_type: "image/jpeg", data: "AAA" } });
    const last = (c[6] as { text: string }).text;
    expect(last).toBe("Inputs:\n" + JSON.stringify({ inputs: req.inputs, measurements: null }, null, 2));
  });

  it("appends corrections", () => {
    const c = buildUserContent(req, ["PALETTE: x"]);
    expect(c).toHaveLength(8);
    const t = (c[7] as { text: string }).text;
    expect(t.startsWith("Your previous answer failed validation:")).toBe(true);
    expect(t).toContain("- PALETTE: x");
    expect(t).toContain("Return a corrected answer.");
  });
});
