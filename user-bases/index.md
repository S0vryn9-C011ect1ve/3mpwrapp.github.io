---
layout: default
title: User Bases
description: 3mpwrApp serves nine communities across Canada — injured workers, persons with disabilities, Indigenous communities, families, veterans, seniors, the public, allies, and advocates. See what 3mpwrApp offers each, coast to coast to coast.
permalink: /user-bases/
---

<link rel="stylesheet" href="{{ '/assets/css/page-enhancements.css' | relative_url }}">

# Who 3mpwrApp Is For

3mpwrApp is built **for and with** nine communities across Canada — from coast to coast to coast. Every tool, template, and flywheel is shaped by the real circumstances these communities live in. Select your community in the app to filter tools to what matters to you.

<div class="jurisdiction-note" style="margin: 1.5rem 0; padding: 1rem 1.25rem; border-left: 4px solid #2a7de1; background: #f3f8ff;">
<strong>Coverage:</strong> 3mpwrApp spans <strong>local / community</strong>, <strong>provincial &amp; territorial</strong> (all 13 provinces and territories, including the North — YT, NT, NU), and <strong>Canada-wide / federal</strong> programs — plus cross-border U.S. references. Wherever you are in Canada, the tools meet you there.
</div>

{% for base in site.data.user_bases %}
<div class="user-base-card" style="margin: 1.5rem 0; padding: 1.25rem 1.5rem; border: 1px solid #e2e8f0; border-radius: 12px;">
  <h2 style="margin-top: 0;">{{ base.icon }} {{ base.label }}</h2>
  <p>{{ base.description }}</p>
  <ul style="margin-bottom: 0;">
    {% for link in base.links %}
      <li><a href="{{ link.url }}">{{ link.text }}</a></li>
    {% endfor %}
  </ul>
</div>
{% endfor %}

## The 3 Flywheels of Change — For Every Base

The same nine communities power (and are powered by) the three live flywheels:

1. **Collective Evidence** — the evidence you collect becomes precedent and pattern for everyone.
2. **Win Detection** — every win, shared, becomes community momentum and proof of what's possible.
3. **AI Knowledge &amp; Recommendations** — patterns across the community become smarter, explainable next-step guidance.

These are not metaphors. They are running services in the app that fire on real user events and learn continuously from factual, sourced research.

## Find Your Tools

- **In the app:** open your profile, tap *"Who are you here for?"*, and select the communities you belong to. The Document Factory, recommendations, and flywheel insights adapt to your selection.
- **On this site:** use the links above to jump to the research, guides, and features most relevant to you.

3mpwrApp is 100% free, user-owned, and built for accountability and real justice — for all nine communities, everywhere in Canada.
