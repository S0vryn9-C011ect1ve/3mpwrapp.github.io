---
layout: default
title: Development Diary
description: How 3mpwrApp is being built — the engineering decisions, the dead ends, and the reasoning behind each choice, written as it happens.
permalink: /dev-diary/
lastUpdated: 2026-10-03
accessibility: WCAG 2.2 AAA — semantic headings, machine-readable dates
---

# Development Diary

The development diary is where we write up what we are building and why. It is written for the people who will maintain this after us, and for anyone who wants to see how a disability-focused app actually gets made.

{% assign posts = site.categories['dev-diary'] | sort: 'date' | reverse %}
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
