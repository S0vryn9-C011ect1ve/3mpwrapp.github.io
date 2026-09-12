# 3mpwrapp.ca — Pages Group 1 Audit (SEO / A11y / Contrast / Readability / Polish)

**Scope:** `/`, `/privacy/`, `/terms/`, `/code-of-conduct/`, `/data-ownership/`, `/faq/`, `/accessibility`, `/app-tour/`, `/contact`, `/support`
**Method:** Live HTTP/HTML inspection of all 10 URLs (curl + rendered markup), source-file review (`_layouts/default.html`, `_config.yml`, `_includes/*`, `assets/css/accessibility-tokens.css`), contrast computed from the actual gradient/hex values. No files modified.

---

## Site-wide critical issues (affect all 10 pages)

- **[HIGH] Two `<h1>` elements on every page (WCAG 2.2 A — "Page must contain a level-one heading" / one h1).** Confirmed in rendered HTML for all 10. Root cause: `_layouts/default.html` line 300 emits `<h1 class="visually-hidden">{{ page.title }}</h1>` AND each page's markdown body begins with a visible `# Title`. Examples:
  - `/` → "3mpwrApp - Community Support…" + "Tools, Support & Community — All in One Place"
  - `/privacy/` → "Privacy Policy" + "🔐 Privacy Policy"
  - `/faq/` → "3MPWRAPP FAQ - Frequently Asked Questions" + "3MPWRAPP FAQ"
  - **Fix:** Keep the visible `<h1>` from the body; make the layout's `page.title` h1 `display:none` (not `visually-hidden`, which still counts as a heading in the a11y tree) OR remove the body `#` and rely on the layout h1.
- **[HIGH] `/accessibility` and `/contact` are unreachable — HTTP 308 permanent-redirect loop.** Confirmed: both `/accessibility`, `/accessibility/`, `/contact`, `/contact/` return `308` → `Location: /accessibility` (and `/contact`) forever. `_config.yml` sets `permalink: /accessibility` and `/contact` (no trailing slash); `_redirects` then has `/accessibility /accessibility/ 200` which conflicts and CF sends a 308 back to the bare path → infinite loop. Both are in the top nav/header (`header_pages`) yet dead. **Fix:** Standardize permalinks to trailing-slash (`/accessibility/`, `/contact/`) and remove the conflicting `_redirects` rules.
- **[HIGH] `/app-tour/` returns 404 (page linked from homepage, footer, and nav).** Confirmed `404 Not Found` for `/app-tour` and `/app-tour/`. Root cause: `app-tour.md` is listed in `_config.yml` `exclude:` (line 153), so Jekyll never builds it. The homepage (index.md lines 142 & 362) and footer link to `/app-tour/`. **Fix:** Remove `app-tour.md` from `exclude:` (also consider removing `app-waitlist.md` which is similarly excluded but is the active beta CTA).
- **[HIGH] Branding inconsistency — three names used across the same pages.**
  - Domain/title brand: **3mpwrApp** (site.title) — used 407× in source.
  - Lowercase domain string **3mpwrapp** — 44× (e.g. email `empowrapp08162025@gmail.com`, `empowrapp0816`, repo URLs `3mpowrApp/3mpwrapp.github.io`).
  - **empowrapp** — 22× (footer copyright "© 2026 3mpwrApp" is fine, but `https://empowr.app` appears as the "Website" in Privacy & Terms contact blocks: privacy.md:171, terms.md:121).
  - The legal contact blocks even point "Website" to `https://empowr.app` (a different domain) while the site is `3mpwrapp.ca`. **Fix:** Pick one brand (3mpwrApp) and one web domain (3mpwrapp.ca); replace `empowr.app` references in privacy/terms contact blocks.
