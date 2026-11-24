import { describe, expect, it } from "vitest";
import okFixture from "@/lib/blueprint/__fixtures__/blueprint-ok.sk.json";
import photoIssueFixture from "@/lib/blueprint/__fixtures__/photo-issue.sk.json";
import type { BlueprintResponse } from "@/lib/blueprint/types";
import {
  type Draft,
  type FlowState,
  emptyDraft,
  flowReducer,
  initialFlowState,
  isDraftComplete,
  toRequest,
} from "./flow";

const okResponse = okFixture as BlueprintResponse;
const photoIssueResponse = photoIssueFixture as BlueprintResponse;

const completeDraft: Draft = {
  photos: { front: "/9j/front", profile: "/9j/profile", full_body: "/9j/body" },
  inputs: { height_cm: 182, hair_type: "wavy", preferred_style: "smart_casual" },
};

const formWith = (draft: Draft): FlowState => ({ step: "form", draft });
const loading: FlowState = { step: "loading", draft: completeDraft };

describe("flowReducer", () => {
  it("starts at consent and CONSENT moves to an empty form", () => {
    expect(initialFlowState).toEqual({ step: "consent" });
    expect(flowReducer(initialFlowState, { type: "CONSENT" })).toEqual({
      step: "form",
      draft: emptyDraft,
    });
  });

  it("ignores SET_PHOTO in the consent step", () => {
    const next = flowReducer(initialFlowState, { type: "SET_PHOTO", key: "front", data: "/9j/x" });
    expect(next).toBe(initialFlowState);
  });

  it("SET_PHOTO sets and clears one photo in the form step", () => {
    const withPhoto = flowReducer(formWith(emptyDraft), {
      type: "SET_PHOTO",
      key: "profile",
      data: "/9j/p",
    });
    expect(withPhoto).toEqual(formWith({ ...emptyDraft, photos: { ...emptyDraft.photos, profile: "/9j/p" } }));
    const cleared = flowReducer(withPhoto, { type: "SET_PHOTO", key: "profile", data: null });
    expect(cleared).toEqual(formWith(emptyDraft));
  });

  it("SET_INPUT sets one input in the form step", () => {
    const next = flowReducer(formWith(emptyDraft), {
      type: "SET_INPUT",
      field: "hair_type",
      value: "curly",
    });
    expect(next).toEqual(formWith({ ...emptyDraft, inputs: { ...emptyDraft.inputs, hair_type: "curly" } }));
  });

  it("SUBMIT with an incomplete draft leaves the state unchanged", () => {
    const state = formWith({ ...completeDraft, photos: { ...completeDraft.photos, full_body: null } });
    expect(flowReducer(state, { type: "SUBMIT" })).toBe(state);
  });

  it("SUBMIT with a complete draft moves to loading with the same draft", () => {
    expect(flowReducer(formWith(completeDraft), { type: "SUBMIT" })).toEqual({
      step: "loading",
      draft: completeDraft,
    });
  });

  it("SUBMIT while loading returns the same state object (no second request)", () => {
    expect(flowReducer(loading, { type: "SUBMIT" })).toBe(loading);
  });

  it("ignores SET_PHOTO and SET_INPUT while loading", () => {
    expect(flowReducer(loading, { type: "SET_PHOTO", key: "front", data: null })).toBe(loading);
    expect(flowReducer(loading, { type: "SET_INPUT", field: "height_cm", value: 150 })).toBe(loading);
  });

  it("SUCCEEDED moves loading to result", () => {
    expect(flowReducer(loading, { type: "SUCCEEDED", response: okResponse })).toEqual({
      step: "result",
      draft: completeDraft,
      response: okResponse,
    });
  });

  it("SUCCEEDED with photo_issue also moves to result", () => {
    const next = flowReducer(loading, { type: "SUCCEEDED", response: photoIssueResponse });
    expect(next.step).toBe("result");
  });

  it("ignores a late SUCCEEDED outside loading", () => {
    const state = formWith(completeDraft);
    expect(flowReducer(state, { type: "SUCCEEDED", response: okResponse })).toBe(state);
  });

  it("FAILED moves to error, keeps the whole draft and stores the failure kind", () => {
    const next = flowReducer(loading, { type: "FAILED", kind: "network" });
    expect(next).toEqual({ step: "error", draft: completeDraft, kind: "network" });
  });

  it("RETRY from error goes back to loading with the same draft", () => {
    const error = flowReducer(loading, { type: "FAILED", kind: "analysis_failed" });
    const retried = flowReducer(error, { type: "RETRY" });
    expect(retried).toEqual({ step: "loading", draft: completeDraft });
    if (retried.step !== "loading") throw new Error("unreachable");
    expect(retried.draft).toBe(completeDraft);
  });

  it("ignores RETRY outside error", () => {
    const state = formWith(completeDraft);
    expect(flowReducer(state, { type: "RETRY" })).toBe(state);
  });

  it("BACK_TO_FORM from error returns to the form with the same draft", () => {
    const error = flowReducer(loading, { type: "FAILED", kind: "invalid_request" });
    const next = flowReducer(error, { type: "BACK_TO_FORM" });
    expect(next).toEqual(formWith(completeDraft));
    if (next.step !== "form") throw new Error("unreachable");
    expect(next.draft).toBe(completeDraft);
  });

  it.each<FlowState>([
    { step: "consent" },
    { step: "form", draft: completeDraft },
    { step: "loading", draft: completeDraft },
    { step: "result", draft: completeDraft, response: okResponse },
  ])("ignores BACK_TO_FORM in the $step step", (state) => {
    expect(flowReducer(state, { type: "BACK_TO_FORM" })).toBe(state);
  });

  it("REPLACE_PHOTOS after a photo_issue result clears only the named photos", () => {
    const result = flowReducer(loading, { type: "SUCCEEDED", response: photoIssueResponse });
    const next = flowReducer(result, { type: "REPLACE_PHOTOS" });
    expect(next).toEqual({
      step: "form",
      draft: {
        photos: { front: "/9j/front", profile: "/9j/profile", full_body: null },
        inputs: completeDraft.inputs,
      },
    });
  });

  it("ignores REPLACE_PHOTOS on an ok result", () => {
    const result = flowReducer(loading, { type: "SUCCEEDED", response: okResponse });
    expect(flowReducer(result, { type: "REPLACE_PHOTOS" })).toBe(result);
  });

  it("RESTART clears the draft and returns to an empty form", () => {
    const error = flowReducer(loading, { type: "FAILED", kind: "analysis_failed" });
    expect(flowReducer(error, { type: "RESTART" })).toEqual(formWith(emptyDraft));
  });

  it("RESTART does not skip consent", () => {
    expect(flowReducer(initialFlowState, { type: "RESTART" })).toBe(initialFlowState);
  });
});

