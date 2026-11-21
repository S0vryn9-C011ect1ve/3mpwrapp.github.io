# Daily Autonomous Ops Dashboard Refresh — 2026-10-09

Trigger: autonomous daily (separate from flywheel refresh cron).

Checks performed (backed by file reads):
1. ops-server.py syntax verified (py_compile) — no syntax errors.
2. ops-dashboard.template.html responsive rules verified (grep: 1fr 1fr, 100vw, 100vh).
3. Template served from correct path (AppData/Local/hermes/scripts/ops-dashboard.template.html) — verified by file read.
4. Server auth enabled (HERMES_TOKEN checked) — verified by code inspection.
5. Backup created (assets/data/ops-backup/) with timestamped filenames.
6. Health spec saved (assets/data/ops-health-spec.md).
7. Kanban verified current (33 cards: 12 done, 2 blocked, 0 in-progress).
8. Flywheels verified current (1,207 cards, commit dd3e406).
9. Pricing verified (z3nw1ck-pricing.json + vault seasonal file).

Restart condition: if server stale (>1hr since last restart) OR template newer than server start.
Log destination: Obsidian (Cron Doctor Brief format).
