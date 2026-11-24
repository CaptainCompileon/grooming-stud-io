# Backlog – Týždeň 1: „Mozog“ a kalibrácia pravidiel

| | |
|---|---|
| **Cieľ týždňa** | Prompt + knowledge base dávajú na 10 rôznych fotkách výstupy, ktoré nie sú generické a prejdú bránou Fázy 1 |
| **Kapacita** | ~20 h (víkend + 2 – 3 večery) |
| **Súvisiace** | [Implementačný plán – Fáza 1](./03-implementation-plan.md#fáza-1--mozog-a-kalibrácia-pravidiel-týždeň-1) · [Knowledge base](../../knowledge-base/README.md) · [System prompt](../../prompts/system.md) · [Schéma](./blueprint.schema.json) |

**Legenda stavu:** ✅ hotové · 📝 draft v0.1 je v repe, treba review · ⬜ todo
**Odhad:** v hodinách (h). Spolu ⬜ + 📝 ≈ 16 h.

---

## Prehľad

| ID | Ticket | Stav | Odhad | Závisí od | Blokuje bránu? |
|---|---|---|---|---|---|
| W1-01 | ADR: výber modelu / poskytovateľa | 📝 | 3 h | – | **Áno** |
| W1-02 | Golden set: 10 fotiek + matica pokrytia | ⬜ | 2 h | – | **Áno** |
| W1-03 | Review KB: `face-shapes.md` | 📝 | 1 h | – | Áno |
| W1-04 | Review KB: `color-contrast.md` | 📝 | 1 h | – | Áno |
| W1-05 | Review KB: `body-proportions.md` | 📝 | 1 h | – | Áno |
| W1-06 | Review KB: `grooming-basics.md` | 📝 | 0,5 h | – | Áno |
| W1-07 | Review KB: `barber-terminology.md` | 📝 | 0,5 h | – | Áno |
| W1-08 | Review systémového promptu | 📝 | 1 h | W1-03…07 | Áno |
| W1-09 | JSON Schema výstupu v1.0 | ✅ | – | – | – |
| W1-10 | Guardrails modul | ✅ | 2 h | W1-09 | **Áno** |
| W1-11 | Offline eval CLI | ✅ | 3 h | W1-01, W1-10 | **Áno** |
| W1-12 | Hodnotiaca rubrika + hárok | ⬜ | 0,5 h | – | Áno |
| W1-13 | Kalibrácia: 2 – 3 iterácie pravidiel | ⬜ | 3 h | W1-11, W1-12 | **Áno** |
| W1-14 | Konzultácia s barberom (30 min) | ⬜ | 1 h | W1-13 (1. kolo) | Nie (P1) |
| W1-15 | Meranie ceny a latencie | ⬜ | 0,5 h | W1-11 | Nie |
| W1-16 | GDPR: rozbehnúť Q3 (súhlas, DPA) | ⬜ | 1 h | W1-01 | Nie v T1, áno pred betou |

**Kritická cesta:** W1-01 → W1-11 → W1-13. W1-02, W1-10 a reviewy KB idú paralelne.

---

## Tickety

### W1-01 · ADR: výber modelu / poskytovateľa
**Stav:** 📝 predbežné ADR (`docs/adr/0001-model-provider.md`, `src/lib/analyze/model-client.ts`); porovnanie, cena a p95 čakajú na eval so skutočným kľúčom.

Rozhodnúť PRD Q1. Otestovať 2 kandidátov na 3 fotkách z golden setu s rovnakým promptom a KB.
- **Kritériá porovnania:** kvalita vision (správny tvar tváre/postavy vs. tvoje hodnotenie), natívna podpora JSON Schema výstupu, retencia dát z API a či sa používajú na tréning, cena za 1 analýzu (3 obrázky + ~8k tokenov kontextu + ~1,5k výstup), p95 latencia, podpora prompt cachingu.
- **Akceptačné kritériá:**
  - [ ] `docs/adr/0001-model-provider.md`: kontext, kandidáti, tabuľka porovnania, rozhodnutie, dôsledky.
  - [ ] Zdokumentovaná politika retencie dát vybraného poskytovateľa (odkaz na zdroj) – vstup pre privacy text.
  - [ ] Cena za analýzu a p95 latencia z reálnych behov.

### W1-02 · Golden set: 10 fotiek + matica pokrytia
- Fotky (3 na osobu) od teba a kamarátov **s výslovným súhlasom**, prípadne verejné fotky s licenciou umožňujúcou použitie. Uložené **mimo repa** (lokálny privátny priečinok, mimo cloud sync).
- V repe len `eval/cases.yaml`: `case_id`, popis bez identifikujúcich údajov, vstupy (výška, typ vlasov, štýl), tvoje očakávané pozorovania (tvar tváre, kontrast, postava).
- **Matica pokrytia (minimum):**
  - [ ] ≥ 5 zo 7 tvarov tváre
  - [ ] kontrast low / medium / high – každý ≥ 2×
  - [ ] ≥ 4 z 5 typov postavy
  - [ ] všetky 4 typy vlasov (vrátane `thinning`)
  - [ ] ≥ 1 s bradou, ≥ 1 s okuliarmi
  - [ ] výška: ≥ 1 pod 172 cm, ≥ 1 nad 186 cm
  - [ ] ≥ 1 zámerne nepoužiteľná sada (tma / odrezaná postava) → test `photo_issue`

### W1-03 – W1-07 · Review knowledge base (📝 draft v0.1)
Drafty sú v `knowledge-base/`. Pri reviewe:
- [ ] Každé pravidlo je vykonateľné (číslo, názov strihu, farba, kontrola v kabínke) a má dôvod.
- [ ] Pokrýva všetky hodnoty enumov zo schémy (`face_shape`, `body_frame`, `contrast_level`, `undertone`, `transition`, `neckline`, `styling_product.type`, `targeted_tip.area`).
- [ ] Žiadny hodnotiaci jazyk, žiadne značky.
- [ ] Hodnoty v mm sedia s tabuľkou nástavcov v `barber-terminology.md`.
- [ ] Hex farby v `color-contrast.md` vizuálne skontrolované (vyrenderovať swatche).
- [ ] Pri W1-07: skontrolovať, ako SK/CZ barberi reálne hovoria o nástavcoch (vstup do W1-14).

### W1-08 · Review systémového promptu (📝 draft v0.1)
`prompts/system.md`
- [ ] Poradie krokov: najprv kontrola fotiek, potom pozorovania, potom pravidlá.
- [ ] Zakázané správanie je explicitné (hodnotenie krásy, váha, etnicita, medicína, značky).
- [ ] Self-check zoznam zodpovedá guardrails z W1-10.
- [ ] Premenné `{{locale_name}}`, `{{locale}}` sa nahrádzajú v kóde.

### W1-09 · JSON Schema výstupu v1.0 ✅
`docs/product/blueprint.schema.json` + [kontrakt](./05-blueprint-output-contract.md). Ukážkový výstup prechádza validáciou.
- Pri W1-01 overiť, ktoré konštrukcie vybraný poskytovateľ v štruktúrovanom výstupe **nepodporuje** (`minItems`, `pattern`, `anyOf`, `$ref`…). V prípade potreby pripraviť zjednodušenú variantu pre model; plnú schému ponechať pre validáciu na serveri.

### W1-10 · Guardrails modul
**Stav:** ✅ `src/lib/guardrails/index.ts`.

Samostatný modul (TypeScript), ktorý sa neskôr použije v `/api/analyze`.
- **Akceptačné kritériá:**
  - [ ] Validácia proti `blueprint.schema.json` (napr. `ajv` s draft 2020-12).
  - [ ] Konzistencia `status` ↔ `blueprint` / `photo_issues`.
  - [ ] Presné počty: palette 6, key_cuts 3, avoid 2 – 3, routine 3 so step 1 – 3, instructions 3 – 5, ≥ 2 farby `top_near_face`.
  - [ ] Blacklist hodnotiacich výrazov SK / CZ / EN (napr. `/10`, `skóre`, `hodnotenie`, `atraktív*`, `škared*`, `pekn*`, `oškliv*`, `handsome`, `ugly`, `flaw`, `problém s pleťou`).
  - [ ] Výstup: `{ ok: boolean, violations: string[] }`.
  - [ ] Unit testy: 1 validný príklad (z kontraktu) + ≥ 5 nevalidných (každé pravidlo).

### W1-11 · Offline eval CLI
**Stav:** ✅ `scripts/eval.ts`, `scripts/eval-lib.ts`, návod v `eval/README.md`.

`scripts/eval` – spustí analýzu nad golden setom.
- **Akceptačné kritériá:**
  - [ ] Vstup: cesta k privátnemu priečinku s fotkami + `eval/cases.yaml`.
  - [ ] Pre každý prípad: zmenšenie fotiek ako na klientovi (max 1024 px, bez EXIF), volanie modelu, guardrails.
  - [ ] Porovnanie `observations` s očakávanými v `cases.yaml` (zhoda tvaru tváre, kontrastu, postavy).
  - [ ] **Kontrola generickosti:** pre každú dvojicu prípadov porovnať `card_barber` (strih + mm) a `palette` (hex). Ak sú pre odlišné vstupy takmer zhodné → upozornenie.
  - [ ] Report `eval/reports/YYYY-MM-DD-runN.md` (bez fotiek a bez osobných údajov): validita, porušenia, zhoda pozorovaní, upozornenia na generickosť, cena, latencia.
  - [ ] Výstupy JSON sa ukladajú len lokálne (`eval/out/` v `.gitignore`).

### W1-12 · Hodnotiaca rubrika + hárok
Hárok (CSV/tabuľka) s riadkom pre každý prípad a stĺpcami (1 – 5):
| Kritérium | 1 | 5 |
|---|---|---|
| Konkrétnosť | „nos, čo ti sedí“ | mm, hex, strih s fitom |
| Správnosť voči KB | odporúčanie proti pravidlu | odporúčanie zodpovedá pravidlám pre pozorovanie |
| Použiteľnosť u barbera / v obchode | treba vysvetľovať | dá sa rovno ukázať / kúpiť |
| Tón | hodnotiaci, generický | neutrálny, ako od experta-kamaráta |
| Personalizácia (`why`) | sedí na kohokoľvek | odkazuje na črty tohto človeka |

### W1-13 · Kalibrácia: 2 – 3 iterácie
Cyklus: eval → hodnotenie rubrikou → úprava KB / promptu → eval.
- [ ] Každá zmena KB / promptu je v samostatnom commite s odkazom na eval report.
- [ ] **Brána Fázy 1 splnená:** 10/10 validných JSON · 0 porušení hodnotenia krásy · priemer rubriky ≥ 4 · žiadne zameniteľné Blueprinty · Karta 1 je vykonateľná.

### W1-14 · Konzultácia s barberom (P1)
30 min s barberom, ukázať 3 – 4 Karty 1.
- [ ] Rozumie inštrukciám bez doplňujúcich otázok?
- [ ] Hovorí v mm alebo číslach nástavcov? Ktoré značky strojčekov používa?
- [ ] Čo by na karte chýbalo / prekážalo?
- [ ] Úpravy zapísané do `barber-terminology.md` + poznámky do eval reportu.

### W1-15 · Meranie ceny a latencie
- [ ] Z eval behov: priemerná a p95 latencia, cena za analýzu, efekt prompt cachingu.
- [ ] Doplniť do [architektúry, sekcia 5 Náklady](./02-technical-architecture.md#5-náklady-odhad-pre-betu).

### W1-16 · GDPR: rozbehnúť Q3
- [ ] Draft privacy notice (≤ 5 bodov) a textu súhlasu, pravdivo podľa W1-01.
- [ ] Zistiť, či poskytovateľ ponúka DPA a ako ho uzavrieť.
- [ ] Rozhodnúť, či stačí self-review, alebo treba krátku konzultáciu s právnikom (do konca T2).

---

## Definition of Done pre Týždeň 1
- [ ] W1-01, W1-02, W1-10, W1-11, W1-13 hotové.
- [ ] KB a prompt majú verziu ≥ v0.2 (po kalibrácii).
- [ ] Posledný eval report spĺňa bránu Fázy 1.
- [ ] Otvorené otázky z kalibrácie sú zapísané do PRD (sekcia 9).
