import type { AnalyzeRequest } from "@/lib/analyze/request";
import type { BlueprintResponse, HairType, PhotoKey, PreferredStyle } from "@/lib/blueprint/types";

// The whole flow lives in page memory only: photos are never persisted anywhere.

export type Draft = {
  photos: Record<PhotoKey, string | null>;
  inputs: {
    height_cm: number | null;
    hair_type: HairType | null;
    preferred_style: PreferredStyle | null;
  };
};

type Inputs = Draft["inputs"];

export type FlowState =
  | { step: "consent" }
  | { step: "form"; draft: Draft }
  | { step: "loading"; draft: Draft }
  | { step: "result"; draft: Draft; response: BlueprintResponse }
  | { step: "error"; draft: Draft; message: string };

export type InputChange = {
  [F in keyof Inputs]: { field: F; value: Inputs[F] };
}[keyof Inputs];

export type SetInputAction = { type: "SET_INPUT" } & InputChange;

export type FlowAction =
  | { type: "CONSENT" }
  | { type: "SET_PHOTO"; key: PhotoKey; data: string | null }
  | SetInputAction
  | { type: "SUBMIT" }
  | { type: "SUCCEEDED"; response: BlueprintResponse }
  | { type: "FAILED"; message: string }
  | { type: "RETRY" }
  | { type: "REPLACE_PHOTOS" }
  | { type: "RESTART" };

export const PHOTO_KEYS: readonly PhotoKey[] = ["front", "profile", "full_body"];
export const MIN_HEIGHT_CM = 140;
export const MAX_HEIGHT_CM = 220;

export const emptyDraft: Draft = {
  photos: { front: null, profile: null, full_body: null },
  inputs: { height_cm: null, hair_type: null, preferred_style: null },
};

export const initialFlowState: FlowState = { step: "consent" };

export function isHeightValid(height: number | null): height is number {
  return (
    height !== null && Number.isInteger(height) && height >= MIN_HEIGHT_CM && height <= MAX_HEIGHT_CM
  );
}

export function hasAllPhotos(draft: Draft): boolean {
  return PHOTO_KEYS.every((key) => draft.photos[key] !== null);
}

export function isDraftComplete(draft: Draft): boolean {
  const { height_cm, hair_type, preferred_style } = draft.inputs;
  return hasAllPhotos(draft) && isHeightValid(height_cm) && hair_type !== null && preferred_style !== null;
}

export function toRequest(draft: Draft): AnalyzeRequest {
  const { front, profile, full_body } = draft.photos;
  const { height_cm, hair_type, preferred_style } = draft.inputs;
  if (
    front === null ||
    profile === null ||
    full_body === null ||
    !isHeightValid(height_cm) ||
    hair_type === null ||
    preferred_style === null
  ) {
    throw new Error("draft_incomplete");
  }
  return {
    photos: { front, profile, full_body },
    inputs: { height_cm, hair_type, preferred_style },
    measurements: null,
    locale: "sk",
  };
}

// Every action is valid only in specific steps; anywhere else it returns the
// same state object, so a stray dispatch (double tap, late response) is a no-op.
export function flowReducer(state: FlowState, action: FlowAction): FlowState {
  switch (action.type) {
    case "CONSENT":
      return state.step === "consent" ? { step: "form", draft: emptyDraft } : state;

    case "SET_PHOTO":
      if (state.step !== "form") return state;
      return {
        step: "form",
        draft: { ...state.draft, photos: { ...state.draft.photos, [action.key]: action.data } },
      };

    case "SET_INPUT":
      if (state.step !== "form") return state;
      return {
        step: "form",
        draft: { ...state.draft, inputs: { ...state.draft.inputs, [action.field]: action.value } },
      };

    case "SUBMIT":
      if (state.step !== "form" || !isDraftComplete(state.draft)) return state;
      return { step: "loading", draft: state.draft };

    case "SUCCEEDED":
      if (state.step !== "loading") return state;
      return { step: "result", draft: state.draft, response: action.response };

    case "FAILED":
      if (state.step !== "loading") return state;
      return { step: "error", draft: state.draft, message: action.message };

    case "RETRY":
      return state.step === "error" ? { step: "loading", draft: state.draft } : state;

    case "REPLACE_PHOTOS": {
      if (state.step !== "result" || state.response.status !== "photo_issue") return state;
      const photos = { ...state.draft.photos };
      for (const issue of state.response.photo_issues) photos[issue.photo] = null;
      return { step: "form", draft: { ...state.draft, photos } };
    }

    case "RESTART":
      return state.step === "consent" ? state : { step: "form", draft: emptyDraft };
  }
}
