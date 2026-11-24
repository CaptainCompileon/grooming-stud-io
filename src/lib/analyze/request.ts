import type { HairType, Locale, PhotoKey, PreferredStyle } from "../blueprint/types";

export interface AnalyzeRequest {
  photos: Record<PhotoKey, string>;
  inputs: { height_cm: number; hair_type: HairType; preferred_style: PreferredStyle };
  measurements: null;
  locale: Locale;
}
