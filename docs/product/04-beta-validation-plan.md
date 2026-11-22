# Uzavretá beta & metriky úspechu

| | |
|---|---|
| **Stav** | Draft v0.1 |
| **Kohorta** | 15 – 20 mužov 20 – 32 rokov (cieľ: 20 aktívnych) |
| **Trvanie** | D0 pozvánka → D+7 dotazník → D+10 vyhodnotenie |
| **Súvisiace** | [PRD](./01-prd.md) · [Implementačný plán](./03-implementation-plan.md) |

Pri tomto produkte nesledujeme len návštevnosť, ale **mieru reálnej akcie**.

---

## 1. Hypotézy

| # | Hypotéza | Overí ju |
|---|---|---|
| H1 | Ľudia sa neboja nahrať 3 fotky, ak je sľub súkromia jasný a flow krátky. | Completion Rate, Upload Drop-off |
| H2 | Výstup má hodnotu mimo obrazovky – ľudia si ho odložia. | Save / Copy Rate |
| H3 | Konkrétny Blueprint vedie k akcii (barber, nákup) do 7 dní. | Real-World Execution |
| H4 | Rady pôsobia ako od stylistu, nie ako generický článok. | Comprehension + kvalitatívna spätná väzba |

## 2. Metriky a ciele

| Metrika | Definícia (zdroj) | Cieľ MVP | Čo to dokazuje |
|---|---|---|---|
| **Completion Rate** | `blueprint_rendered` / `consent_given` (analytika) | **> 60 %** | Ľudia sa neboja nahrať fotky a proces nie je príliš zložitý. |
| **Save / Screenshot Rate** | relácie s `cheatsheet_copy` ∪ `cheatsheet_save_image` / `blueprint_rendered` (analytika) **∪** „Urobil si si screenshot?“ = áno (dotazník) | **> 40 %** | Používatelia si uložili Barber Cheat Sheet alebo nákupný zoznam na neskôr. |
| **Real-World Execution** | „Ukázal si kartu barberovi alebo si podľa nej niečo kúpil?“ = áno (dotazník D+7) | **≥ 5 z 20 testerov** | Niekto reálne išiel k barberovi alebo do obchodu a použil výstup z appky. |

**Diagnostické (nie cieľové) metriky:** Upload Drop-off, Error Rate, p95 čas analýzy, podiel `photo_issue`, 👍/👎.

> **Malá vzorka:** pri 20 testeroch je 1 človek = 5 p. b. Čísla berieme ako smer, nie štatistickú istotu. Kvalitatívne odpovede majú rovnakú váhu ako percentá.

## 3. Nábor

- **Zdroje:** kamaráti a kolegovia (max 50 % kohorty – sú príliš milí), lokálne komunity, Discord servery (fitness, self-improvement, IT komunity SK/CZ).
- **Filter:** muž 20 – 32, používa alebo plánuje používať zoznamky, nie je pracovne v móde/barberstve.
- **Pozvánka (šablóna):**

  > Ahoj, staviam malú appku, ktorá z 3 fotiek urobí konkrétny návod: čo povedať barberovi (v mm), aké farby a strihy oblečenia ti sedia a jednoduchú grooming rutinu. Fotky sa neukladajú – spracujú sa a hneď zahodia. Je to zadarmo, výmenou za 3 krátke otázky o týždeň. Link: `https://…/?ref=t07`

- **Párovanie bez osobných údajov:** každý tester dostane `ref` kód; tabuľku kód ↔ kontakt drží zakladateľ offline a po vyhodnotení ju zmaže.

## 4. Harmonogram a dotazník

| Deň | Akcia |
|---|---|
| D0 | Rozoslanie pozvánok (v 2 vlnách po ~10, aby sa dali chytiť chyby) |
| D0 – D2 | Monitoring funnelu a chýb, hotfixy |
| D+3 | Pripomienka tým, ktorí ešte neprešli flow (1×, nie viac) |
| D+7 | Dotazník |
| D+8 – D+10 | 3 – 5 rozhovorov, vyhodnotenie |

**Dotazník D+7 (3 povinné + 2 voliteľné, ≤ 2 min):**

1. **Pochopil si odporúčania?** (Áno / Čiastočne / Nie) + „Čo nebolo jasné?“
2. **Ukázal si kartu barberovi alebo si podľa nej niečo kúpil?** (Barber / Nákup / Oboje / Ešte nie, ale plánujem / Nie) + „Ak áno, ako to dopadlo?“
3. **Čo ti v návode chýbalo?** (otvorená)
4. *(voliteľné)* Uložil si si výstup (screenshot, obrázok, skopírovaný text)? (Áno / Nie)
5. *(voliteľné)* Poslal by si to kamarátovi? (Áno / Možno / Nie)

## 5. Rozhodovacie pravidlá (Go / Iterate / Kill)

| Výsledok | Podmienky | Ďalší krok |
|---|---|---|
| **GO – škálovať** | Real-World Execution ≥ 5/20 **a** Completion > 60 % **a** Save > 40 % | Fáza 4: lokálni barberi, väčšia kohorta (50 – 100), test ochoty platiť |
| **ITERATE – funnel** | Real-World ≥ 5/20, ale Completion < 60 % | Problém je dôvera/UX, nie hodnota → zjednodušiť fotky, prepísať privacy text, opakovať s novou kohortou |
| **ITERATE – obsah** | Completion > 60 %, ale Save < 40 % alebo Real-World < 5/20 | Problém je kvalita/akčnosť výstupu → prepracovať KB a Karty 1 – 2, zvážiť MediaPipe, opakovať |
| **KILL / pivot** | Real-World ≤ 2/20 **a** spätná väzba hovorí „zaujímavé, ale nepotrebujem“ | Job nie je dosť bolestivý v tejto forme → zvážiť iný formát (napr. len Barber Cheat Sheet) alebo iný segment |

## 6. Šablóna vyhodnotenia

```markdown
## Beta vyhodnotenie – kohorta 1
- Pozvaných / otvorilo / súhlasilo / dokončilo: __ / __ / __ / __
- Completion Rate: __ % (cieľ > 60 %)
- Save / Copy Rate: __ % (cieľ > 40 %)
- Real-World Execution: __ / __ (cieľ ≥ 5 / 20)
- Comprehension: __ % áno
- Top 3 „čo chýbalo“:
- Top 3 chyby / UX problémy:
- Prípady halucinácie proporcií: __ (→ spúšťač MediaPipe pri ≥ 2)
- Rozhodnutie: GO / ITERATE (funnel | obsah) / KILL
```
