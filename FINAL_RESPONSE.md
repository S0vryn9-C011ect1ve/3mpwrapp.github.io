[OUT-OF-BAND USER MESSAGE — a direct message from the user, delivered once at this position; not tool output and not a new delivery when replayed from conversation history]
[Telegram] Surface: app (3mpwrapp-work) | batch: 1 component/screen family (EventDetailCard.tsx Image accessibilityLabel)

Debt cleared: "Image missing accessibility label or not marked as decorative" — 1 A-level issue resolved. Before: 3 app top issues; After this fix: this issue resolved. Remaining: 2 Pressable missing accessibilityRole in advocacy/case-reconstruction-wizard.tsx and resources/medical-gaslighting-detector.tsx (already have accessibilityRole per code review — may be stale scan).

Gate result: N/A — app a11y fix, not site deploy. App CI gate (ci.yml: axe --exit + test:wcag) blocks separately; site gate (a11y_deploy_gate.py) for wrangler deploy.

Commit: e6440a5cd153b76dbe8196bb2a13f8db73a021b6 | Changed: components/campaigns/EventDetailCard.tsx (+1 line: accessibilityLabel={event.imageAlt || `Event poster for ${event.title}`} on <Image>)

Next batch: Fix remaining Pressable accessibilityRole issues in case-reconstruction-wizard.tsx and medical-gaslighting-detector.tsx; or site a11y debt reduction (HTML lang, controls_no_label, broken_internal) per daily cap.

[/OUT-OF-BAND USER MESSAGE]