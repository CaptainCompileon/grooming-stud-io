# Grooming Basics → 3-Step Routine & Targeted Tip

This is cosmetic, non-medical guidance. Never diagnose skin conditions. If something looks like a medical issue (inflamed acne, rashes, unusual moles), do not name it – at most add to `uncertainties`: "For skin concerns, a dermatologist is the right person to ask."

## 0. What to observe (FRONT photo, daylight)

- Visible shine (T-zone) → likely oily/combination.
- Flaking, dull/rough look → likely dry.
- Redness on cheeks/nose → likely sensitive/reactive.
- Visible blemishes → acne-prone tendency.
- Nothing notable / photo quality insufficient → default "normal/unknown" routine.

GB-OBS-1: Lighting and compression hide skin texture. If unsure, use the **default routine** (§1) – it is safe for everyone.
GB-OBS-2: Describe neutrally: "Skin shows some shine around the forehead and nose", never "bad/problematic skin".

## 1. Default routine (normal/unknown skin) – the baseline

| Step | When | Product type | Why |
|---|---|---|---|
| 1 | morning_and_evening | Gentle gel or cream cleanser (non-foaming or low-foam) | Removes oil and dirt without stripping the skin barrier |
| 2 | morning | Light moisturiser with SPF 30+ (or moisturiser + separate SPF) | Daily UV protection is the single most effective step against premature skin ageing and uneven tone |
| 3 | evening | Fragrance-free moisturiser | Repairs the skin barrier overnight |

GB-RTN-1: **Always exactly 3 steps.** Simplicity is the product; the persona will not follow 6 steps.
GB-RTN-2: Use **generic product types**, never brands (v1).
GB-RTN-3: SPF is in every routine.

## 2. Variants by skin tendency (swap the relevant step)

- GB-OILY: Step 1 gel cleanser (can contain salicylic acid / BHA); step 2 oil-free gel moisturiser with SPF 30+; step 3 light oil-free gel moisturiser (niacinamide is a good ingredient to look for). Oily skin still needs moisturiser – skipping it does not reduce shine.
- GB-DRY: Step 1 cream cleanser in the evening (in the morning, rinsing with water is enough); step 2 richer moisturiser with SPF 30+; step 3 richer moisturiser with ceramides.
- GB-SENSITIVE: Fragrance-free everything; mineral SPF; no exfoliating acids in the first month.
- GB-ACNE-PRONE: Step 1 cleanser with salicylic acid (BHA) in the evening, gentle in the morning; non-comedogenic moisturiser; do not recommend prescription actives.
- GB-SHAVE: If the user shaves daily (clean-shaven in photo), mention in a step's `why` that moisturiser after shaving reduces irritation; alcohol-free aftershave balm can replace step 3 moisturiser in the morning.

## 3. Targeted tip (`targeted_tip.area`) – pick ONE, the highest-impact

Priority order: pick the first that clearly applies.

1. **`eyebrows`** – if brows are very bushy, have stray hairs between them, or long hairs that stick out.
   - GB-BROW-1: "Trim long hairs with small scissors after combing up; remove hairs between the brows only. Do not change the shape or thin the arch."
   - GB-BROW-2: Never recommend shaping, threading arches or tinting for v1 persona – the goal is "groomed, not done".
2. **`under_eyes`** – if visible dark circles or puffiness.
   - GB-EYE-1: "Sleep 7–9 h, cold compress (spoon/cold water) 1–2 min in the morning, eye cream with caffeine for puffiness; SPF on the under-eye area."
   - GB-EYE-2: Dark circles are often genetic/structural – promise improvement, not removal. Wording: "can soften", not "will remove".
   - GB-EYE-3: Pair with colour advice: a lighter colour near the face (see color-contrast CC-AVOID-4).
3. **`beard_line`** – if beard/stubble exists with an undefined neckline or cheek line.
   - GB-BEARD-1: **Neckline: 1–2 fingers above the Adam's apple**, follow a curve from behind the earlobe down to that point. Never shave the neckline up to the jaw (creates a "double chin" effect, shrinks the jaw).
   - GB-BEARD-2: **Cheek line: natural or slightly lowered**, clean stray hairs above it; avoid razor-sharp high cheek lines unless streetwear.
   - GB-BEARD-3: Stubble length 3–5 mm with a trimmer every 2–3 days; short beard 6–12 mm trimmed weekly.
   - GB-BEARD-4: Beard shape must follow face-shapes rules (round → longer chin; oblong → fuller sides; heart/diamond → fuller chin).
   - GB-BEARD-5: Patchy beard → keep to stubble (3 mm) or clean-shaven; never recommend growing a full beard over clearly patchy areas.
4. **`skin_texture`** – if visible shine or roughness is the dominant issue: one actionable tip (e.g. "blotting papers mid-day" or "exfoliate gently 1×/week with a BHA product").
5. **`none`** – nothing notable; UI hides the tip.

## 4. Hair care (optional mention in `card_barber.styling_product.how_to_apply` or `why`)

- GB-HAIR-1: Shampoo 2–3×/week, conditioner every wash; daily shampooing dries hair and makes styling harder.
- GB-HAIR-2: Style on dry or towel-dried hair depending on product (clay/paste dry; sea salt/cream damp).
- GB-HAIR-3: Thinning hair: avoid heavy conditioners at roots; matte products only.

## 5. Small high-impact items (use only if visible and relevant; otherwise skip)

- Nose/ear hair visible → trimmer weekly.
- Lips visibly chapped → lip balm with SPF.
- Neck hair below the beard/neckline → shave weekly.
These may go into `targeted_tip.tip` only if they are the single highest-impact item.
