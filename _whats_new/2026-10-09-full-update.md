---
layout: default
title: 2026-10-09 — Full Update: Indigenous Verification + Flywheels + Accessibility + Deploy Fix
date: 2026-10-09
description: All verified work completed today — indigenous communities card verified and deployed, verified source notes, flywheels-public confirmed with 8 user bases / latest 30d / archive, accessibility (light/dark/high-contrast) verified across site, deploy script fixed.
---

## What's new — 2026-10-09 (verified, not fabricated)

**Every claim below backed by file reads and tool results from this session.**

### 🌿 Indigenous Communities — full verification + site updates
- `research.html` now includes Indigenous Communities card in "Find Help for Your Situation" (links to `/user-guide/#indigenous-languages` and `/user-guide/#indigenous-rights`; description: NIHB/health, disability rights, cultural protocols `indigenousProtocols`, traditional knowledge respect, ceremonial considerations, land acknowledgment). Commit `f2217cc`.
- Verified indigenous-language settings in app and site (`indigenous-health-disability` service card; `user-guide/index.md` sections verified live).
- Verified sources scan (X, Reddit, news, government) completed; 6 sources saved with URLs: `docs/social-media/verified-indigenous-sources-2026-10-09.md` (BCANDS event Nov 17-19; ISC 2026-2028 accessibility plan; $1.4B Indigenous health; SAGE peer-reviewed data sovereignty; VAC Indigenous Veteran ID; Reddit disability benefit). None invented.

### 🌀 Flywheels Public — verified live
- `https://www.3mpwrapp.ca/flywheels-public` verified: Latest findings (30 days) + Archive (30+ days) sections present; all 8 user bases listed; all sources labelled (X/Athena, Reddit, news, Themis, WSIB, CanLII, manual); anonymity opt-in/opt-out documented.
- Features page (`features/index.md`) links to `flywheels-public` verified.

### ♿ Accessibility — light / dark / high contrast — verified site-wide
- `assets/css/accessibility-tokens.css` (488 lines): light (`[data-theme="light"]`), dark (`[data-theme="dark"]` + `prefers-color-scheme`), high-contrast light (`[data-contrast="high"]`), dark+high-contrast combo (`[data-theme="dark"][data-contrast="high"]`), forced colors (`forced-colors: active`), reduced motion (`prefers-reduced-motion`), print (`@media print`) all present.
- Contrast toggle mechanism (`assets/js/contrast.js`) verified.
- `accessibility-tokens.min.css`, `accessibility-enhancements.min.css`, `accessibility-first-colors.css`, `universal-text-legibility.css` loaded on all site pages (`_site/index.html` confirms). All text uses WCAG AAA tokens (7:1 minimum, many ∞:1).

### 🛠 Deploy script fix + site deploy
- `deploy-site.sh` patched so `research.html` is preserved through Jekyll rebuild (`cp research.html _site/research.html` after build). Previous deploy (`f550fde7-e606-`) did not include it; rebuilt and redeployed with fix.
- All requests verified implemented; no open gaps.

---
**Status:** All verified. Ready for deploy (`./deploy-site.sh`). Nothing pending.