# Colour Contrast & Undertone → Palette

## 0. How to assess (FRONT photo, daylight preferred)

**Contrast level** = how different the darkest and lightest features are: hair, eyebrows, beard vs. skin (and eye colour secondarily).

| Level | Signature | Examples |
|---|---|---|
| `low` | Hair and skin close in value | Light skin + light/dark-blond hair; deep skin + black hair with similar depth |
| `medium` | Noticeable but moderate difference | Light-medium skin + medium/dark-brown hair; olive skin + dark brown hair |
| `high` | Strong difference | Fair skin + black/very dark hair; deep skin + bright eye whites, grey/white hair on darker skin |

CC-ASSESS-1: Judge by **value (light/dark)**, not by hue. Squint mentally: does the head read as one tone or as strong light/dark blocks?
CC-ASSESS-2: Grey/silver hair raises contrast on darker skin and lowers it on fair skin.
CC-ASSESS-3: A dark beard counts as a dark feature and can raise contrast by one level.

**Undertone** (`undertone`)
- `warm` – golden, peachy, olive-golden; veins look greenish; gold reads better than silver.
- `cool` – pink, rosy, bluish; veins look bluish; silver reads better than gold; burns easily.
- `neutral` – mix; both work.
- `uncertain` – lighting makes it impossible to judge.

CC-ASSESS-4: **Indoor warm light, phone beauty filters and white balance shift skin tone strongly.** If the photo is not in daylight or the skin/background shows a colour cast, set `undertone: "uncertain"` and `color_confidence: "low"` or `"medium"`, and build the palette from the **undertone-safe set** (§3). Never guess confidently.
CC-ASSESS-5: Never mention or infer ethnicity. Describe only light/dark values and undertone.

## 1. Universal palette principles

CC-GEN-1: **Match contrast in the outfit to contrast in the face.** High-contrast person → high-contrast combinations (navy + white, black + light grey). Low-contrast → tonal, softer combinations (beige + olive, grey + light blue).
CC-GEN-2: **The colour next to the face matters most** (t-shirt, shirt, sweater, jacket collar). Put the best colours there (`where_to_wear: "top_near_face"`).
CC-GEN-3: Bottoms can be neutral almost always (navy, charcoal, stone, dark denim).
CC-GEN-4: Palette of 6 = **3 neutrals + 2 near-face colours + 1 accent**. This makes the list directly buyable as a capsule.
CC-GEN-5: Give each colour a **common, findable name** (navy, olive, stone, burgundy…), not designer names.

## 2. Palettes by contrast × undertone

Hex values are representative swatches; choose 6 per §1 rule CC-GEN-4.

### Low contrast
- Warm: camel `#C19A6B`, olive `#6B7445`, stone `#D8CFC0`, cream `#F2E8D5`, warm taupe `#8B7D6B`, soft rust `#B5653A`, khaki `#A89F80`.
- Cool: soft grey `#A7ADB5`, dusty blue `#7D93AE`, light grey-blue `#C9D3DE`, slate `#5A6573`, sage `#9CAF9C`, muted lavender-grey `#A69FB5`.
- CC-LOW-1: **Avoid** pure black + pure white combinations and very saturated colours (they overpower the face). Prefer charcoal over black, off-white over optic white.

### Medium contrast
- Warm: olive `#6B7445`, navy `#1F2A44`, camel `#C19A6B`, cream `#F2E8D5`, brick `#9C4A3A`, charcoal `#3A3A3C`, forest `#2F4A3A`.
- Cool: navy `#1F2A44`, mid-grey `#7A7F87`, light blue `#A9C4E2`, burgundy `#6D2333`, white `#F7F7F5`, charcoal `#3A3A3C`, teal `#2E6A6E`.
- CC-MED-1: Most flexible. Avoid only extremes: neon/very bright colours near the face.

### High contrast
- Warm: black-brown `#2B2321`, cream `#F2E8D5`, deep olive `#4A5230`, rust `#A0522D`, navy `#1F2A44`, mustard (accent) `#C9A227`.
- Cool: black `#111111`, white `#FFFFFF`, navy `#1F2A44`, cobalt `#2649A6`, burgundy `#6D2333`, emerald `#1F6B4E`, cool grey `#8C9198`.
- CC-HIGH-1: Can wear strong contrast and saturated colours. **Avoid** washed-out pastels and beige/tan near the face (they flatten).

## 3. Undertone-safe set (use when `undertone: "uncertain"`)

Navy `#1F2A44`, charcoal `#3A3A3C`, mid-grey `#7A7F87`, off-white `#F5F3EE`, olive `#6B7445`, burgundy `#6D2333`, teal `#2E6A6E`. These work for nearly everyone; adjust only by contrast level (low contrast → drop strongest pair, prefer mid-grey over black).

## 4. Things to avoid (feed `card_style.avoid` when relevant)

- CC-AVOID-1: Colour too close to skin tone near the face (e.g. beige on light-beige skin) → face "disappears".
- CC-AVOID-2: Low contrast person in black-and-white outfits → harsh, tired look.
- CC-AVOID-3: Strong cool pink skin + bright red/orange near the face → emphasises redness. Prefer navy, grey, green.
- CC-AVOID-4: Visible under-eye darkness + very dark colours right at the neck → emphasises shadows; add a lighter layer near the face.

## 5. `palette_why` template

"[Contrast level] + [undertone] → [principle]. That is why [colours] work near your face and [what] is better kept away from it."
Example: "Medium contrast and warm undertone – earthy tones and navy match your skin; pure black and optic white would overpower it."
