---
layout: default
title: Community Updates
description: Announcements, progress reports, and updates from the 3mpwrApp team and the S0vryn9 C011ect1ve community.
permalink: /community-updates/
lastUpdated: 2026-10-03
accessibility: WCAG 2.2 AAA — semantic headings, machine-readable dates
---

# Community Updates

Announcements and progress reports from the 3mpwrApp team and the wider community —
what is being built, what changed, and why.

{% assign posts = site.categories['community-updates'] | sort: 'date' | reverse %}
{% assign total = posts | size %}

{% if total > 0 %}
<p><strong>{{ total }} update{% if total != 1 %}s{% endif %}.</strong> Newest first.</p>

{% assign years = posts | group_by_exp: 'item', 'item.date | date: "%Y"' %}
{% for year in years %}
<h2 id="y{{ year.name }}">{{ year.name }}</h2>
<ul class="updates-archive-list">
  {%- for post in year.items -%}
  <li>
    <time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%d %b" }}</time>
    &mdash;
    <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
  </li>
  {%- endfor -%}
</ul>
{% endfor %}

{% else %}
<p>Community updates are being published now. In the meantime:</p>

<ul>
  <li><a href="/whats-new/">What\'s New</a> — product and platform changes</li>
  <li><a href="/curation/">Daily News Curation</a> — disability and policy news from across Canada</li>
  <li><a href="/community/">Community</a> — how the community works</li>
</ul>
{% endif %}

---

If something here is missing or out of date, please [tell us](/contact/).