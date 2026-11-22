# Implementačný plán (4 týždne, víkendová kapacita)

| | |
|---|---|
| **Stav** | Draft v0.1 |
| **Kapacita** | ~2 dni/týždeň (víkendy) + večery podľa potreby |
| **Súvisiace** | [PRD](./01-prd.md) · [Architektúra](./02-technical-architecture.md) · [Beta & metriky](./04-beta-validation-plan.md) |

Každá fáza má **výstup (deliverable)** a **bránu (exit criteria)**. Ak brána nie je splnená, ďalšia fáza sa nezačína – posúva sa čas, nie kvalita a nie scope.

---

## Fáza 1 – „Mozog“ a kalibrácia pravidiel (Týždeň 1)

**Cieľ:** Zostaviť expertné pravidlá a overiť, že výstup nie je generický – ešte bez UI.

| # | Úloha | Výstup | Priorita |
|---|---|---|---|
| 1.1 | Rozhodnúť model/poskytovateľa (PRD Q1): otestovať 2 kandidátov na 3 fotkách | Krátke ADR: voľba + dôvod + cena za analýzu + retencia dát | P0 |
| 1.2 | Napísať `face-shapes.md` (ovál, okrúhla, hranatá, podlhovastá, srdcová, diamant → účes, brada, čomu sa vyhnúť; napr. *okrúhla tvár = objem hore, ostrejšie hrany po bokoch*) | KB súbor | P0 |
| 1.3 | Napísať `color-contrast.md` (nízky/stredný/vysoký kontrast, podtón → 6 farieb + neutrály) | KB súbor | P0 |
| 1.4 | Napísať `body-proportions.md` (výška, ramená vs. pás, nohy → fit a strihy; napr. *široké ramená + úzky pás = vyhnúť sa vypchávkam a skinny strihom*) | KB súbor | P0 |
| 1.5 | Napísať `grooming-basics.md` (3-krokové rutiny podľa typu pleti, obočie, kruhy pod očami, brada) | KB súbor | P0 |
| 1.6 | Napísať `barber-terminology.md` (taper/fade, low/mid/high, scissor-over-comb, textúra, mm ↔ nástavce) | KB súbor | P0 |
| 1.7 | Systémový prompt: zákaz hodnotenia krásy, povinné `why`, `photo_issue`, tón | `prompts/system.md` | P0 |
| 1.8 | JSON Schema výstupu | podľa [Output kontraktu](./05-blueprint-output-contract.md) | P0 |
| 1.9 | Offline eval skript (CLI): fotky z lokálneho priečinka → JSON → validácia + guardrails | `scripts/eval` | P0 |
| 1.10 | Test na 10 fotkách (vlastné, kamaráti so súhlasom, verejné fotky rôznych typov postáv), 2 – 3 iterácie pravidiel | Eval report (tabuľka: prípad → skóre rubriky → poznámka) | P0 |
| 1.11 | 30-min konzultácia s barberom: sú inštrukcie v Karte 1 vykonateľné? | Poznámky + úpravy `barber-terminology.md` | P1 |

**Brána Fázy 1:**
- [ ] 10/10 výstupov prejde JSON Schema validáciou.
- [ ] 0 porušení zákazu hodnotenia krásy.
- [ ] Priemer rubriky (konkrétnosť, správnosť, použiteľnosť, tón) ≥ 4/5.
- [ ] Žiadne dve osoby s odlišnou tvárou/postavou nedostanú zameniteľný Blueprint.
- [ ] Barber (alebo ty v úlohe barbera) vie podľa Karty 1 povedať, čo presne strihať.

## Fáza 2 – „Tenký“ prototyp a UI výstupu (Týždeň 2)

**Cieľ:** Zabaliť funkčný prompt do použiteľného mobilného rozhrania.

| # | Úloha | Priorita |
|---|---|---|
| 2.1 | Next.js projekt, deploy na Vercel (preview + production), doména/subdoména | P0 |
| 2.2 | Landing: 1 veta hodnoty, 3 kroky, privacy sľub, CTA | P0 |
| 2.3 | Súhlas + veková brána 18+ (PRD P0-2) | P0 |
| 2.4 | Onboarding: 3 sloty na fotky s ukážkou a tipmi, resize + strip EXIF na klientovi | P0 |
| 2.5 | Onboarding: výška, typ vlasov, preferovaný štýl | P0 |
| 2.6 | `/api/analyze`: KB injekcia, VLM volanie, schema validácia, guardrails, retry, bez logovania body | P0 |
| 2.7 | Loading so štádiami + chybové stavy + „Skúsiť znova“ bez straty vstupov | P0 |
| 2.8 | `photo_issue` obrazovka: ktorú fotku vymeniť a prečo | P0 |
| 2.9 | **Karta 1: Barber Cheat Sheet** + Kopírovať text + Uložiť ako obrázok (PNG, Web Share) | P0 |
| 2.10 | **Karta 2: Farebná paleta & Strihy** (6 swatchov s hex + 3 strihy + čomu sa vyhnúť) | P0 |
| 2.11 | **Karta 3: Grooming & Pleť** (3 kroky + tip obočie/kruhy) | P0 |
| 2.12 | **Karta 4: Prečo to funguje** | P0 |
| 2.13 | Analytika: funnel udalosti + `ref` kód (PRD P0-8) | P0 |
| 2.14 | In-app spätná väzba 👍/👎 + text | P0 |
| 2.15 | Privacy notice stránka | P0 |
| 2.16 | Rate limit + beta kód | P1 |
| 2.17 | Nákupný zoznam (copy) z Karty 2 | P1 |