- **[MED] Redundant/dead "building in public" banners stacked at top of every page.** Every page renders BOTH the sticky transparency banner AND the hero banner. The hero (`building-public-hero.html`) claims "**4,600+** updates" + sub-line "**Many** improvements this week," while the sticky banner (`sticky-transparency-banner.html`) JS currently injects "**0 updates this week**" (fetched `whatsnew-2026.json` is empty) — a visible contradiction on the same screen. **Fix:** Keep one banner; make the weekly count fall back to "several" (already coded in the sticky script) instead of "0," and reconcile the "4,600+" vs weekly figure.
- **[MED] Gradient hero sections fail AAA and partially fail AA for body-size white text (contrary to the site's AAA claims).** Computed ratios on the actual `#667eea→#764ba2` gradient:
  - White on `#667eea` = **3.66:1** → only AA-large, **fails AA normal text and AAA** (used for the building-public hero text, support.md welcome banner heading `color:white` on that gradient).
  - White on `#764ba2` = 6.37:1 (AA pass, not AAA).
  - The light/dark/high-contrast *body* tokens themselves are genuinely AAA (black/white), but the prominent purple gradient headers are not. **Fix:** Either darken the gradient (e.g. to `#4a3aa0`/`#3d2f7a`) or add a solid dark scrim behind text; ensure any white-on-gradient text is ≥7:1 for AAA.

---

## Per-page findings

### `/` (Home)
- **[MED] Title (88 chars) is long** but acceptable; no keyword stuffing. Meta description present (164 chars, unique). OG=30, Twitter=18, JSON-LD=4 — strong.
- **[MED] Heading hierarchy jump:** after the two H1s there are 19 `<h2>`; fine, but several sections use emoji-led h2/h3 ("✨🔍 NEW:", "🎯 See 3MPWRAPP") — decorative emoji in headings can confuse screen readers; consider moving emoji out of heading text or marking `aria-hidden`.
- **[LOW] "0 updates this week" sticky banner contradicts the hero "4,600+ updates" (see site-wide).**
- **[LOW] No broken internal links found on home** (demo/, whats-new/, app-tour/ link targets: demo works, app-tour 404 — see site-wide).

### `/privacy/`
- **[LOW] SEO good:** unique title (26) + description (92), OG/Twitter/JSON-LD present. Duplicate-h1 issue applies (site-wide HIGH).
- **[LOW] `https://empowr.app` listed as "Website" in the Privacy contact block (privacy.md:171)** — brand/domain mismatch (site-wide HIGH).
- **[LOW] Readability:** strong, plain-language, scannable with emoji bullets. Long but appropriate for a legal page.

### `/terms/`
- **[LOW] SEO good** (title 28, desc 99). Duplicate-h1 applies.
- **[LOW]** Footer contact block also points to `empowr.app` (terms.md:121) — same brand bug.
- **[LOW]** "Also available in the app (app.3mpwrapp.ca)" link — fine; app domain is consistent with brand.

### `/code-of-conduct/` (Community Guidelines)
- **[MED] Title/brand mismatch:** URL is `/code-of-conduct/` but the page `<title>` is "Community Guidelines" and the body h1 is "3mpwrApp — Community Guidelines." The task brief calls this "code-of-conduct"; the nav label differs. Consistent internal naming recommended.
- **[MED] Two internal link targets are 404/redirect:** page links to `/beta-guide/` (returns 308→ likely dead) and references `/community/guidelines` (redirects). Also `data-ownership` is fine.
- **[LOW]** Long (≈600 lines) but well-structured with clear "Not Allowed" lists. Duplicate-h1 applies.

### `/data-ownership/`
- **[LOW] SEO:** title 36 (unique), desc 70 (a bit short — could expand to ~150). Duplicate-h1 applies.
- **[LOW]** "Alternative Formats" section ends with a stray `</div>` in rendered HTML (data-ownership.md closing div) — minor markup hygiene; verify it doesn't break layout.
- **[LOW]** Otherwise excellent plain-language + tables/quick-summary; good contrast in body.

### `/faq/`
- **[MED] Brand casing inconsistency in title:** "3MPWRAPP FAQ" (all-caps) vs site brand "3mpwrApp." Appears in both h1 and title.
- **[MED] Two broken links from FAQ:** "Sign up for beta testing → /beta-signup" → **404**; "Beta testers guide → /beta-guide/" → **308 redirect** (likely dead). Also `/user-guide/` is 308.
- **[LOW]** Otherwise a model accessible FAQ (quick-nav, plain language). Duplicate-h1 + gradient hero contrast apply.

### `/accessibility` — **UNREACHABLE (HIGH, site-wide).** When reachable (source review), it is a thorough WCAG 2.2 AAA statement with good heading hierarchy (`# Accessibility Statement` → many `##`). Once the 308 loop is fixed it will score well. Note it currently claims "AAA" while the shared gradient banners (above) do not meet AAA — reconcile.

### `/app-tour/` — **404 (HIGH, site-wide).** Source (`app-tour.md`, title "Inside 3mpwrApp - Visual Tour") is excluded from build. Re-enable in `_config.yml`.

### `/contact` — **UNREACHABLE (HIGH, site-wide).** Source (`contact.md`) is solid: `# Contact Us`, quick links, an accessible contact form include (`contact-form-aaa.html`). Fix the permalink/redirect loop. Also note `/crisis-resources/` (linked from contact) returns 308 and `/community/` 308 — verify those targets resolve.

### `/support`
- **[MED] White-on-gradient heading fails contrast:** welcome banner uses `color:white` on the `#667eea→#764ba2` gradient → 3.66:1 (support.md:15). Fix per site-wide contrast note.
- **[MED] Broken/redirecting links:** "Report issues → github.com/3mpowrApp/3mpwrapp.github.io/issues" (org name mismatch `3mpowrApp` vs `S0vryn9-C011ect1ve` seen elsewhere), `/reports/` is "(coming soon)" dead link, `/beta-guide/` 308.
- **[LOW]** Financial table is clear; duplicate-h1 applies.

---

## Top-10 site-wide priority list

1. **[HIGH] Fix duplicate `<h1>` on all pages** — edit `_layouts/default.html` so the title h1 is `display:none` (not `visually-hidden`). WCAG 2.2 A, affects every page.
2. **[HIGH] Repair `/accessibility` and `/contact` 308 redirect loops** — align `permalink` (trailing slash) with `_redirects`; currently both top-nav pages are dead.
3. **[HIGH] Restore `/app-tour/` (404)** — remove `app-tour.md` from `_config.yml` `exclude:`.
4. **[HIGH] Unify brand & domain** — consistently use **3mpwrApp** / **3mpwrapp.ca**; replace `empowr.app` in Privacy/Terms contact blocks and fix org-name mismatches in GitHub links.
5. **[MED] Fix gradient hero contrast** — white text on `#667eea` is 3.66:1 (fails AA normal / AAA). Darken gradient or add scrim; applies to home, support, building-public banners.
6. **[MED] Resolve dead/redirecting links** — `/beta-signup` (404), `/beta-guide/`, `/user-guide/`, `/community/`, `/crisis-resources/`, `/reports/` (coming-soon). Add redirects or fix targets; affects FAQ, code-of-conduct, support, contact.
7. **[MED] De-duplicate the two "building in public" banners** and fix the "0 updates this week" vs "4,600+ updates" contradiction (sticky JS is injecting 0 from empty 2026 JSON).
8. **[MED] FAQ title brand casing** — "3MPWRAPP" → "3mpwrApp" for consistency.
9. **[LOW] Move decorative emoji out of heading text** (home, support, etc.) or mark `aria-hidden` to improve screen-reader output.
10. **[LOW] Expand thin meta descriptions** — `/data-ownership/` (70 chars) and a few others are under the ~150-char target; verify each page's `description` is unique and complete.

**Verified working well:** JSON-LD structured data (4 blocks/page), full OG + Twitter card tags, skip-links, `lang="en"`, a real light/dark/high-contrast token system with AAA body text, `aria-live` status banners, and generally plain, scannable legal copy. The problems are concentrated in (a) the layout's double-h1, (b) three broken navigation targets, (c) brand/domain drift, and (d) the purple-gradient contrast claim.
