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


<style>
  /* Hide sidebar since spoon counter and emergency mode are now in header */
  .accessibility-toolbar {
    display: none !important;
  }
</style>

{%- include accessibility-toolbar.html -%}
{%- include building-public-hero.html -%}
{%- include building-public-hero.html -%}

<!-- Who 3mpwrapp Serves -->
<section class="value-props" style="margin-bottom:4rem" aria-label="Who 3mpwrapp serves">
  <h1 style="text-align:center;margin-bottom:1.5rem">Who 3mpwrapp Serves</h1>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1.5rem;max-width:1200px;margin:0 auto">
    <div style="padding:1.5rem;background:var(--card-bg,#1a2332);border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08)"><h3>🦯 Injured Workers</h3><p>WSIB navigation, claim tracking, evidence locker, deadline tracker — all free.</p><a href="/wsib/">Explore →</a></div>
    <div style="padding:1.5rem;background:var(--card-bg,#1a2332);border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08)"><h3>♿ Persons with Disabilities</h3><p>Benefits planner, accessibility settings, community hub, crisis resources — 100% free.</p><a href="/knowledge-base/">Explore →</a></div>
    <div style="padding:1.5rem;background:var(--card-bg,#1a2332);border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08)"><h3>👴 Elderly</h3><p>Accessible design, large text options, plain-language guides, personal support.</p><a href="/user-guide/">Explore →</a></div>
    <div style="padding:1.5rem;background:var(--card-bg,#1a2332);border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08)"><h3>🎖️ Veterans</h3><p>Disability benefits, military-to-civilian transition, advocacy tools, peer support.</p><a href="/knowledge-base/">Explore →</a></div>
    <div style="padding:1.5rem;background:var(--card-bg,#1a2332);border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08)"><h3>👨‍👩‍👧 Families</h3><p>Caregiver resources, family benefits, support groups, evidence organization.</p><a href="/community/">Explore →</a></div>
    <div style="padding:1.5rem;background:var(--card-bg,#1a2332);border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08)"><h3>🤝 Allies &amp; Public</h3><p>Research tools, open data, advocacy campaigns, community guidelines.</p><a href="/community/">Explore →</a></div>
  </div>
</section>