**Brána Fázy 2:**
- [ ] Celý flow prejdený na reálnom iPhone (Safari) aj Androide (Chrome).
- [ ] p95 čas analýzy < 45 s na 5 testovacích behoch.
- [ ] Overené v logoch platformy: žiadne obrazové dáta ani base64.
- [ ] Uložený PNG Karty 1 je čitateľný na displeji telefónu (test: ukážeš ho niekomu bez kontextu).
- [ ] 3 ľudia mimo teba prejdú flow bez tvojej pomoci (chodbový test).

## Fáza 3 – Uzavretá beta a reálna validácia (Týždeň 3)

**Cieľ:** Zistiť, či ľudia rady **reálne použijú** v offline svete.

| # | Úloha | Priorita |
|---|---|---|
| 3.1 | Zoznam 20 – 25 kandidátov (kamaráti, kolegovia, lokálne komunity / Discord) zodpovedajúcich persone | P0 |
| 3.2 | Pozvánka s unikátnym `?ref=` kódom (mapovanie kód ↔ kontakt drží len zakladateľ offline) | P0 |
| 3.3 | Monitoring D0 – D2: chyby, drop-off na kroku fotiek, čas spracovania | P0 |
| 3.4 | Hotfixy blokujúcich chýb (nie nové funkcie) | P0 |
| 3.5 | D+7: dotazník 3 otázky (+ 2 voliteľné) – viď [Beta plán](./04-beta-validation-plan.md) | P0 |
| 3.6 | 3 – 5 krátkych rozhovorov (10 min) s tými, ktorí výstup použili, aj s tými, ktorí nie | P1 |

**Brána Fázy 3:** vyhodnotenie podľa [rozhodovacích pravidiel](./04-beta-validation-plan.md#5-rozhodovacie-pravidlá-go--iterate--kill).

## Fáza 4 – Iterácia, MediaPipe a lokálne napojenie (Týždeň 4+)

**Cieľ:** Pridať technickú presnosť a prvé prepojenie na lokálny trh – **až po potvrdení záujmu**.

| # | Úloha | Spúšťač (kedy to robiť) |
|---|---|---|
| 4.1 | Opraviť top 3 problémy z bety (obsah aj UX) | Vždy |
| 4.2 | **Klientsky MediaPipe** (Face Landmarker, Pose Landmarker) → pomery tváre a ramien ako tvrdé čísla do promptu | Len ak sa v bete / evale ukáže, že VLM halucinuje proporcie (napr. ≥ 2 z 20 nesprávny tvar tváre alebo postavy kvôli uhlu kamery) |
| 4.3 | Eval: porovnať golden set s MediaPipe vs. bez | Spolu s 4.2 |
| 4.4 | **„Overené miesta v tvojom meste“** – kurátorovaný zoznam ~5 barberov (Praha alebo Bratislava), osobne overených na základe parametrov z Karty 1 | Len ak Real-World Execution ≥ 5/20 |
| 4.5 | Rozhodnutie o monetizácii / ďalšej kohorte | Po vyhodnotení bety |

## Riziká a mitigácie

| Riziko | Pravdepodobnosť | Dopad | Mitigácia |
|---|---|---|---|
| Výstupy znejú genericky | Stredná | Vysoký | Brána Fázy 1, povinné `why` s pozorovanou črtou, kontrola podobnosti výstupov |
| VLM zle odhadne tvar tváre/postavy (uhol, svetlo) | Vysoká | Stredný | Inštrukcie k fotkám, `confidence` pole, `photo_issue`, MediaPipe vo Fáze 4 |
| Ľudia sa boja nahrať fotky | Stredná | Vysoký | Pravdivý a krátky privacy sľub, žiadne účty, sledovať drop-off na kroku fotiek |
| Farebná paleta skreslená svetlom fotky | Vysoká | Stredný | Tip „denné svetlo“, prompt opatrný pri podtóne, odporúčať aj bezpečné neutrály |
| Prekročenie limitov serverless (payload, timeout) | Stredná | Stredný | Resize na klientovi, max duration 60 s, monitorovanie p95 |
| Zneužitie / náklady za API | Nízka | Stredný | Beta kód, rate limit, budget alert u poskytovateľa |
| Scope creep (účty, AI vizualizácie) | Stredná | Stredný | Non-goals v PRD, pravidlo „nové za staré“ |
