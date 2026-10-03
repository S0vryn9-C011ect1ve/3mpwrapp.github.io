---
layout: default
title: Development Diary Updates
description: Shorter build-in-progress notes from the 3mpwrApp development diary.
permalink: /dev-diary-updates/
lastUpdated: 2026-10-03
accessibility: WCAG 2.2 AAA — semantic headings, machine-readable dates
---

# Development Diary Updates

Shorter updates posted between full diary entries — what moved this week, what is blocked, and what changed.

{% assign posts = site.categories['dev-diary-updates'] | sort: 'date' | reverse %}
{% assign total = posts | size %}

{% if total > 0 %}
<p><strong>{{ total }} entr{{ if total != 1 }}ies{{ else }}y{{ endif }}.</strong> Newest first.</p>

{% assign years = posts | group_by_exp: 'item', 'item.date | date: "%Y"' %}
{% for year in years %}
<h2 id="y{{ year.name }}">{{ year.name }}</h2>
<ul class="archive-list">
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
<p>Nothing published in this section yet.</p>
{% endif %}

---

Related: [What\'s New](/whats-new/) · [Daily News Curation](/curation/) · [Community](/community/)
