# Face Shapes → Haircut, Beard, Glasses

## 0. How to classify (from the FRONT photo, confirm with PROFILE)

Estimate four measurements relative to each other:
- **L** = face length (hairline to chin)
- **F** = forehead width (widest point of forehead)
- **C** = cheekbone width (widest point across cheekbones)
- **J** = jaw width (angle to angle)

| Shape | Signature | Typical ratios |
|---|---|---|
| `oval` | Length clearly > width, softly rounded jaw, cheekbones slightly widest | L ≈ 1.4–1.5 × C; F ≈ J, both slightly < C |
| `round` | Length ≈ width, soft jaw angles, full cheeks | L ≈ 1.0–1.2 × C; soft J |
| `square` | Length ≈ width, strong angular jaw, F ≈ C ≈ J | L ≈ 1.0–1.25 × C; sharp jaw angles |
| `oblong` | Clearly long and narrow, F ≈ C ≈ J | L ≥ 1.6 × C |
| `heart` | Wide forehead, narrowing to a narrow/pointed chin | F > C > J |
| `diamond` | Cheekbones dominant, narrow forehead AND narrow jaw | C > F and C > J |
| `triangle` | Jaw wider than forehead | J > C ≥ F |

**Classification rules**
- FS-CLS-1: Faces are often between two shapes. Pick the dominant one and set `face_shape_confidence: "medium"`. Recommendations should then suit **both** shapes (choose the overlap).
- FS-CLS-2: Head tilt, wide-angle selfie lenses (close distance) and beards distort the result. Selfie from < 50 cm makes the face look rounder/longer in the centre → lower confidence.
- FS-CLS-3: A full beard hides the jaw. Use the PROFILE photo and cheek line; if still unclear, confidence `low` and note it in `uncertainties`.
- FS-CLS-4: Never comment on weight. Fuller cheeks are described only as "the face reads rounder", without cause.

## 1. Universal principle

FS-GEN-1: **Haircut goal = move the visual silhouette toward an oval.** Add height where the face is short, add width where it is narrow, keep the sides tight where the face is wide, and soften where angles are very strong (only if the user does not want to emphasise them).

FS-GEN-2: The **side length** is the main lever on perceived width. Shorter sides (≤ 6 mm) = narrower face. Longer sides (≥ 12 mm or scissor) = wider face.

FS-GEN-3: The **top length and direction** is the main lever on perceived length. Volume up = longer face. Fringe forward/down = shorter face.

## 2. Per shape

### Oval (`oval`)
- FS-OVAL-1: Most cuts work. Choose by hair type and style preference; avoid only extremes that break balance (very heavy fringe covering forehead fully + very long sides).
- FS-OVAL-2: Good defaults: **classic short back & sides / side part** (top 50–70 mm, sides 9–12 mm taper), **textured crop** (top 30–45 mm), **quiff** (top 60–80 mm).
- Beard: any; light stubble 3–5 mm is the low-maintenance default.
- Glasses: most frames; avoid frames wider than the face.

### Round (`round`)
- FS-ROUND-1: **Add height on top, keep the sides short and tight.** Top 50–80 mm styled up/back (quiff, pompadour, faux hawk-like textured top) or textured crop with height (top 40–50 mm) pushed up rather than flat forward.
- FS-ROUND-2: Sides **3–6 mm with a mid or high taper/fade**; avoid width over the ears.
- FS-ROUND-3: Avoid: heavy blunt fringe straight down, bowl shapes, longer sides, centre parts with flat volume.
- FS-ROUND-4: An **angular element** helps counter the softness: a defined side part, or a crisp line-up at the temples (only if the hairline is strong – a line-up on a receding hairline exposes it).
- Beard: **longer on the chin, shorter on the cheeks** (chin 10–20 mm, cheeks 3–6 mm, clean cheek line slightly lowered) to elongate. Avoid full round beards with puffy sides.
- Glasses: rectangular/angular frames, wider than tall.

### Square (`square`)
- FS-SQUARE-1: The jaw is a strong feature; most cuts work. Two options: **emphasise** (short, clean: crew cut, buzz 3–9 mm with fade, textured crop) or **soften** (some texture and movement on top 50–70 mm, side part).
- FS-SQUARE-2: Avoid very boxy, flat-top-like shapes that repeat the square, and very long heavy sides that widen.
- Beard: stubble 3–5 mm emphasises the jaw; a short boxed beard 6–10 mm with a rounded chin softens.
- Glasses: round or oval frames soften.

### Oblong (`oblong`)
- FS-OBLONG-1: **Do not add height.** Keep top moderate (30–50 mm) with some **forward fringe or side-swept fringe** to shorten the face.
- FS-OBLONG-2: Sides **not too short**: 9–12 mm or scissor-over-comb, low taper only. Fades high up the head make the face look even longer.
- FS-OBLONG-3: Avoid: tall quiffs/pompadours, high skin fades, very short sides with a tall top.
- Beard: **fuller on the sides, shorter on the chin** (cheeks 6–10 mm, chin not longer than cheeks) to add width.
- Glasses: deeper frames with a strong top line (e.g. browline), oversized-ish.

