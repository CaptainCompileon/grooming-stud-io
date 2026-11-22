# Barber Terminology & How to Write the Cheat Sheet

The Barber Cheat Sheet is shown **verbatim to a barber in SK/CZ**. Barbers there understand the English cut names; numbers must be unambiguous. Always give **mm**, and the guard number in parentheses.

## 1. Clipper guards ↔ mm

Guard numbering differs by brand. The "#" numbers below follow the common US convention; many EU clippers (and barbers) talk in mm directly. **mm is the source of truth.**

| Guard | mm (rounded) | Typical use |
|---|---|---|
| #0 (no guard, lever open) | ~1–1.5 | Bottom of a fade |
| #0.5 | 1.5 | Fade transitions |
| #1 | 3 | Short sides, buzz |
| #1.5 | 4.5 | Transitions |
| #2 | 6 | Classic short sides |
| #3 | 10 | Sides/back with coverage, buzz top |
| #4 | 13 | Longer sides, buzz top |
| #5 | 16 | |
| #6 | 19 | |
| #7 | 22 | |
| #8 | 25 | Longest clipper length; beyond = scissors |

BT-MM-1: Use these mm values in output: 0, 1, 3, 4, 6, 10, 13, 16, 19, 22, 25 for clipper lengths. For scissor lengths on top use multiples of 5 mm (e.g. 40, 45, 50).
BT-MM-2: `top_length_mm` = length of hair on top **at the front/crown after cutting**, not styled height.
BT-MM-3: For a fade/taper, `sides_length_mm` = the length at the **top of the sides** (where it meets the top/blend), and the bottom length goes into the instructions (e.g. "taper from 6 mm down to 1.5 mm at the neckline").
BT-MM-4: In the UI, the guard number is derived from mm; the model outputs only mm.

## 2. Vocabulary (use these exact terms)

**Transitions** (`transition` enum)
- `low_taper` – length shortens only at the sideburns and neckline; most conservative, grows out well.
- `mid_taper` / `high_taper` – same, starting higher.
- `low_fade` – blends down to skin/very short just above the ear and at the nape, starting low.
- `mid_fade` – starts at temple level.
- `high_fade` – starts near the parietal ridge (top corner of the head); highest contrast, highest maintenance.
- `scissor_over_comb` – sides cut with scissors, no clipper fade; softer, longer sides.
- `none` – one length / no graduated transition (e.g. uniform buzz).

BT-VOC-1: **Taper vs. fade:** a taper keeps some length and only shortens at the edges; a fade goes down to skin or near-skin. When in doubt for `minimal` style or for oblong/heart faces → taper.
BT-VOC-2: "Skin fade" / "bald fade" = fade to 0 mm. "Drop fade" = fade that drops lower behind the ear (good for curls and when the back needs to stay longer).

**Necklines** (`neckline` enum)
- `natural_tapered` – follows natural hairline, faded. Default; grows out best.
- `rounded` – softened corners.
- `squared` / `blocked` – hard straight line; sharper, needs frequent touch-ups, can make a thick neck look wider.

**Top techniques** (for `texture_finish`)
- **Point cutting** – scissors cut into the ends vertically → texture, less bulk; standard for textured crop.
- **Texturising / slide cutting** – removes weight in thick hair.
- **Thinning shears** – reduce bulk; **avoid on curly hair** (frizz) and on fine/thin hair.
- **Disconnected** – no blend between top and sides; streetwear look, more styling needed.
- **Line-up / edge-up / shape-up** – crisp hairline at forehead/temples with a trimmer.
- **Hard part** – shaved part line; streetwear, grows out fast – recommend rarely.

**Named cuts** (`cut_name`)
| Name | Top | Sides | Notes |
|---|---|---|---|
| Buzz cut | 3–13 mm | same or faded | Minimal; strongest for thinning hair |
| Crew cut | 15–30 mm, slightly longer at front | 3–10 mm taper | Clean, minimal |
| Ivy League | 30–50 mm, side part possible | 6–10 mm taper | Smart casual |
| Textured crop (French crop) | 25–50 mm, forward with a short fringe | 1.5–6 mm taper/fade | Most versatile; good for thinning (forward) |
| Side part / Classic taper | 50–70 mm | 6–13 mm taper | Smart casual |
| Quiff | 60–90 mm at front, shorter at crown | 3–10 mm | Adds height |
| Pompadour | 80–120 mm swept back | 3–10 mm | Big height; high maintenance |
| Slick back | 70–120 mm | 3–13 mm | Avoid on high forehead/thinning |
| Curly top / Curly fringe | 40–80 mm curls | low/drop fade or taper | For curly hair |
| Medium length / flow | 100 mm+ | scissor | Out of scope as a default for v1 persona; only if user's hair is already long |

## 3. Styling products (`styling_product.type`)

| Type | Hold / shine | For |
|---|---|---|
| `matte_clay` | medium–strong, matte | Textured crop, quiff; fine and thinning hair |
| `paste` | medium, low shine | Most short cuts, wavy hair |
| `pomade` | medium–strong, shine | Slick back, side part (water-based) – avoid on thinning |
| `sea_salt_spray` | light, matte, volume | Pre-styler for wavy/fine hair, messy looks |
| `cream` | light, natural | Curly hair, natural finish |
| `none` | – | Buzz, crew cut, `minimal` style |

BT-PROD-1: `how_to_apply` = amount + hair state + direction in one sentence. Example: "Pea-sized amount into dry hair, work from back to front, push the front up with fingers."

## 4. Writing `instructions_for_barber`

BT-INS-1: 3–5 short numbered lines, **imperative, one zone per line**, top → sides → back → finish.
BT-INS-2: Each line has a number (mm) or a named technique. No adjectives without a number ("short", "a bit longer" are forbidden on their own).
BT-INS-3: Include the "do not" when it matters (e.g. "No thinning shears – cut curls dry").
BT-INS-4: Language: user's locale, but keep established English terms (taper, fade, point cut, line-up) – barbers in SK/CZ use them.

Good example (sk):
1. Hore nechať 40 mm, texturovať point cutom, ofina dopredu.
2. Boky 6 mm, low taper – pri uchu a na krku do 1,5 mm.
3. Zátylok prirodzene zúžený (natural taper), bez rovnej hrany.
4. Bez zatvrdeného line-upu na čele.

Bad example: "Stredne krátko po bokoch, hore trochu dlhšie, moderne."
