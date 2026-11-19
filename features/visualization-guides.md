# Visualization Guides — 3mpwrapp User Bases

*Created 2026-11-18. Each row is a canonical user base. "Live" = interactive chart published; "Stub" = scaffolded page exists; "—" = not started.*

| Base | Status | Where it lives | Chart to build |
|------|--------|----------------|----------------|
| Injured Workers | — | [Research · WSIB/WSIAT](/research/#injured-workers--wsibwsiat) | WSIAT denial-pattern breakdown (data: 98,992 decisions, /research) |
| Persons with Disabilities | — | [Research · Disability](/research/#persons-with-disabilities) | CPP-D/ODSP denial & appeal-flow chart |
| Indigenous Communities | — | [Research · Indigenous](/research/#indigenous-health-disability) | NIHB / Jordan's Principle service-timeline chart |
| Families (Caregivers) | — | [Research · Caregivers](/research/#caregivers) | Caregiver cost/burden stats chart (sourced) |
| Veterans | — | [Research · VAC/VRAB](/research/#veterans-vac--vrab) | VAC backlog processing-time chart |
| Seniors / Elders | — | [Research · Seniors](/research/#seniors) | OAS/GIS uptake-gap chart |
| Public | Live | [Research · Data room](/research/#room-data) | WSIB denial-pattern interactive chart (D3, deployed) |
| Allies | — | [Features · Support](/features/#support) | Advocacy-action tracker (stub) |
| Advocates | — | [Features · Advocacy](/features/#advocacy-tools) | Precedent-citation graph (stub) |

## Live: Evidence Cards by User Base

Every bar counts real evidence cards in the flywheel ledger (nightly refresh — no invented figures).

<div id="user-base-chart" aria-live="polite"></div>
<script src="/assets/charts/user-base-coverage.js" defer></script>

**How to add a live chart**

1. Pull the relevant data into `assets/data/flywheels-snapshot.json` (or a base-specific sub-file) — every figure must trace to `evidence_ledger.jsonl` or the [methodology page](/docs/DATA_SOURCES_METHODOLOGY/).
2. Write a D3 script (`assets/charts/<base>.js`) that reads the data and renders an SVG in the target page.
3. Add `<div id="<base>-chart"></div>` to the page and call the renderer on load.
4. Deploy via the marketing-site pipeline (commit → push → Cloudflare Pages auto-deploy).

*Accuracy mandate: no invented stats — figures reconcile to the data-source methodology or are flagged unverified.*
