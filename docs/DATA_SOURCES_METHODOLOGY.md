---
title: "Data Sources & Methodology — Canonical Stat Reference"
description: "Single source of truth that reconciles every contradictory statistic on 3mpwrApp research pages and guides, with official-source verification dates and VERIFIED/INFERRED labels."
layout: page
permalink: /docs/DATA_SOURCES_METHODOLOGY/
---

# Data Sources & Methodology — Canonical Stat Reference

*This is the ONE SOURCE OF TRUTH for every quantitative claim on the site. All research pages and guides must cite this document for any number listed below. Where a page states a figure, it should carry a `(see [Data Sources & Methodology](/docs/DATA_SOURCES_METHODOLOGY/))` note and the `VERIFIED` / `INFERRED` label defined here.*

**Established:** 2026-10-07
**Last verified against official sources:** 2026-10-07
**Maintainer:** 3mpwrApp Research

---

## 1. Why this document exists

The site accumulated several mutually contradictory figures (two WSIAT decision totals, two WSIAT win rates, two HRTO totals, two HRTO rates, and a family of large "total records" numbers that do not reconcile). This document records the **canonical** value for each, the **source** it was verified against, the **date** of verification, and whether it is **VERIFIED** (traced to an official source, dated) or **INFERRED** (derived by 3mpwrApp from a source that does not itself publish the figure — e.g. keyword-inferred outcomes, or an aggregate we computed).

**Labelling rule (apply on every page):**
- `VERIFIED` — the number traces directly to an official publisher (WSIAT Open Data, CanLII, Tribunals Ontario, Statistics Canada) and is dated.
- `INFERRED` — the number is computed or keyword-inferred by 3mpwrApp; it is an estimate, not an official statistic, and must be marked as such. Never present an INFERRED number as an official rate.

---

## 2. Official sources checked (2026-10-07)

| Source | URL | What it provides |
|---|---|---|
| WSIAT Open Data — Decisions CSV | https://www.wsiat.ca/opendata/WSIATDecisions.csv | The authoritative, official list of WSIAT decisions (updated quarterly). |
| WSIAT Open Data catalogue | https://www.wsiat.ca/en/home/opendata_decisions.html | Metadata / access point for the CSV above. |
| CanLII — ONWSIAT decisions | https://www.canlii.org/en/on/onwsiat/ | Full-text WSIAT decisions (no structured outcome field). |
| CanLII — ONHRT decisions | https://www.canlii.org/en/on/onhrt/ | Full-text HRTO decisions (no structured outcome field). |
| Tribunals Ontario — HRTO | https://tribunalsontario.ca/hrto/ | HRTO quarterly statistical reports (aggregate application counts). |
| Tribunals Ontario — Annual Report | https://tribunalsontario.ca/documents/TO/Tribunals_Ontario_2024-2025_Annual_Report.html | Official HRTO application/case counts by year. |
| Statistics Canada | https://www.statcan.gc.ca | Context for national workplace-injury statistics (not used for the tribunal counts). |

**Method note:** The WSIAT CSV was downloaded and parsed with a CSV reader that handles embedded newlines in decision summaries. The live file (2026-10-07) contains **96,025** data rows (96,024 distinct `DecNum`; one duplicate decision number is present), spanning 1986-01-14 to 2026-06-30.

---

## 3. Reconciliation table (canonical)

