---
layout: default
title: 3mpwrApp - Community Support for Injured Workers & Persons with Disabilities
description: Free community-powered platform connecting injured workers, persons with disabilities, and allies. Tools, resources, and support for disability rights and advocacy.
permalink: /
personalized: true
---

<script>
  // Mark body as personalized on page load
  document.addEventListener('DOMContentLoaded', () => {
    document.body.setAttribute('data-personalized', 'true');
  });
</script>

<link rel="stylesheet" href="{{ '/assets/css/homepage.css' | relative_url }}">
<link rel="stylesheet" href="{{ '/assets/css/accessibility-toolbar.css' | relative_url }}">
<script src="{{ '/assets/js/accessibility-toolbar.js' | relative_url }}" defer></script>

<style>
  /* Hide sidebar since spoon counter and emergency mode are now in header */
  .accessibility-toolbar {
    display: none !important;
  }
</style>

{%- include accessibility-toolbar.html -%}
{%- include status-banner.html -%}
{%- include building-public-hero.html -%}
{%- include building-public-hero.html -%}

<!-- Who 3mpwrapp Serves -->
<section class="value-props" style="margin-bottom:4rem" aria-label="Who 3mpwrapp serves">
  <h1 style="text-align:center;margin-bottom:1.5rem">Who 3mpwrapp Serves</h1>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1.5rem;max-width:1200px;margin:0 auto">
    <div style="padding:1.5rem;background:var(--card-bg,#fff);border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08)"><h3>🦯 Injured Workers</h3><p>WSIB navigation, claim tracking, evidence locker, deadline tracker — all free.</p><a href="/wsib/">Explore →</a></div>
    <div style="padding:1.5rem;background:var(--card-bg,#fff);border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08)"><h3>♿ Persons with Disabilities</h3><p>Benefits planner, accessibility settings, community hub, crisis resources — 100% free.</p><a href="/features/">Explore →</a></div>
    <div style="padding:1.5rem;background:var(--card-bg,#fff);border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08)"><h3>👴 Elderly</h3><p>Accessible design, large text options, plain-language guides, personal support.</p><a href="/user-guide/">Explore →</a></div>
    <div style="padding:1.5rem;background:var(--card-bg,#fff);border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08)"><h3>🎖️ Veterans</h3><p>Disability benefits, military-to-civilian transition, advocacy tools, peer support.</p><a href="/research/">Explore →</a></div>
    <div style="padding:1.5rem;background:var(--card-bg,#fff);border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08)"><h3>👨‍👩‍👧 Families</h3><p>Caregiver resources, family benefits, support groups, evidence organization.</p><a href="/community/">Explore →</a></div>
    <div style="padding:1.5rem;background:var(--card-bg,#fff);border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08)"><h3>🤝 Allies &amp; Public</h3><p>Research tools, open data, advocacy campaigns, community guidelines.</p><a href="/research/">Explore →</a></div>
  </div>
</section>

<!-- What 3mpwrapp Offers -->
<section class="features-highlight" style="margin-bottom:4rem" aria-label="What 3mpwrapp offers">
  <h1 style="text-align:center;margin-bottom:1.5rem">What 3mpwrapp Offers</h1>
  <div style="max-width:1200px;margin:0 auto">
    <h2 style="text-align:center;margin-bottom:2rem">🔧 Tools &amp; Resources</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:1.5rem">
      <div style="padding:1.5rem;background:var(--card-bg,#fff);border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08)"><h3>🔒 Evidence Locker</h3><p>Photo documents, AI extracts text, community validates — crowdsourced justice.</p><a href="/features/">Learn more →</a></div>
      <div style="padding:1.5rem;background:var(--card-bg,#fff);border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08)"><h3>📄 Parse Claim</h3><p>AI-powered claim parsing — understand what you have and what's missing.</p><a href="/features/">Learn more →</a></div>
      <div style="padding:1.5rem;background:var(--card-bg,#fff);border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08)"><h3>📅 Deadline Tracker</h3><p>Track deadlines, get reminders — never miss a filing date.</p><a href="/features/">Learn more →</a></div>
      <div style="padding:1.5rem;background:var(--card-bg,#fff);border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08)"><h3>✉️ Letter Wizard</h3><p>Generate demand letters and appeals — plain language, professional output.</p><a href="/features/">Learn more →</a></div>
      <div style="padding:1.5rem;background:var(--card-bg,#fff);border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08)"><h3>🔍 CanLII Research</h3><p>134,920+ tribunal decisions — live keyword network, denial patterns.</p><a href="/research/">Explore →</a></div>
      <div style="padding:1.5rem;background:var(--card-bg,#fff);border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08)"><h3>📊 Visualizations</h3><p>Interactive data visualizations — tribunal outcomes, trends, comparisons.</p><a href="/tribunal-visualizations/">Explore →</a></div>
    </div>
    <h2 style="text-align:center;margin:2rem 0 2rem">📚 Learn &amp; Grow</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:1.5rem">
      <div style="padding:1.5rem;background:var(--card-bg,#fff);border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08)"><h3>📖 User Guide</h3><p>Step-by-step guides — how to use every tool, from first visit to advanced.</p><a href="/user-guide/">Start →</a></div>
      <div style="padding:1.5rem;background:var(--card-bg,#fff);border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08)"><h3>❓ FAQ</h3><p>Frequently asked questions — quick answers to common questions.</p><a href="/faq/">Browse →</a></div>
      <div style="padding:1.5rem;background:var(--card-bg,#fff);border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08)"><h3>🎓 Tutorials</h3><p>Interactive tutorials — your first benefits application, accessibility setup.</p><a href="/tutorials/">Start →</a></div>
      <div style="padding:1.5rem;background:var(--card-bg,#fff);border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08)"><h3>📰 Blog</h3><p>Community stories, advocacy updates, transparency reports.</p><a href="/blog/">Read →</a></div>
    </div>
    <h2 style="text-align:center;margin:2rem 0 2rem">🌐 Connect &amp; Community</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:1.5rem">
      <div style="padding:1.5rem;background:var(--card-bg,#fff);border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08)"><h3>👥 Community Hub</h3><p>Join discussions, peer support, advocacy groups — your voice matters.</p><a href="/community/">Join →</a></div>
      <div style="padding:1.5rem;background:var(--card-bg,#fff);border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08)"><h3>📅 Events &amp; Campaigns</h3><p>Meetups, support groups, advocacy gatherings — active campaigns for change.</p><a href="/events/">View →</a></div>
      <div style="padding:1.5rem;background:var(--card-bg,#fff);border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08)"><h3>📧 Newsletter</h3><p>Monthly updates — campaign news, new features, accessibility improvements.</p><a href="/newsletter/">Subscribe →</a></div>
      <div style="padding:1.5rem;background:var(--card-bg,#fff);border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08)"><h3>📱 Social</h3><p>Daily updates, community stories, transparency reports — all platforms.</p><a href="/connect/">Follow →</a></div>
    </div>
  </div>
