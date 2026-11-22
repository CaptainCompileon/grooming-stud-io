# Body Proportions → Fit, Key Cuts, What to Avoid

## 0. How to assess (FULL BODY photo + `inputs.height_cm`)

Estimate visually (no exact numbers in v1; MediaPipe will provide ratios in v2 via `measurements`):
- **S** = shoulder width
- **W** = waist width
- **H** = hip width
- **Leg ratio** = legs vs. torso length (crotch point relative to half of height)

| `body_frame` | Signature |
|---|---|
| `inverted_triangle` | S clearly > W; athletic V-shape; broad chest |
| `trapezoid` | S slightly > W; balanced, mild taper (the "default" well-proportioned frame) |
| `rectangle` | S ≈ W ≈ H; straight, little taper |
| `triangle` | H or W > S; narrower shoulders |
| `oval` | W > S and W > H; weight carried around the midsection |

BP-CLS-1: Loose clothing, camera tilt, close distance and wide-angle lenses distort proportions. If the photo is shot from below/above or clothing hides the waist, `body_confidence: "low"` and add an `uncertainties` entry.
BP-CLS-2: Never comment on weight or fitness. Describe only relationships ("shoulders are wider than the waist").
BP-CLS-3: If `measurements` (MediaPipe) is present, it overrides visual estimation.

**Height bands** (European men; average ~180 cm)
| Band | Height |
|---|---|
| Short | < 172 cm |
| Average | 172–186 cm |
| Tall | > 186 cm |

## 1. Universal fit rules (apply to everyone)

- BP-FIT-1: **Shoulder seam sits exactly on the shoulder bone.** This is the #1 fitting-room check for shirts, tees, jackets.
- BP-FIT-2: **T-shirt sleeve ends mid-bicep**; hem ends at mid-fly / just covering the belt.
- BP-FIT-3: **Shirt** – you can pinch ~3–5 cm of fabric at the waist, not more. Sleeve cuff reaches the base of the thumb.
- BP-FIT-4: **Trousers** – sit on the waist without a belt; no/slight break (fabric just touches the shoe). Slim-straight is the default leg.
- BP-FIT-5: **Jacket** – closes without X-shaped pulling at the button; sleeve shows ~1 cm of shirt cuff.
- BP-FIT-6: Fit beats price. One tailored alteration (taking in a shirt, hemming trousers) is worth more than a more expensive item.

## 2. By body frame

### Inverted triangle (`inverted_triangle`) – broad shoulders, narrow waist
- BP-INV-1: **Do not add width on top.** Avoid padded shoulders, epaulettes, horizontal chest stripes, bulky chest pockets.
- BP-INV-2: **Balance the lower half**: slim-straight or straight trousers (not skinny), chinos, straight dark denim, medium-weight fabrics.
- BP-INV-3: V-neck or henley over crew neck if the chest looks very broad; unstructured/soft-shoulder jackets.
- BP-INV-4: Avoid: **skinny jeans** (exaggerate top-heavy look), very tight tees sized for the chest that pull at the shoulders.
- Key cuts: straight/slim-straight chinos · soft-shoulder overshirt or unstructured blazer · regular-fit tee with sleeves that fit the arm.

### Trapezoid (`trapezoid`) – balanced
- BP-TRAP-1: Most cuts work; emphasise the natural balance with **slim (not skinny) fits** and structured basics.
- Key cuts: slim-fit Oxford shirt · slim-straight chinos/denim · lightly structured blazer or bomber/trucker jacket.

### Rectangle (`rectangle`) – straight, little taper
- BP-RECT-1: **Create shoulder emphasis and waist definition.** Structured shoulders (lightly padded blazer, field jacket, trucker jacket), layering on top, horizontal details at chest level are fine.
- BP-RECT-2: Slightly tapered trousers; tuck shirts in or use shorter hems to define the waist.
- BP-RECT-3: Avoid: very boxy oversized tops with straight wide trousers (no shape at all).
- Key cuts: structured-shoulder jacket · slim-fit shirt tucked or cropped · tapered chinos.

### Triangle (`triangle`) – narrower shoulders, wider hips/waist
- BP-TRI-1: **Add width and visual interest on top**: structured shoulders, layers (shirt + overshirt), lighter/brighter colours on top, darker on the bottom.
- BP-TRI-2: Straight-leg, dark trousers; avoid tapered-to-ankle or skinny cuts (accentuate hips) and light-coloured bottoms.
- BP-TRI-3: Avoid: tight tees with nothing over them; slim drop-shoulder oversized tops (make shoulders look narrower).
- Key cuts: structured blazer/field jacket · layered shirt + overshirt · straight-leg dark trousers.

### Oval (`oval`) – midsection is widest
- BP-OVAL-1: **Create a clean vertical line.** Darker colours in the middle, open jacket/overshirt for a vertical line, V-neck or open collar.
- BP-OVAL-2: Fabrics with structure and drape (not clingy jersey); regular fit (not slim, not oversized); untucked shirts designed to be worn untucked with straight hem at mid-fly.
- BP-OVAL-3: Trousers with mid/high rise sitting at the natural waist, straight leg; avoid low-rise and skinny.
- BP-OVAL-4: Avoid: tight tees, horizontal stripes across the middle, belts that cut the midsection with high contrast.
- Key cuts: regular-fit structured shirt (untucked-length) · open overshirt/unstructured blazer · straight-leg mid-rise trousers.

## 3. Height modifiers

- BP-H-SHORT-1 (< 172 cm): **Lengthen the line.** Tonal outfits or low contrast between top and bottom; shorter jackets that end at the hips; no or minimal trouser break; slim-straight leg; avoid long coats below knee, wide trousers and big contrasting belts. Shirt hem just covering the belt.
- BP-H-SHORT-2: Vertical details (placket, open overshirt, V-neck) help.
- BP-H-TALL-1 (> 186 cm): **Break the line.** Contrast between top and bottom, layering, horizontal details, longer coats work well; avoid tops that are too short (check torso length – "tall" sizes) and trousers too short at the ankle.
- BP-H-TALL-2: Very slim + tall → avoid skinny fits (exaggerate length); straight or relaxed-straight trousers, textured fabrics add bulk.

## 4. Style preference (`inputs.preferred_style`) – which items to pick

Proportion rules decide **fit and silhouette**; style decides **which garments**.

| Style | Typical key items |
|---|---|
| `casual` | Tees, overshirts, chinos, straight denim, minimalist sneakers |
| `smart_casual` | Oxford shirts, knit polos, unstructured blazer, chinos, loafers/derbies |
| `streetwear` | Heavyweight tees, hoodies, cargo/relaxed trousers, bomber/trucker jackets – **fit rules still apply** (oversized must still be intentional at shoulders) |
| `minimal` | Plain tees in palette colours, one jacket, dark straight denim, white sneakers – capsule thinking |

BP-STYLE-1: For `streetwear` + `oval` or `triangle` frames, prefer relaxed straight over baggy tapered-to-cuff cargo, and structured outerwear over drop-shoulder hoodies.

## 5. Fields

- `key_cuts[i].fit` must be concrete: rise, leg shape, length/break, shoulder construction.
- `key_cuts[i].shopping_tip` must be a **checkable fitting-room test** (from §1 BP-FIT or frame-specific).
- `avoid[]` 2–3 items, each tied to the frame or height rule it violates.
