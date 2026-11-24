// Mirrors docs/product/blueprint.schema.json (field names must match exactly).

export type PhotoKey = "front" | "profile" | "full_body";
export type HairType = "straight" | "wavy" | "curly" | "thinning";
export type PreferredStyle = "casual" | "smart_casual" | "streetwear" | "minimal";
export type Locale = "sk";

export type Confidence = "high" | "medium" | "low";

export interface PhotoIssue {
  photo: PhotoKey;
  problem:
    | "no_person"
    | "multiple_people"
    | "too_dark"
    | "blurry"
    | "cropped"
    | "wrong_angle"
    | "face_obstructed"
    | "other";
  fix_instruction: string;
}

export interface Observations {
  face_shape: "oval" | "round" | "square" | "oblong" | "heart" | "diamond" | "triangle";
  face_shape_confidence: Confidence;
  contrast_level: "low" | "medium" | "high";
  undertone: "warm" | "cool" | "neutral" | "uncertain";
  color_confidence: Confidence;
  body_frame: "inverted_triangle" | "rectangle" | "triangle" | "oval" | "trapezoid";
  body_confidence: Confidence;
  hair_notes: string;
}

export interface BarberCheatSheet {
  cut_name: string;
  cut_name_local: string;
  top_length_mm: number;
  sides_length_mm: number;
  back_length_mm: number;
  transition:
    | "low_taper"
    | "mid_taper"
    | "high_taper"
    | "low_fade"
    | "mid_fade"
    | "high_fade"
    | "scissor_over_comb"
    | "none";
  neckline: "natural_tapered" | "rounded" | "squared" | "blocked";
  texture_finish: string;
  styling_product: {
    type: "matte_clay" | "paste" | "pomade" | "sea_salt_spray" | "cream" | "none";
    how_to_apply: string;
  };
  instructions_for_barber: string[];
  beard: { style: string; length_mm: number; note: string } | null;
  why: string;
}

export interface PaletteColor {
  name: string;
  hex: string;
  where_to_wear: "top_near_face" | "outerwear" | "bottoms" | "accent" | "any";
}

export interface ClothingCut {
  item: string;
  fit: string;
  shopping_tip: string;
  why: string;
}

export interface CardStyle {
  palette: PaletteColor[];
  palette_why: string;
  key_cuts: ClothingCut[];
  avoid: { what: string; why: string }[];
}

export interface RoutineStep {
  step: number;
  when: "morning" | "evening" | "morning_and_evening";
  product_type: string;
  why: string;
}

export interface CardGrooming {
  routine: RoutineStep[];
  targeted_tip: {
    area: "eyebrows" | "under_eyes" | "beard_line" | "skin_texture" | "none";
    tip: string;
    why: string;
  };
}

export interface CardWhy {
  summary: string;
  proportion_points: { observation: string; implication: string }[];
  uncertainties: string[];
}

export interface Blueprint {
  observations: Observations;
  card_barber: BarberCheatSheet;
  card_style: CardStyle;
  card_grooming: CardGrooming;
  card_why: CardWhy;
}

export interface BlueprintResponse {
  schema_version: "1.0";
  status: "ok" | "photo_issue";
  photo_issues: PhotoIssue[];
  blueprint: Blueprint | null;
}