### Heart (`heart`)
- FS-HEART-1: Reduce perceived forehead width; add perceived width at the jaw. **Medium length top (40–60 mm) with a textured fringe or side sweep**, not slicked tightly back.
- FS-HEART-2: Sides **6–12 mm, low taper**; avoid very tight high fades that make the top look wider still.
- Beard: **strongly recommended** if growth allows – a short full beard 6–12 mm adds jaw width and balances a narrow chin.
- Glasses: bottom-heavy or rimless/thin top line; avoid heavy browlines.

### Diamond (`diamond`)
- FS-DIAMOND-1: Soften the cheekbones by **adding some width at the forehead and chin**. Top 50–70 mm with fringe or side sweep; textured, not slicked.
- FS-DIAMOND-2: Sides **6–12 mm**, avoid very high skin fades (they expose the cheekbone width).
- Beard: fuller on the chin (8–15 mm) to add jaw width.
- Glasses: oval or browline frames.

### Triangle (`triangle`)
- FS-TRIANGLE-1: Add width and volume on the **upper half**. Top 50–70 mm with volume and texture, sides 9–12 mm (not skin).
- FS-TRIANGLE-2: Avoid very short tops (buzz) with a wide jaw – emphasises the base.
- Beard: keep short and tight on the jaw (stubble 3–5 mm); avoid boxy wide beards.
- Glasses: frames with emphasis on the top half (browline, cat-eye-like masculine variants).

## 3. Modifiers – hair type (`inputs.hair_type`)

- FS-HT-STRAIGHT: Fine straight hair lies flat. Height needs texture (point cutting) and a matte clay or texturising powder; avoid long heavy tops that collapse. Medium/thick straight hair holds quiffs well.
- FS-HT-WAVY: Ideal for textured crops and messy quiffs; keep top 40–70 mm, use sea salt spray or light cream. Avoid very short sides that create a "mushroom" if top is long and fluffy – use a gradual taper.
- FS-HT-CURLY: Work **with** curls. Keep curl length on top (≥ 40–60 mm to form curls), sides tapered (low/mid taper 6–12 mm or drop fade). Ask the barber to cut curls dry or with scissors (**no thinning shears**). Product: curl cream. Avoid very short top that turns curls into frizz.
- FS-HT-THINNING:
  - FS-HT-THIN-1: **Shorter is better.** Buzz cut (top 6–12 mm) with a fade, or a short textured crop with a forward fringe (top 20–40 mm). Longer hair over thin areas emphasises density contrast.
  - FS-HT-THIN-2: Never recommend a comb-over or slicking back over a receding hairline.
  - FS-HT-THIN-3: Matte products only (shine reveals scalp).
  - FS-HT-THIN-4: If hairline is significantly receded, a full beard (6–12 mm) balances the head.
  - FS-HT-THIN-5: Phrase neutrally: "density is lower at the crown/temples", never "balding problem".

## 4. Other modifiers

- FS-MOD-GLASSES: If the user wears glasses in the photo, mention frame shape guidance in `card_why.proportion_points` only if relevant; do not make glasses the focus.
- FS-MOD-EARS: Prominent ears → avoid skin fades right at the ear; keep sides 9 mm+ around the ears.
- FS-MOD-NECK: Short neck → tapered natural neckline; long neck → slightly fuller back (9–12 mm).
- FS-MOD-COWLICK: Visible crown cowlick → keep crown ≥ 25 mm so it lies down, or very short (≤ 6 mm).
- FS-MOD-FOREHEAD: High forehead → avoid slicked-back; use fringe/side sweep. Low forehead → push hair up/back.
- FS-MOD-MAINTENANCE: Fades need a touch-up every 2–3 weeks, tapers every 3–5 weeks, scissor cuts every 4–6 weeks. Mention it in `card_barber.why` if the user's style is `minimal` (prefer tapers over skin fades).

## 5. Style preference (`inputs.preferred_style`) – haircut bias

| Style | Bias |
|---|---|
| `casual` | Textured crop, messy quiff, low taper; relaxed finish |
| `smart_casual` | Side part or short quiff, low/mid taper, natural matte finish |
| `streetwear` | Mid/high fade, textured crop, sharper line-up, more contrast between top and sides |
| `minimal` | Low-maintenance: buzz with taper, short textured crop, crew cut; no daily styling or 1 product |

FS-STYLE-1: Style preference **never overrides** a proportion rule. If it conflicts (e.g. `streetwear` + oblong face wants a high fade), choose the version that respects the proportion rule (mid → low drop fade) and explain the trade-off in `why`.