| Stat | Canonical value | Source | VERIFIED / INFERRED |
|---|---|---|---|
| WSIAT total decisions (committed dataset) | **98,992** | WSIAT Open Data CSV, parsed by 3mpwrApp 2026-04-29 (the dataset the committed analytics are built on) | **VERIFIED** (official source, dated) |
| WSIAT total decisions (live official file, 2026-10-07) | **96,025** (96,024 distinct) | WSIAT Open Data CSV, re-downloaded 2026-10-07 | **VERIFIED** (official source, dated) — supersedes 98,992 for freshness; re-extract required |
| WSIAT decisions — RETIRED figure | 99,036 | Alternate/earlier extraction (cited as 2016-2025 or 1987-2026); not matched to a single official-source parse | RETIRED (do not use) |
| WSIAT worker win rate (canonical) | **73.5%** (438 granted / 596 decisive; from 649 classified 2020-2026 CanLII decisions) | 3mpwrApp v3.0 ML/keyword classification of CanLII onwsiat 2020-2026 | **INFERRED** (keyword-inferred; not an official WSIAT rate) |
| WSIAT worker win rate — SUPERSEDED | 63.1% (411 / 651 detected outcomes; 2,000-decision sample) | Earlier 3mpwrApp keyword pass (2020-2026) | **INFERRED** — superseded by 73.5% |
| HRTO decisions analyzed (classified, 2020-2026) | **9,269** (4,073 abandoned 43.9%; 503 allowed 5.4%) | CanLII onhrt extraction, individually outcome-classified, committed dataset | **VERIFIED** (CanLII source; committed dataset total) |
| HRTO applications (aggregate, 2016-2025) | **62,093** | 39 HRTO quarterly XLSX statistical reports (Tribunals Ontario) | **INFERRED** (aggregate summary counts, not individual cases) |
| HRTO abandonment rate (of 9,269) | **43.9%** (4,073 / 9,269) | Committed HRTO classified dataset | **VERIFIED** |
| HRTO allowed / success rate (of 9,269) | **5.4%** (503 / 9,269) | Committed HRTO classified dataset | **VERIFIED** |
| HRTO "0.7% applicant victory" | RETRACTED | Was wrongly stated as an HRTO victory rate | RETRACTED (remove everywhere) |
| Grand total records (3mpwrApp dataset) | **230,392** = 127,600 tribunal decisions + 102,792 employer/other records (raw, pre-dedupe) | 3mpwrApp extraction manifest | **VERIFIED** as stated composition (see §4 caveat) |
| Ontario tribunal decisions | **127,600** (WSIAT 99,036 + HRTO 9,269 + ONSBT 13,798 + ONWSIB 463 + ONCA 5,034) | Sum of per-tribunal counts | **INFERRED** composition (uses 99,036 component; if WSIAT updated to 98,992 the sum becomes 127,556) |
| v3.0 outcome-classified Ontario cases | **50,161** (85.1% classified, 2026-05-15) | ontario-classification-stats v2/v3 (`totalProcessed: 50161`) | **VERIFIED** (committed classification artifact) |
| 238,767 | NOT PRESENT in current repository | — | UNVERIFIED — do not cite (provenance unknown; not located in repo) |
| 2020-2026 Ontario tribunal decisions (keyword-network viz subset) | **34,960** | connecting-the-dots keyword-network visualization subset | **INFERRED** (period-limited viz subset) |
| AI outcome-predicted decisions (legacy) | **137,252** | Legacy NLP outcome-prediction pass (research-old-backup.html) | **INFERRED** (historical model-predicted subset) |

---

## 4. Detailed methodology & provenance per stat

### 4.1 WSIAT decision count — 98,992 vs 99,036 vs 96,025

- **Canonical (committed dataset): 98,992.** This is the count 3mpwrApp parsed directly from the official **WSIAT Open Data CSV** on 2026-04-29. Every committed analytics artifact in the repo (`data/wsib-comprehensive/data-inventory.json`, `wsiat-content-updates.json`, etc.) is built on 98,992. It is therefore the internally consistent figure for the site's existing analysis.
- **Live official file (2026-10-07): 96,025** decision rows (96,024 distinct `DecNum`). WSIAT updates this file **quarterly** and has revised it since April 2026 (the row count dropped by ~2,967). Because the official source is authoritative and changes over time, the live figure is the one to re-extract toward; until a re-extraction is done, cite **98,992 with an explicit "as parsed 2026-04-29" date** and note the live file reads 96,025.
- **99,036 is RETIRED.** It appears across many pages as "99,036 WSIAT decisions (1987-2026 / 2016-2025)" but does not correspond to a single verified official-source parse and disagrees with both 98,992 and the live 96,025. It must be replaced by 98,992 (or the re-extracted live count) everywhere.

### 4.2 WSIAT win rate — 63.1% (n=651) vs 73.5% (n=649)

Neither is an official WSIAT-published statistic; both are keyword/ML-inferred by 3mpwrApp from CanLII onwsiat decisions.