describe("isDraftComplete", () => {
  it("is true only with 3 photos and 3 valid inputs", () => {
    expect(isDraftComplete(completeDraft)).toBe(true);
    expect(isDraftComplete(emptyDraft)).toBe(false);
    expect(
      isDraftComplete({ ...completeDraft, inputs: { ...completeDraft.inputs, preferred_style: null } }),
    ).toBe(false);
  });

  it("rejects a height outside 140–220 or a non-integer height", () => {
    const withHeight = (h: number) => ({ ...completeDraft, inputs: { ...completeDraft.inputs, height_cm: h } });
    expect(isDraftComplete(withHeight(139))).toBe(false);
    expect(isDraftComplete(withHeight(221))).toBe(false);
    expect(isDraftComplete(withHeight(180.5))).toBe(false);
    expect(isDraftComplete(withHeight(140))).toBe(true);
    expect(isDraftComplete(withHeight(220))).toBe(true);
  });
});

describe("toRequest", () => {
  it("builds the API request from a complete draft", () => {
    expect(toRequest(completeDraft)).toEqual({
      photos: completeDraft.photos,
      inputs: completeDraft.inputs,
      measurements: null,
      locale: "sk",
    });
  });

  it("throws on an incomplete draft", () => {
    expect(() => toRequest(emptyDraft)).toThrow();
  });
});