<!-- What 3mpwrapp Offers -->
<section class="features-highlight" style="margin-bottom:4rem" aria-label="What 3mpwrapp offers">
  <h1 style="text-align:center;margin-bottom:1.5rem">What 3mpwrapp Offers</h1>
  <div style="max-width:1200px;margin:0 auto">
    <h2 style="text-align:center;margin-bottom:2rem">🔧 Tools &amp; Resources</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:1.5rem">
      <div style="padding:1.5rem;background:var(--card-bg,#1a2332);border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08)"><h3>🔒 Evidence Locker</h3><p>Photo documents, AI extracts text, community validates — crowdsourced justice.</p><a href="/features/#evidence-locker">Learn more →</a></div>
      <div style="padding:1.5rem;background:var(--card-bg,#1a2332);border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08)"><h3>📄 Parse Claim</h3><p>AI-powered claim parsing — understand what you have and what's missing.</p><a href="/features/#parse-claim">Learn more →</a></div>
      <div style="padding:1.5rem;background:var(--card-bg,#1a2332);border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08)"><h3>📅 Deadline Tracker</h3><p>Track deadlines, get reminders — never miss a filing date.</p><a href="/features/#deadline-tracker">Learn more →</a></div>
      <div style="padding:1.5rem;background:var(--card-bg,#1a2332);border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08)"><h3>✉️ Letter Wizard</h3><p>Generate demand letters and appeals — plain language, professional output.</p><a href="/features/#letter-wizard">Learn more →</a></div>
      <div style="padding:1.5rem;background:var(--card-bg,#1a2332);border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08)"><h3>🔍 CanLII Research</h3><p>134,920+ tribunal decisions — live keyword network, denial patterns.</p><a href="/research/">Explore →</a></div>
      <div style="padding:1.5rem;background:var(--card-bg,#1a2332);border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08)"><h3>📊 Visualizations</h3><p>Interactive data visualizations — tribunal outcomes, trends, comparisons.</p><a href="/tribunal-visualizations/">Explore →</a></div>
    </div>
    <h2 style="text-align:center;margin:2rem 0 2rem">📚 Learn &amp; Grow</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:1.5rem">
      <div style="padding:1.5rem;background:var(--card-bg,#1a2332);border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08)"><h3>📖 User Guide</h3><p>Step-by-step guides — how to use every tool, from first visit to advanced.</p><a href="/user-guide/">Start →</a></div>
      <div style="padding:1.5rem;background:var(--card-bg,#1a2332);border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08)"><h3>❓ FAQ</h3><p>Frequently asked questions — quick answers to common questions.</p><a href="/faq/">Browse →</a></div>
      <div style="padding:1.5rem;background:var(--card-bg,#1a2332);border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08)"><h3>🎓 Tutorials</h3><p>Interactive tutorials — your first benefits application, accessibility setup.</p><a href="/tutorials/">Start →</a></div>
      <div style="padding:1.5rem;background:var(--card-bg,#1a2332);border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08)"><h3>📰 Blog</h3><p>Community stories, advocacy updates, transparency reports.</p><a href="/blog/">Read →</a></div>
    </div>
    <h2 style="text-align:center;margin:2rem 0 2rem">🌐 Connect &amp; Community</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:1.5rem">
      <div style="padding:1.5rem;background:var(--card-bg,#1a2332);border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08)"><h3>👥 Community Hub</h3><p>Join discussions, peer support, advocacy groups — your voice matters.</p><a href="/community/">Join →</a></div>
      <div style="padding:1.5rem;background:var(--card-bg,#1a2332);border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08)"><h3>📅 Events &amp; Campaigns</h3><p>Meetups, support groups, advocacy gatherings — active campaigns for change.</p><a href="/events/">View →</a></div>
      <div style="padding:1.5rem;background:var(--card-bg,#1a2332);border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08)"><h3>📧 Newsletter</h3><p>Monthly updates — campaign news, new features, accessibility improvements.</p><a href="/newsletter/">Subscribe →</a></div>
      <div style="padding:1.5rem;background:var(--card-bg,#1a2332);border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08)"><h3>📱 Social</h3><p>Daily updates, community stories, transparency reports — all platforms.</p><a href="/contact/">Follow →</a></div>
    </div>
  </div>
</section>

