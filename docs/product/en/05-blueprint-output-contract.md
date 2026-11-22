> English translation of [the Slovak original](../05-blueprint-output-contract.md). The Slovak version is the source of truth.

# Blueprint – Output Contract (JSON → UI Cards)

| | |
|---|---|
| **Status** | Draft v0.1, `schema_version: "1.0"` |
| **Schema** | [`blueprint.schema.json`](../blueprint.schema.json) |
| **Related** | [PRD – P0-5, P0-6](./01-prd.md#7-requirements) · [Architecture](./02-technical-architecture.md) |

The model returns **only** JSON conforming to the schema – no free text. Every field has a clear place in the UI. Field names and enums are in English (stable for code); text content is in the user's language (`locale`).

---

## 1. Two Possible Outcomes

| `status` | `blueprint` | `photo_issues` | UI |
|---|---|---|---|
| `ok` | object | `[]` | Blueprint – 4 cards |
| `photo_issue` | `null` | ≥ 1 item | "Replace this photo" screen with a specific instruction; other inputs are kept |

## 2. Field-to-Card Mapping

### `observations` (hidden / Card 4)
Neutral observations that all recommendations are based on: `face_shape`, `contrast_level`, `undertone`, `body_frame`, `hair_notes` + `*_confidence`. With `low` confidence, the UI shows a subtle note ("We're not sure about your undertone from this photo – the palette includes safe neutrals").

### Card 1 – Barber Cheat Sheet → `card_barber`
| UI element | Field |
|---|---|
| Cut title | `cut_name` + `cut_name_local` |
| Length table | `top_length_mm`, `sides_length_mm`, `back_length_mm` (+ conversion to clipper guard number in the UI: 3 mm ≈ #1, 6 mm ≈ #2, 10 mm ≈ #3, 13 mm ≈ #4 …; full table in `knowledge-base/barber-terminology.md`) |
| Transition, neckline, texture | `transition`, `neckline`, `texture_finish` |
| Steps for the barber | `instructions_for_barber[]` (numbered list) |
| Styling | `styling_product.type`, `styling_product.how_to_apply` |
| Beard (optional) | `beard` |
| "Why" (collapsible) | `why` |
| Actions | **Copy text** (plain-text template built from the fields), **Save as image** (PNG from the card's DOM) |

### Card 2 – Color Palette & Cuts → `card_style`
| UI element | Field |
|---|---|
| 6 swatches | `palette[]` → `hex` (color), `name`, `where_to_wear` |
| Why this palette | `palette_why` |
| 3 key cuts | `key_cuts[]` → `item`, `fit`, `shopping_tip`, `why` |
| What to avoid | `avoid[]` → `what`, `why` |

### Card 3 – Grooming & Skin → `card_grooming`
| UI element | Field |
|---|---|
| Routine steps 1 – 3 | `routine[]` → `step`, `when`, `product_type`, `why` |
| Targeted tip | `targeted_tip` → `area`, `tip`, `why` (`area: none` = hide) |

### Card 4 – Why It Works → `card_why`
| UI element | Field |
|---|---|
| Summary | `summary` |
| Proportion points | `proportion_points[]` → `observation` → `implication` |
| What we couldn't assess | `uncertainties[]` (hide if empty) |

## 3. Content Rules (enforced by prompt + guardrails)

1. **No beauty rating** – no scores, rankings, "attractive", "ugly", "problem", "flaw".
2. **Every `why` = observed feature + rule.** Bad: *"This cut is modern."* Good: *"Your face is fairly round – volume on top (40 mm) visually lengthens it, and shorter sides (6 mm) narrow the width at the cheeks."*
3. **Specificity:** mm, hex, names of clothing cuts. No "wear what suits you".
4. **No brands or links to stores** (v1) – product type only.
5. **When uncertain, prefer a safe universal recommendation** + an entry in `uncertainties`.

## 4. Server-Side Guardrails

**Every** response is validated (e.g. `ajv` or `zod`), because not all structured-output implementations enforce `minItems`/`maxItems`/`pattern`:

- schema valid, `status` ↔ `blueprint`/`photo_issues` consistent,
- `palette` exactly 6, valid hex,
- `key_cuts` exactly 3, `routine` exactly 3 with `step` 1, 2, 3,
- regex blacklist of evaluative terms (SK/CZ/EN),
- on failure 1× retry, then `blueprint_error`.

## 5. Example (abridged)

```json
{
  "schema_version": "1.0",
  "status": "ok",
  "photo_issues": [],
  "blueprint": {
    "observations": {
      "face_shape": "round",
      "face_shape_confidence": "high",
      "contrast_level": "medium",
      "undertone": "warm",
      "color_confidence": "medium",
      "body_frame": "inverted_triangle",
      "body_confidence": "medium",
      "hair_notes": "Thick, slightly wavy hair, straight hairline."
    },
    "card_barber": {
      "cut_name": "Textured crop with low taper",
      "cut_name_local": "Short cut with texture on top and a low taper on the sides",
      "top_length_mm": 40,
      "sides_length_mm": 6,
      "back_length_mm": 10,
      "transition": "low_taper",
      "neckline": "natural_tapered",
      "texture_finish": "Point cut on top for texture, matte finish, fringe pushed slightly forward",
      "styling_product": { "type": "matte_clay", "how_to_apply": "A pea-sized amount of clay into dry hair, work it forward and up with your fingers." },
      "instructions_for_barber": [
        "Leave ~40 mm on top, texturize with point cutting",
        "Sides 6 mm (#2), low taper above the ear",
        "Nape naturally tapered, not a hard line"
      ],
      "beard": null,
      "why": "Round face: volume on top visually lengthens the face, shorter sides narrow the width at the cheeks."
    },
    "card_style": {
      "palette": [
        { "name": "Olive", "hex": "#6B7445", "where_to_wear": "top_near_face" },
        { "name": "Navy", "hex": "#1F2A44", "where_to_wear": "any" },
        { "name": "Camel", "hex": "#C19A6B", "where_to_wear": "outerwear" },
        { "name": "Cream", "hex": "#F2E8D5", "where_to_wear": "top_near_face" },
        { "name": "Brick", "hex": "#9C4A3A", "where_to_wear": "accent" },
        { "name": "Charcoal", "hex": "#3A3A3C", "where_to_wear": "bottoms" }
      ],
      "palette_why": "Medium contrast and a warm undertone – earthy tones harmonize with your skin; black and stark white would overpower the contrast.",
      "key_cuts": [
        { "item": "Chinos", "fit": "slim-straight, no taper at the ankle", "shopping_tip": "The trousers should balance your shoulders – check that they don't cling to your calves.", "why": "Broad shoulders + narrower waist: a straighter leg balances the upper body." },
        { "item": "Oxford shirt", "fit": "regular through the shoulders, slightly tapered at the waist", "shopping_tip": "Shoulder seam sits exactly on the shoulder bone.", "why": "No padding – your shoulders are naturally broad." },
        { "item": "Crew-neck T-shirt", "fit": "regular, sleeve ends at mid-bicep", "shopping_tip": "Heavier cotton (180 g/m² or more).", "why": "A clean line without extra bulk on top." }
      ],
      "avoid": [
        { "what": "Blazers with padded shoulders", "why": "They widen the upper body even further." },
        { "what": "Skinny jeans", "why": "They emphasize the imbalance between upper and lower body." }
      ]
    },
    "card_grooming": {
      "routine": [
        { "step": 1, "when": "morning_and_evening", "product_type": "gentle gel cleanser", "why": "Removes excess oil without drying out the skin." },
        { "step": 2, "when": "morning", "product_type": "lightweight moisturizer with SPF 30", "why": "Hydration + protection from UV, which accelerates skin aging." },
        { "step": 3, "when": "evening", "product_type": "fragrance-free moisturizer", "why": "Overnight recovery." }
      ],
      "targeted_tip": { "area": "eyebrows", "tip": "Just trim the long hairs and pluck between the brows; don't change the shape.", "why": "A cleaner look without looking over-groomed." }
    },
    "card_why": {
      "summary": "Your face is fairly round, and your build has broader shoulders and a narrower waist. The recommendations add height on top and clean lines that balance your proportions rather than hide them.",
      "proportion_points": [
        { "observation": "Face width at the cheeks ≈ face length", "implication": "Volume on top, shorter sides" },
        { "observation": "Shoulders noticeably wider than the waist", "implication": "No padding, straighter-leg trousers" }
      ],
      "uncertainties": ["Skin undertone – the photo was taken under artificial light."]
    }
  }
}
```