- **Canonical: 73.5%** — from the 2020-2026 CanLII classified subset: **438 granted / 596 decisive** outcomes, drawn from **649 classified** decisions. This is the larger, more recent, and currently-used classification.
- **Superseded: 63.1%** — from an earlier 2,000-decision sample in which **651 outcomes** were keyword-detected (411 worker victories). Retain only as a labelled historical estimate; do not present it as the current rate.

Both must be labelled **INFERRED** and never presented as "WSIAT's official success rate."

### 4.3 HRTO total — 9,269 vs 62,093

These are **two different scopes**, not a contradiction:

- **9,269** = HRTO decisions **extracted from CanLII (onhrt)** for 2020-2026, individually outcome-classified, and committed as the site's HRTO dataset (`totalDecisions: 9269`). This is the figure to use when the site says "HRTO cases analyzed." **VERIFIED** against CanLII.
- **62,093** = HRTO **applications** aggregated from **39 quarterly XLSX statistical reports** (2016-2025). These are summary counts, not individual case records. **INFERRED** from Tribunals Ontario quarterly reports. Use only when explicitly describing "applications 2016-2025."

### 4.4 HRTO rates — 43.9% vs 5.4%, and the retracted 0.7%

Computed from the committed 9,269 HRTO dataset (2020-2026):
- **Abandonment: 43.9%** (4,073 / 9,269) — **VERIFIED**.
- **Allowed / discrimination-found: 5.4%** (503 / 9,269) — **VERIFIED**.

The **0.7% "applicant victory"** figure that appeared on the ONCA cross-tribunal comparison and a visualization is **RETRACTED**. It was computed from a "detected-outcome subset" that does not exist in the committed repository and was audit-corrected (see the 2026-07-20 accuracy audit note in `_posts/2026-04-20-hrto-email-crisis-abandonment-epidemic.md`). Remove 0.7% wherever it appears (e.g. `data/visualizations/cross-tribunal-comparison.json`, `connecting-the-dots-canlii-keyword-visualization-network.html`, `_posts/2026-05-08-onca-precedent-overview.md`). Use 5.4% as the HRTO allowed rate.

### 4.5 The large "total records" family — 230,392 / 127,600 / 50,161 / 238,767 / 34,960 / 137,252

- **230,392** — headline grand total of the 3mpwrApp dataset. Stated composition: **127,600 tribunal decisions + 102,792 employer/other records** (raw, pre-dedupe). **VERIFIED** as the site's stated composition.
  - **Caveat / internal inconsistency:** a second, contradictory decomposition also appears — "99,036 WSIAT + 130,736 employer records" (e.g. `research-data-sources.md` L427) — which sums to 229,772, not 230,392. The 130,736 figure = NEER 91,814 + CAD-7 38,922 employer records; the 102,792 figure is the number used in the 230,392 decomposition. **Retire the "99,036 + 130,736" line**; keep 230,392 = 127,600 + 102,792.
- **127,600** — Ontario tribunal decisions = WSIAT 99,036 + HRTO 9,269 + ONSBT 13,798 + ONWSIB 463 + ONCA 5,034. **INFERRED** composition; note it uses the retired 99,036 component, so if WSIAT is updated to 98,992 the sum becomes 127,556.
- **50,161** — v3.0 outcome-classified Ontario cases (2026-05-15), 85.1% classified. **VERIFIED** via `ontario-classification-stats-v2.json` / `-v3.json` (`totalProcessed: 50161`).
- **238,767** — **NOT FOUND anywhere in the current repository.** Provenance unverified; do not cite. (Listed in the reconciliation request but absent from all source files.)
- **34,960** — 2020-2026 Ontario tribunal decisions used in the keyword-network visualization subset (`connecting-the-dots-canlii-keyword-visualization-network.html`). **INFERRED** (period-limited viz subset).
- **137,252** — AI outcome-predicted decisions in the legacy research backup (`research-old-backup.html`). **INFERRED** (historical model-predicted subset).

---

## 5. Historical context preserved (do not delete)

This document **adds** methodology; it does not erase prior numbers. Where a page currently shows a retired/superseded figure (99,036, 63.1%, 0.7%, 130,736), keep the sentence but append the reconciliation pointer and the correct canonical value, e.g.:

> *"We analyzed 99,036 WSIAT decisions (historical extraction). The current canonical count is 98,992 (WSIAT Open Data CSV, parsed 2026-04-29; live file 2026-10-07 = 96,025) — see [Data Sources & Methodology](/docs/DATA_SOURCES_METHODOLOGY/). All win rates are INFERRED (keyword-inferred), not official WSIAT rates."*

---

## 6. Citation targets — pages that must cite this document

Each entry below names a file, the exact line(s) where a contradictory/headline figure appears, and the action for the coordinator (add the `(see [Data Sources & Methodology](/docs/DATA_SOURCES_METHODOLOGY/))` note and replace the figure with the canonical value where indicated). **This list was generated 2026-10-07; it covers the research pages and all guides (the in-scope set).** Additional contradictory files exist outside this scope (`data/knowledge-base/*.md`, `_posts/*.md`, several HTML visualizations, `docs/WSIB-APPEAL-GAP-ANALYSIS.md`) and are listed separately in §6.2.

### 6.1 In-scope research pages & guides

**`research.html`**
- L377 — headline `<h1>We Analyzed 230,392 Records…</h1>` → add note; 230,392 VERIFIED composition (§3/§4.5).
- L380 — "Ontario v3.0 complete May 15, 2026: 50,161 cases, 85.1% classified" → add note; 50,161 VERIFIED.
- L398 — decomposition paragraph mixing 230,392 / 127,600 / 99,036 / 98,992 / 62,093 / 9,269 → add note; replace 99,036 with 98,992; keep 62,093 only as "applications 2016-2025 (INFERRED)".
- L410 — "built from 99,036 real decisions" → replace with 98,992.
- L451 / L457 — "230,392 records" / "127,600 Ontario tribunal decisions + 102,792 employer records" → add note.
- L471 / L475 — stat-number blocks 230,392 / 127,600 → add note.
- L493 — list "WSIAT: 99,036 | HRTO: 9,269 | …" → replace 99,036 with 98,992.
- L536 — badge "99,036 Decisions" → replace with 98,992.
- L544 — "9,269 decisions" (HRTO) → add note (9,269 VERIFIED classified 2020-2026).

**`research-data-sources.md`**
- L49 — "99,036 decisions (2016-2025)" → replace with 98,992 (VERIFIED, parsed 2026-04-29).
- L115 — "62,093 applications (aggregate counts, 2016-2025)" → add INFERRED label + note (scope = applications, not cases).
- L356 — "All 230,392 records…" → add note.
- L366 / L369 / L373 — Cross-Tribunal total "230,392", "WSIAT 99,036", "HRTO 62,093" → reconcile to 98,992 / 62,093(INFERRED).
- L389 — "WSIAT: 68.7% success rate (99,036 decisions)" → this 68.7% is an additional unsupported rate; replace with canonical 73.5% INFERRED and 98,992.
- L424 / L427 — "230,392 records" / "99,036 WSIAT + 130,736 employer records" → retire the 99,036+130,736 line; keep 230,392 = 127,600 + 102,792.
- L534 — "99,036 decisions, 100% coverage" → replace with 98,992.
- L620 — "230,392 records from WSIAT, HRTO, ONSBT, and WSIB" → add note.

**`data-limitations.md`**
- L24 / L29 / L39 / L67 / L71 / L143 / L192 / L327 / L400 / L447 / L453 / L456 — every "99,036 WSIAT decisions" and "230,392 records" → replace 99,036 with 98,992 and add note + VERIFIED/INFERRED labels.

**`guides/index.md`**
- L74 / L230 / L322 / L395 / L416 / L453 / L476 — "99,036 WSIAT decisions" → replace with 98,992; add note.

**`guides/hrto-complete-guide.md`**
- L18 — "Allowed: 503 (5.4%)" → add VERIFIED note.
- L21 — "Abandoned: 4,073 (43.9%)" → add VERIFIED note.
- L27 — narrative referencing 43.9% → add note.
- L580 — "HRTO quarterly statistics (2016-2025) - 62,093 applications" → add INFERRED label + note (scope = applications).

**`guides/onca-appellate-guide.md`**
- No contradictory figure currently present in this file (the retracted 0.7% lives in data/HTML/post artifacts, see §6.2). No change required, but add a general "(see Data Sources & Methodology)" note near its data-source statements for consistency.