<!-- Connecting the Dots — CanLII Keyword Network -->
<section style="max-width: 1200px; margin: 3rem auto; padding: 2rem; background: linear-gradient(135deg, #1a1a2e 0%, #2d1b69 100%); border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.2); color: #fff;" aria-label="CanLII Keyword Network connecting flywheel, research, guides, and visualizations">
  <div style="text-align: center;">
    <h2 style="font-size: 1.8rem; margin-bottom: 1rem; color: #fff;">✨🔍 NEW: Connecting the Dots → CanLII Keyword Network</h2>
    <p style="font-size: 1.1rem; margin-bottom: 1.5rem; opacity: 0.95; max-width: 800px; margin-left: auto; margin-right: auto;">
      Explore 134,920+ tribunal decisions — live interactive network graph revealing keyword relationships, denial patterns, and the hidden language used in Canadian tribunal decisions. Connects flywheel insights, research data, guides, and visual graphs in one place.
    </p>
    <div style="margin: 1.5rem 0; padding: 1rem; background: rgba(0,0,0,0.3); border-radius: 8px; display: inline-block;">
      <p style="margin: 0; font-weight: 600; font-size: 1.1rem;">
        <span aria-hidden="true">🚀</span> 134,920 cases analyzed (99,036 WSIAT + 35,928 other tribunals) &nbsp;|&nbsp; <span aria-hidden="true">📊</span> 500+ keyword patterns &nbsp;|&nbsp; <span aria-hidden="true">🔗</span> Live interactive D3.js network &nbsp;|&nbsp; <span aria-hidden="true">🕸️</span> Flywheel-connected &nbsp;|&nbsp; <span aria-hidden="true">📚</span> Guides &amp; KBs linked
      </p>
    </div>
    <div style="margin-top: 1.5rem; display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
      <a href="/connecting-the-dots-canlii-keyword-visualization-network.html" style="display: inline-flex; align-items: center; gap: 0.75rem; padding: 1rem 2rem; background: var(--card-bg,#1a2332); color: var(--text-color,#1a1a2e); border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 1.1rem; box-shadow: 0 4px 16px rgba(0,0,0,0.2); transition: all 0.3s;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(0,0,0,0.3)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 16px rgba(0,0,0,0.2)'">
        <span aria-hidden="true">🔍</span>
        <span>Launch Interactive Visualization</span>
        <span aria-hidden="true">→</span>
      </a>
      <a href="/research/" style="display: inline-flex; align-items: center; gap: 0.75rem; padding: 1rem 2rem; background: rgba(0,0,0,0.35); color: #fff; border: 2px solid rgba(255,255,255,0.5); border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 1.1rem; transition: all 0.3s;" onmouseover="this.style.background='rgba(0,0,0,0.5)'" onmouseout="this.style.background='rgba(0,0,0,0.35)'">
        <span aria-hidden="true">📊</span>
        <span>All Research Tools</span>
      </a>
      <a href="/flywheels/" style="display: inline-flex; align-items: center; gap: 0.75rem; padding: 1rem 2rem; background: rgba(0,0,0,0.35); color: #fff; border: 2px solid rgba(255,255,255,0.5); border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 1.1rem; transition: all 0.3s;" onmouseover="this.style.background='rgba(0,0,0,0.5)'" onmouseout="this.style.background='rgba(0,0,0,0.35)'">
        <span aria-hidden="true">🕸️</span>
        <span>Flywheels</span>
      </a>
      <a href="/knowledge-base/" style="display: inline-flex; align-items: center; gap: 0.75rem; padding: 1rem 2rem; background: rgba(0,0,0,0.35); color: #fff; border: 2px solid rgba(255,255,255,0.5); border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 1.1rem; transition: all 0.3s;" onmouseover="this.style.background='rgba(0,0,0,0.5)'" onmouseout="this.style.background='rgba(0,0,0,0.35)'">
        <span aria-hidden="true">📚</span>
        <span>Guides &amp; KBs</span>
      </a>
      <a href="/tribunal-visualizations/" style="display: inline-flex; align-items: center; gap: 0.75rem; padding: 1rem 2rem; background: rgba(0,0,0,0.35); color: #fff; border: 2px solid rgba(255,255,255,0.5); border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 1.1rem; transition: all 0.3s;" onmouseover="this.style.background='rgba(0,0,0,0.5)'" onmouseout="this.style.background='rgba(0,0,0,0.35)'">
        <span aria-hidden="true">📈</span>
        <span>Visual Graphs</span>
      </a>
    </div>
    <p style="margin-top: 1.5rem; font-size: 0.95rem; opacity: 0.85;">
      Analyzing decisions from Ontario (WSIAT, HRTO, ONSBT), BC (BCWCAT), and more. Open source, fully transparent methodology. Flywheel insights → research data → guides → visual graphs — all connected.
    </p>
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
    <div><h3>Community</h3><ul style="list-style:none;padding:0"><li><a href="/community/">Community Hub</a></li><li><a href="/events/">Events</a></li><li><a href="/campaigns/">Campaigns</a></li><li><a href="/code-of-conduct/">Guidelines</a></li><li><a href="/contact/">Connect</a></li></ul></div>
    <div><h3>Research</h3><ul style="list-style:none;padding:0"><li><a href="/research/">Research</a></li><li><a href="/research-data-sources/">Data Sources</a></li><li><a href="/tribunal-visualizations/">Visualizations</a></li><li><a href="/how-to-use-this-data/">How to Use Data</a></li><li><a href="/blog/">Blog</a></li></ul></div>
    <div><h3>Legal &amp; Privacy</h3><ul style="list-style:none;padding:0"><li><a href="/privacy/">Privacy Policy</a></li><li><a href="/security/">Security</a></li><li><a href="/accessibility/">Accessibility</a></li><li><a href="/terms/">Terms</a></li><li><a href="/delete-data/">Delete Data</a></li></ul></div>
    <div><h3>Support</h3><ul style="list-style:none;padding:0"><li><a href="/contact/">Contact Us</a></li><li><a href="/crisis-resources/">Crisis Resources</a></li><li><a href="/newsletter/">Newsletter</a></li><li><a href="/site-map/">Site Map</a></li><li><a href="/beta/">Beta Testing</a></li></ul></div>
  </div>
</section>
