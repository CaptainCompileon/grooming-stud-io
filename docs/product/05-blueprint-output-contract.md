# Blueprint – output kontrakt (JSON → UI karty)

| | |
|---|---|
| **Stav** | Draft v0.1, `schema_version: "1.0"` |
| **Schéma** | [`blueprint.schema.json`](./blueprint.schema.json) |
| **Súvisiace** | [PRD – P0-5, P0-6](./01-prd.md#7-requirements) · [Architektúra](./02-technical-architecture.md) |

Model vracia **len** JSON podľa schémy – žiadny voľný text. Každé pole má jasné miesto v UI. Názvy polí a enumy sú anglicky (stabilné pre kód), textový obsah je v jazyku používateľa (`locale`).

---

## 1. Dva možné výsledky

| `status` | `blueprint` | `photo_issues` | UI |
|---|---|---|---|
| `ok` | objekt | `[]` | Blueprint – 4 karty |
| `photo_issue` | `null` | ≥ 1 položka | Obrazovka „Vymeň túto fotku“ s konkrétnou inštrukciou; ostatné vstupy ostávajú |

## 2. Mapovanie polí na karty

### `observations` (neviditeľné / Karta 4)
Neutrálne pozorovania, z ktorých vychádzajú všetky odporúčania: `face_shape`, `contrast_level`, `undertone`, `body_frame`, `hair_notes` + `*_confidence`. Pri `low` confidence UI zobrazí jemnú poznámku („Pri tejto fotke si nie sme istí podtónom – paleta obsahuje bezpečné neutrály“).

### Karta 1 – Barber Cheat Sheet → `card_barber`
| UI prvok | Pole |
|---|---|
| Nadpis strihu | `cut_name` + `cut_name_local` |
| Tabuľka dĺžok | `top_length_mm`, `sides_length_mm`, `back_length_mm` (+ prepočet na číslo nástavca v UI: 3 mm ≈ #1, 6 mm ≈ #2, 9 mm ≈ #3, 12 mm ≈ #4 …) |
| Prechod, krk, textúra | `transition`, `neckline`, `texture_finish` |
| Kroky pre barbera | `instructions_for_barber[]` (číslovaný zoznam) |
| Styling | `styling_product.type`, `styling_product.how_to_apply` |
| Brada (voliteľné) | `beard` |
| „Prečo“ (zbaliteľné) | `why` |
| Akcie | **Kopírovať text** (plain-text šablóna z polí), **Uložiť ako obrázok** (PNG z DOM karty) |

### Karta 2 – Farebná paleta & Strihy → `card_style`
| UI prvok | Pole |
|---|---|
| 6 swatchov | `palette[]` → `hex` (farba), `name`, `where_to_wear` |
| Prečo táto paleta | `palette_why` |
| 3 kľúčové strihy | `key_cuts[]` → `item`, `fit`, `shopping_tip`, `why` |
| Čomu sa vyhnúť | `avoid[]` → `what`, `why` |

### Karta 3 – Grooming & Pleť → `card_grooming`
| UI prvok | Pole |
|---|---|
| Rutina krok 1 – 3 | `routine[]` → `step`, `when`, `product_type`, `why` |
| Cielený tip | `targeted_tip` → `area`, `tip`, `why` (`area: none` = skryť) |

### Karta 4 – Prečo to funguje → `card_why`
| UI prvok | Pole |
|---|---|
| Zhrnutie | `summary` |
| Body proporcií | `proportion_points[]` → `observation` → `implication` |
| Čo sme nevedeli posúdiť | `uncertainties[]` (skryť, ak prázdne) |

## 3. Pravidlá obsahu (enforced promptom + guardrails)

1. **Zákaz hodnotenia krásy** – žiadne skóre, poradie, „atraktívny“, „škaredý“, „problém“, „nedostatok“.
2. **Každé `why` = pozorovaná črta + pravidlo.** Zlé: *„Tento strih je moderný.“* Dobré: *„Tvoja tvár je skôr okrúhla – objem hore (40 mm) ju opticky predĺži a kratšie boky (6 mm) zúžia šírku v lícach.“*
3. **Konkrétnosť:** mm, hex, názvy strihov oblečenia. Žiadne „nos, čo ti sedí“.
4. **Žiadne značky ani odkazy na obchody** (v1) – len typ produktu.
5. **Pri neistote radšej bezpečné univerzálne odporúčanie** + záznam v `uncertainties`.

## 4. Guardrails na serveri

Validuje sa **každá** odpoveď (napr. `ajv` alebo `zod`), lebo nie všetky implementácie štruktúrovaného výstupu vynucujú `minItems`/`maxItems`/`pattern`:

- schéma platná, `status` ↔ `blueprint`/`photo_issues` konzistentné,
- `palette` presne 6, platné hex,
- `key_cuts` presne 3, `routine` presne 3 so `step` 1, 2, 3,
- regex blacklist hodnotiacich výrazov (SK/CZ/EN),
- pri zlyhaní 1× retry, potom `blueprint_error`.

## 5. Ukážka (skrátená)

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
      "hair_notes": "Husté, mierne vlnité vlasy, rovná línia čela."
    },
    "card_barber": {
      "cut_name": "Textured crop with low taper",
      "cut_name_local": "Krátky strih s textúrou hore a nízkym prechodom po bokoch",
      "top_length_mm": 40,
      "sides_length_mm": 6,
      "back_length_mm": 9,
      "transition": "low_taper",
      "neckline": "natural_tapered",
      "texture_finish": "Point cut hore pre textúru, matný finish, ofina mierne dopredu",
      "styling_product": { "type": "matte_clay", "how_to_apply": "Hrášok hliny do suchých vlasov, prstami dopredu a nahor." },
      "instructions_for_barber": [
        "Hore nechať ~40 mm, texturovať point cutom",
        "Boky 6 mm (#2), nízky taper nad uchom",
        "Zátylok prirodzene zúžený, nie rovná hrana"
      ],
      "beard": null,
      "why": "Okrúhla tvár: objem hore tvár opticky predĺži, kratšie boky zúžia šírku v lícach."
    },
    "card_style": {
      "palette": [
        { "name": "Olivová", "hex": "#6B7445", "where_to_wear": "top_near_face" },
        { "name": "Tmavomodrá", "hex": "#1F2A44", "where_to_wear": "any" },
        { "name": "Ťavia", "hex": "#C19A6B", "where_to_wear": "outerwear" },
        { "name": "Krémová", "hex": "#F2E8D5", "where_to_wear": "top_near_face" },
        { "name": "Tehlová", "hex": "#9C4A3A", "where_to_wear": "accent" },
        { "name": "Antracit", "hex": "#3A3A3C", "where_to_wear": "bottoms" }
      ],
      "palette_why": "Stredný kontrast a teplý podtón – zemité tóny ladia s pleťou, čierna a ostrá biela by kontrast prebili.",
      "key_cuts": [
        { "item": "Chino nohavice", "fit": "slim-straight, bez zúženia pri členku", "shopping_tip": "Nohavica má vyvážiť ramená – skús, či sa nelepí na lýtko.", "why": "Široké ramená + užší pás: rovnejšia nohavica vyvažuje hornú časť." },
        { "item": "Oxford košeľa", "fit": "regular v ramenách, mierne zúžená v páse", "shopping_tip": "Šev ramena presne na kosti ramena.", "why": "Bez vypchávok, ramená sú prirodzene široké." },
        { "item": "Tričko s okrúhlym výstrihom", "fit": "regular, rukáv končí v polovici bicepsu", "shopping_tip": "Z hrubšej bavlny (180 g/m² a viac).", "why": "Čistá línia bez zbytočného objemu hore." }
      ],
      "avoid": [
        { "what": "Saká s vypchatými ramenami", "why": "Ešte viac rozšíria hornú časť." },
        { "what": "Skinny džínsy", "why": "Zvýraznia nepomer horná/dolná časť tela." }
      ]
    },
    "card_grooming": {
      "routine": [
        { "step": 1, "when": "morning_and_evening", "product_type": "jemný gélový čistiaci prípravok", "why": "Odstráni maz bez vysušenia." },
        { "step": 2, "when": "morning", "product_type": "ľahký hydratačný krém s SPF 30", "why": "Hydratácia + ochrana pred UV, ktoré urýchľuje starnutie pleti." },
        { "step": 3, "when": "evening", "product_type": "hydratačný krém bez parfumu", "why": "Regenerácia cez noc." }
      ],
      "targeted_tip": { "area": "eyebrows", "tip": "Len zastrihnúť dlhé chĺpky a vytrhať medzi obočím; tvar nemeniť.", "why": "Čistejší pohľad bez upraveného vzhľadu." }
    },
    "card_why": {
      "summary": "Tvoja tvár je skôr okrúhla a postava má širšie ramená a užší pás. Odporúčania pridávajú výšku hore a čisté línie, ktoré proporcie vyvažujú, nie zakrývajú.",
      "proportion_points": [
        { "observation": "Šírka tváre v lícach ≈ dĺžka tváre", "implication": "Objem hore, kratšie boky" },
        { "observation": "Ramená výrazne širšie ako pás", "implication": "Bez vypchávok, rovnejšie nohavice" }
      ],
      "uncertainties": ["Podtón pleti – fotka bola pri umelom svetle."]
    }
  }
}
```