**`guides/wsiat-complete-guide.md`**
- L3 (description), L12, L18, L58, L84, L301, L395, L452, L629, L661 — every "99,036 WSIAT decisions" → replace with 98,992 and add note; L58 references "85-95% yearly win rates" → label INFERRED and point to canonical 73.5%.

**`guides/wsiat-back-injury-guide.md`** — L16, L29, L162, L259, L296 ("99,036") → replace with 98,992 + note.
**`guides/wsiat-chronic-pain-guide.md`** — L10, L330 → replace with 98,992 + note.
**`guides/wsiat-nel-benefits-guide.md`** — L274 → replace with 98,992 + note.
**`guides/wsiat-nel-chronic-pain-strategy.md`** — L137, L315, L352 → replace with 98,992 + note.
**`guides/wsiat-loe-benefits-guide.md`** — L344, L362 (the L362 "Verified — computed from the WSIAT Open Data export of 99,036 decisions" should read 98,992).
**`guides/healthcare-wsiat-industry-guide.md`** — L24, L330 → replace with 98,992 + note.
**`guides/construction-wsiat-industry-guide.md`** — L25, L353 → replace with 98,992 + note.
**`guides/manufacturing-wsiat-industry-guide.md`** — L24, L352 → replace with 98,992 + note.
**`guides/onwsib-skip-strategy-guide.md`** — L99, L335 ("99,036 decisions 2020-2026" comparative) → replace with 98,992 + note.

### 6.2 Out-of-scope but also contradictory (flagged for a follow-up pass)

These were found to carry the same figures but are **outside** the research/guides scope of this phase. They should be reconciled in a subsequent pass:
- `data/knowledge-base/*.md` (≈20 files) — repeatedly cite "99,036 ONWSIAT/WSIAT decisions (2020-2026)". Replace with 98,992 + note.
- `_posts/2026-04-15-wsib-exposed-*.md`, `_posts/2026-04-25-feature-spotlight-*.md`, `_posts/2026-04-30-suppression-gap.md`, `_posts/2026-04-16-wsib-transparency-gap-*.md` — carry 99,036, 73.5%, 63.1%, 0.7%/5.4% figures. Reconcile to 98,992 / 73.5% INFERRED / 5.4% VERIFIED / 0.7% retracted.
- `_posts/2026-05-08-onca-precedent-overview.md` — HRTO row still shows "0.7% applicant victory"; replace with 5.4%.
- `connecting-the-dots-canlii-keyword-visualization-network.html` — uses 98,992 (OK), 9,269 (OK), and a retracted "0.7% of detected outcomes" (L792) and "73.5% abandonment" (L787) for HRTO; replace 0.7% with 5.4% and label 73.5% abandonment as the 43.9% committed figure or remove.
- `cross-tribunal-success-rates.html` — uses 98,992 (OK) and "62,093" (L182, INFERRED applications); add labels.
- `data/visualizations/cross-tribunal-comparison.json` (L49) — "HRTO: 0.7% applicant victory / 73.5% abandonment" → replace 0.7% with 5.4%.
- `docs/WSIB-APPEAL-GAP-ANALYSIS.md` — L188 "62,093 HRTO decisions analyzed (2016-2026)" (mislabels applications as decisions) and L102/L109 "73,640 / 72,466 allowed (30.7%)" WSIB figures (verify separately against wsib.ca).

---

## 7. Re-extraction action item

Because the **live** WSIAT Open Data CSV (2026-10-07) = 96,025 decisions, the committed 98,992 dataset is stale. Before the next data refresh:
1. Re-download `https://www.wsiat.ca/opendata/WSIATDecisions.csv`.
2. Re-parse and update `data/wsib-comprehensive/data-inventory.json` and dependent artifacts to the new count (currently 96,025).
3. Propagate the new canonical WSIAT count to all pages via this reference.

Until then, the canonical WSIAT decision count remains **98,992 (as parsed 2026-04-29 from the official WSIAT Open Data CSV)**, with the live 96,025 noted as a freshness caveat.

---

*Document established 2026-10-07. Verify against official sources before each publish cycle. All INFERRED figures are estimates and must never be presented as official tribunal statistics.*