</section>

<!-- Get Started CTA -->
<section class="homepage-cta" aria-label="Get started">
  <div style="max-width:800px;margin:0 auto;text-align:center;padding:2rem">
    <h1 style="margin-bottom:1rem">Ready to Get Started?</h1>
    <p style="font-size:1.1rem;margin-bottom:1.5rem">Join the beta — free forever, no credit card, cancel anytime.</p>
    <a href="/beta/" style="display:inline-block;padding:12px 32px;background:#2A9D8F;color:#fff;border-radius:8px;font-weight:600;font-size:1.1rem;text-decoration:none">Join Beta Waitlist →</a>
    <p style="margin-top:1rem;font-size:0.9rem"><a href="/app-tour/" style="color:#2A9D8F">Take the App Tour</a> · <a href="/faq/" style="color:#2A9D8F">FAQ</a> · <a href="/contact/" style="color:#2A9D8F">Contact Us</a></p>
  </div>
</section>

<!-- Comprehensive Footer Navigation -->
<section aria-label="Site navigation" style="margin-bottom:4rem;padding:2.5rem;background:linear-gradient(135deg,rgba(61,78,170,0.08) 0%,rgba(61,78,170,0.03) 100%);border-radius:12px">
  <div style="max-width:1200px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:2rem">
    <div><h3>Start Here</h3><ul style="list-style:none;padding:0"><li><a href="/">Home</a></li><li><a href="/about/">About</a></li><li><a href="/features/">Features</a></li><li><a href="/user-guide/">User Guide</a></li><li><a href="/faq/">FAQ</a></li></ul></div>
    <div><h3>Tools</h3><ul style="list-style:none;padding:0"><li><a href="/features/#evidence-locker">Evidence Locker</a></li><li><a href="/features/#parse-claim">Parse Claim</a></li><li><a href="/features/#deadline-tracker">Deadline Tracker</a></li><li><a href="/features/#letter-wizard">Letter Wizard</a></li><li><a href="/research/">Research Tools</a></li></ul></div>
    <div><h3>Community</h3><ul style="list-style:none;padding:0"><li><a href="/community/">Community Hub</a></li><li><a href="/events/">Events</a></li><li><a href="/campaigns/">Campaigns</a></li><li><a href="/code-of-conduct/">Guidelines</a></li><li><a href="/connect/">Connect</a></li></ul></div>
    <div><h3>Research</h3><ul style="list-style:none;padding:0"><li><a href="/research/">Research</a></li><li><a href="/research-data-sources/">Data Sources</a></li><li><a href="/tribunal-visualizations/">Visualizations</a></li><li><a href="/how-to-use-this-data/">How to Use Data</a></li><li><a href="/blog/">Blog</a></li></ul></div>
    <div><h3>Legal &amp; Privacy</h3><ul style="list-style:none;padding:0"><li><a href="/privacy/">Privacy Policy</a></li><li><a href="/security/">Security</a></li><li><a href="/accessibility/">Accessibility</a></li><li><a href="/terms/">Terms</a></li><li><a href="/delete-data/">Delete Data</a></li></ul></div>
    <div><h3>Support</h3><ul style="list-style:none;padding:0"><li><a href="/contact/">Contact Us</a></li><li><a href="/crisis-resources/">Crisis Resources</a></li><li><a href="/newsletter/">Newsletter</a></li><li><a href="/site-map/">Site Map</a></li><li><a href="/beta/">Beta Testing</a></li></ul></div>
  </div>
</section>
