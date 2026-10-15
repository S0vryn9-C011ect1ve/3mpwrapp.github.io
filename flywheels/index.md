---
layout: default
title: "The 3 Flywheels of Change"
description: "The three live flywheels behind 3mpwrapp — Collective Evidence, Win Detection, and AI Knowledge & Recommendations — and how continuous, factual research feeds them across all nine user bases. The app is the live engine; this site is the public, factual surface."
permalink: /flywheels/
---

<style>
  .fly-hero { max-width: 820px; margin: 0 auto 2.5rem; }
  .fly-hero h1 { font-size: 2rem; margin-bottom: .4rem; }
  .fly-hero p.lead { font-size: 1.08rem; color: var(--text-secondary, #6b7280); }

  .fly-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.25rem; margin: 2rem 0; }
  .fly-card { border: 1px solid var(--border-color, #2b3a52); border-radius: 14px; padding: 1.25rem 1.35rem; background: var(--card-bg, #1a2332); }
  .fly-card .num { font-size: .8rem; letter-spacing: .08em; text-transform: uppercase; color: var(--accent, #4ea1ff); font-weight: 700; }
  .fly-card h3 { margin: .35rem 0 .5rem; font-size: 1.15rem; }
  .fly-card p { margin: 0; font-size: .95rem; line-height: 1.5; }

  .fly-loop { margin: 2.5rem 0; text-align: center; }
  .fly-loop svg { max-width: 520px; width: 100%; height: auto; }
  .fly-loop figcaption { color: var(--text-secondary, #6b7280); margin-top: .75rem; font-size: .95rem; }

  .fly-section { max-width: 820px; margin: 2.5rem auto; }
  .fly-section h2 { border-left: 4px solid var(--accent, #4ea1ff); padding-left: .6rem; }
  .fly-section ul { line-height: 1.7; }
  .fly-note { border: 1px solid var(--border-color, #2b3a52); border-left: 4px solid var(--warn, #ffb454); border-radius: 10px; padding: 1rem 1.25rem; background: var(--card-bg, #1a2332); }

  .fly-bases { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.25rem; margin-top: 1.5rem; }
  .fly-base { border: 1px solid var(--border-color, #2b3a52); border-radius: 12px; padding: 1.1rem 1.25rem; background: var(--card-bg, #1a2332); }
  .fly-base h3 { margin: 0 0 .35rem; font-size: 1.1rem; }
  .fly-base p { margin: 0 0 .75rem; font-size: .92rem; color: var(--text-secondary, #6b7280); }
  .fly-base ul { margin: 0; padding-left: 1.1rem; line-height: 1.6; font-size: .9rem; }

  a { color: var(--accent, #4ea1ff); }
</style>

<section class="fly-hero">
  <h1>🌀 The 3 Flywheels of Change</h1>
  <p class="lead">3mpwrapp is powered by three continuously-learning flywheels. They are <strong>real, running services in the 3mpwrapp-work app</strong> — privacy-first, and fed by continuous, factual research for each user base. This page explains how they work and how they connect.</p>
  <p><strong>The app is the live engine. This site is the public, factual surface.</strong> Every figure that appears in the guides and knowledge bases traces back to the research hub and the <a href="/docs/DATA_SOURCES_METHODOLOGY/">Data Sources &amp; Methodology</a> page — where each statistic is labelled as verified, inferred, or estimated.</p>
</section>

<section class="fly-section">
  <h2>The three live flywheels</h2>
  <div class="fly-cards">
    <div class="fly-card">
      <div class="num">Flywheel 1</div>
      <h3>Collective Evidence</h3>
      <p>Aggregates anonymized evidence patterns across users. It powers the precedent finder, the strength of the denial-decoder, and community benchmarking — so no one is decoding a system alone.</p>
    </div>
    <div class="fly-card">
      <div class="num">Flywheel 2</div>
      <h3>Win Detection</h3>
      <p>Detects when a user <strong>wins</strong> — a case approved, an appeal won, a benefit granted, an accommodation approved — and prompts them to share. That shared momentum becomes the community's evidence base.</p>
    </div>
    <div class="fly-card">
      <div class="num">Flywheel 3</div>
      <h3>AI Knowledge &amp; Recommendations</h3>
      <p>Uses collaborative filtering on user situations to surface <strong>explainable</strong> recommendations: a tool, a template, a campaign, a mentor, a timing, or a piece of evidence — with the reasoning shown, not hidden.</p>
    </div>
  </div>
</section>

<section class="fly-loop">
  <figure>
    <svg viewBox="0 0 520 320" role="img" aria-labelledby="flyloop-title flyloop-desc">
      <title id="flyloop-title">The flywheel loop</title>
      <desc id="flyloop-desc">Collective Evidence feeds Win Detection, which feeds AI Knowledge &amp; Recommendations, which loops back to Collective Evidence.</desc>
      <!-- nodes -->
      <g font-family="-apple-system, Segoe UI, Roboto, sans-serif" text-anchor="middle">
        <circle cx="260" cy="70" r="58" fill="#1a2332" stroke="#4ea1ff" stroke-width="2"/>
        <text x="260" y="66" fill="#e8edf5" font-size="13" font-weight="700">Collective</text>
        <text x="260" y="82" fill="#e8edf5" font-size="13" font-weight="700">Evidence</text>

        <circle cx="110" cy="240" r="58" fill="#1a2332" stroke="#7ee0a8" stroke-width="2"/>
        <text x="110" y="236" fill="#e8edf5" font-size="13" font-weight="700">Win</text>
        <text x="110" y="252" fill="#e8edf5" font-size="13" font-weight="700">Detection</text>

        <circle cx="410" cy="240" r="58" fill="#1a2332" stroke="#ffb454" stroke-width="2"/>
        <text x="410" y="236" fill="#e8edf5" font-size="13" font-weight="700">AI Knowledge</text>
        <text x="410" y="252" fill="#e8edf5" font-size="13" font-weight="700">&amp; Recs</text>
      </g>
      <!-- arrows (loop) -->
      <g fill="none" stroke="#9fb0c8" stroke-width="2" marker-end="url(#arrow)">
        <path d="M 222 108 C 175 150, 140 175, 120 196"/>
        <path d="M 168 258 C 250 290, 320 290, 372 262"/>
        <path d="M 398 196 C 360 160, 305 120, 282 100"/>
      </g>
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="#9fb0c8"/>
        </marker>
      </defs>
    </svg>
    <figcaption>The loop: Collective Evidence → Win Detection → AI Knowledge &amp; Recommendations → (back to Evidence).</figcaption>
  </figure>
</section>

<section class="fly-section">
  <h2>Privacy-first by design</h2>
  <ul>
    <li><strong>Anonymized at the source.</strong> Collective Evidence works on anonymized patterns — it strengthens the system without exposing individuals.</li>
    <li><strong>Opt-in / opt-out.</strong> Sharing into the collective layer is opt-in; public display is opt-out. User sovereignty over data is preserved at every stage.</li>
    <li><strong>Data sovereignty respected.</strong> Indigenous communities' data sovereignty settings are honoured within the evidence layer.</li>
    <li><strong>Transparent handling.</strong> See how evidence is collected, labelled, and used in the <a href="/privacy/">Privacy Policy</a> and the <a href="/docs/DATA_SOURCES_METHODOLOGY/">Data Sources &amp; Methodology</a> page.</li>
  </ul>
</section>

<section class="fly-section">
  <h2>How continuous, factual research feeds the flywheels</h2>
  <p>Each user base has a dedicated, continuously-updated research layer — guides, knowledge bases, templates, and tribunal-decision visualizations. That factual layer is what the flywheels learn from and act on. Nothing here is invented: every outcome figure traces to the <a href="/research/">Research hub</a> and the <a href="/docs/DATA_SOURCES_METHODOLOGY/">Data Sources &amp; Methodology</a> page.</p>
  <div class="fly-note">
    <strong>Accuracy note:</strong> This page does not publish win counts or percentages. Where the flywheels surface outcomes, those numbers live on the research pages and are labelled as verified, inferred, or estimated. Real community outcomes are shared at <a href="/wins/">Member Wins</a>.
  </div>
</section>

<section class="fly-section">
  <h2>The 9 user bases</h2>
  <p>The flywheels serve all nine user bases. Each is linked to its real, existing research, guides, and tools on this site.</p>
  <div class="fly-bases">
    {% for base in site.data.user_bases %}
    <div class="fly-base">
      <h3>{{ base.icon }} {{ base.label }}</h3>
      <p>{{ base.description }}</p>
      <ul>
        {% for link in base.links %}
        <li><a href="{{ link.url }}">{{ link.text }}</a></li>
        {% endfor %}
      </ul>
    </div>
    {% endfor %}
  </div>
</section>

<section class="fly-section">
  <h2>The engine and the surface</h2>
  <ul>
    <li><strong>Live engine:</strong> the three flywheels run inside the 3mpwrapp-work app, learning from real, anonymized usage and research.</li>
    <li><strong>Public, factual surface:</strong> this site publishes the research, methodology, guides, and community wins that the flywheels are built on — open and verifiable.</li>
    <li><strong>Contribute:</strong> the research layer grows through continuous, factual work per user base. Explore the <a href="/research/">Research hub</a>, the <a href="/docs/DATA_SOURCES_METHODOLOGY/">methodology</a>, and <a href="/wins/">Member Wins</a> to see how evidence becomes collective action.</li>
  </ul>
</section>
