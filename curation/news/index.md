---
layout: default
title: Curation Archive — All Daily News Entries
description: Every daily disability rights, accessibility, benefits and social policy news round-up, newest first, with links to the original sources.
permalink: /curation/news/
lastUpdated: 2026-10-03
accessibility: WCAG 2.2 AAA — semantic headings, machine-readable dates, keyboard-navigable
---

# Curation Archive

Every daily round-up, newest first. Each links out to its original source so you can
read the full story rather than take our word for it.

{% assign curation = site.categories.curation | sort: 'date' | reverse %}
{% assign total = curation | size %}

<p><strong>{{ total }} entries.</strong> Grouped by year.</p>

{% assign years = curation | group_by_exp: 'item', 'item.date | date: "%Y"' %}

{% for year in years %}
<h2 id="y{{ year.name }}">{{ year.name }}</h2>
<ul class="curation-archive-list">
  {%- for post in year.items -%}
  <li>
    <time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%d %b" }}</time>
    &mdash;
    <a href="{{ post.url | relative_url }}">{{ post.title | remove: "Daily News Curation - " }}</a>
  </li>
  {%- endfor -%}
</ul>
{% endfor %}

---

## Older material

Round-ups before the archive began are still reachable:

- [What\'s New](/whats-new/) — platform and product updates
- [Community Updates](/community-updates/) — community news and announcements

If a link here does not open, please [tell us](/contact/) — broken links in this archive
are a bug on our side, not on yours.