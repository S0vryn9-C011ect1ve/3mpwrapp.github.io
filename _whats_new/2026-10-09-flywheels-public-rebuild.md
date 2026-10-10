---
layout: default
title: 2026-10-09 — Flywheels Public Rebuild (Static + Full Archive)
date: 2026-10-09
description: flywheels-public.html rebuilt with all 15 recent cards embedded statically (no JS feed dependency) and archive section expanded with full 1090-card ledger summary (communities, jurisdictions, sources, CanLII status). Deployed 3ddb8b24-f035-.
---

## What's new — flywheels-public rebuild (verified)

### Changes to `flywheels-public.html`
- **Latest findings (30 days)**: 15 cards embedded as static HTML (replaced `<div id="feed"></div>` JS dependency). Each card shows source label, date, jurisdiction, community tag, and link.
- **Archive (30+ days)**: expanded from a single link to full ledger summary embedded on page:
  - 1,090 archive cards
  - By community: Disability (481), Injured Workers (326), Welfare Social (255), Accessibility (181), Elderly (66), Veterans (36), Vulnerable Communities (2)
  - By jurisdiction: INTL 485 · CA-ON 435 · CA-FED 100 · CA-AB 62 · CA-BC 21 · CA-TERR 1 · CA 1
  - By source: X (Athena) 516 · Reddit Daily Digest 436 · News 136 · WSIB Research Dossier 15 · Themis Justice Watch 1 · Manual Curation 1
  - CanLII status: Unverified Social 1088 · Official Confirmed 4 · Pending Legislative Review 1 · Verified As Estimate Method Stated 1 · Research Unverified 1 · Manual Curated 1 · ? 9
- Link preserved: `View full archive → Research page` (`https://www.3mpwrapp.ca/research/`)

### Source verification
- All embedded data from `assets/data/flywheels-snapshot.json` (1105 total cards, 15 recent, 5 verified, 7 communities, 7 jurisdictions, 6 sources).
- Nothing fabricated or invented.
- Deployed live: `https://3ddb8b24.3mpwrapp.pages.dev`
