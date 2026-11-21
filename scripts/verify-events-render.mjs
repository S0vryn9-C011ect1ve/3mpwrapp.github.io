#!/usr/bin/env node
/**
 * verify-events-render.mjs — 24/7 functional guard for the 3mpwrapp events page.
 *
 * WHY THIS EXISTS: on 2026-11-20 a single SyntaxError in the events inline
 * script left the page showing empty boxes for 12+ hours. HTTP-200 monitoring
 * and deploy-job status both said "healthy" the whole time. The events page is
 * the public surface of the Collective Evidence flywheel — events for ALL user
 * bases — so it must be visible 24/7 and downtime must be detected in minutes.
 *
 * WHAT IT DOES (falsifiable, not HTTP-only):
 *   1. Fetches the LIVE page and the LIVE events API (cache-busted).
 *   2. Syntax-checks every inline script (vm.Script, no execution).
 *   3. Validates the API data contract (every event needs a parseable
 *      dateISO/date, id, title, description — otherwise it is silently dropped).
 *   4. EXECUTES the page's scripts in a stub DOM and asserts the rendered
 *      result: upcoming card count must equal an independently computed
 *      expected count, no "Connection Issue" error box, spot-checked titles.
 *   5. Baked-in selftest replays 4 fixtures (healthy / syntax-bug / runtime-bug
 *      / empty-API) on EVERY run. If the harness cannot tell good from bad it
 *      exits 2 (BLIND) — it never reports a false "healthy".
 *
 * Usage:
 *   node scripts/verify-events-render.mjs                 # live watchdog mode
 *   node scripts/verify-events-render.mjs --verbose       # + receipt
 *   node scripts/verify-events-render.mjs https://<preview>.3mpwrapp.pages.dev/events/
 *                                                         # verify a specific deployment
 *   node scripts/verify-events-render.mjs --source events/index.md --api api/events.json
 *                                                         # pre-deploy gate (no network)
 *   node scripts/verify-events-render.mjs --selftest-only
 *
 * Exit codes: 0 = healthy (silent unless --verbose), 1 = findings (alert),
 *             2 = blind / degraded / tool error (alert, distinct from findings).
 */
import fs from 'node:fs';
import vm from 'node:vm';
import process from 'node:process';
import { extractInlineScripts, syntaxError, selftest as syntaxSelftest } from './check-inline-js.mjs';

const PAGE_URL = 'https://3mpwrapp.ca/events/';
const API_URL = 'https://3mpwrapp.ca/api/events.json';
const UA = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) EventsGuard/1.0' };

// Async errors from layout scripts (promises, timers) land OUTSIDE the
// per-block try/catch. Capture them instead of letting node die: the hard
// render assertions below still decide pass/fail; these become warnings.
const asyncErrors = [];
process.on('unhandledRejection', (r) => asyncErrors.push(`unhandledRejection: ${(r && r.message) || r}`));
process.on('uncaughtException', (e) => asyncErrors.push(`uncaughtException: ${e.message}`));

// ---------------------------------------------------------------- stub DOM
function makeEl(id) {
  const el = {
    _html: '', textContent: '', value: '', style: {}, dataset: {}, title: '',
    classList: { contains: () => false, add() {}, remove() {} },
    setAttribute() {}, getAttribute() { return null; }, remove() {},
    addEventListener() {}, appendChild() {},
    querySelector() { return null; }, querySelectorAll() { return []; },
    getElementsByTagName() { return []; }, getElementsByClassName() { return []; },
  };
  Object.defineProperty(el, 'innerHTML', {
    get() { return this._html; },
    set(v) {
      this._html = String(v);
      // Approximate textarea decoding closely enough for assertions
      // (the page's share-button decodeHTMLEntities reads textarea.value).
      this.textContent = this._html
        .replace(/<[^>]*>/g, '')
        .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"').replace(/&#39;/g, "'");
      this.value = this.textContent;
    },
  });
  if (id) el.id = id;
  return el;
}

function makeSandbox(apiPayload, fetchLog) {
  const byId = new Map();
  const document = {
    readyState: 'complete',
    getElementById(id) { if (!byId.has(id)) byId.set(id, makeEl(id)); return byId.get(id); },
    createElement(tag) { return makeEl(); },
    addEventListener() {}, querySelector() { return null; }, querySelectorAll() { return []; },
    body: makeEl(),
  };
  const windowObj = {
    performance: { now: () => Date.now() },
    location: { href: PAGE_URL },
    screen: { width: 1920, height: 1080 },
    open: () => null, addEventListener() {},
  };
  const consoleCaptured = { errors: [], warns: [], logs: [] };
  // Layout scripts (e.g. transparency banner) use Web Storage; without a stub
  // they throw ReferenceError in async callbacks and kill the gate process.
  const makeStorage = () => {
    const m = new Map();
    return {
      getItem: (k) => (m.has(String(k)) ? m.get(String(k)) : null),
      setItem: (k, v) => { m.set(String(k), String(v)); },
      removeItem: (k) => { m.delete(String(k)); },
      clear: () => m.clear(),
      key: (i) => [...m.keys()][i] ?? null,
      get length() { return m.size; },
    };
  };
  const localStorage = makeStorage();
  const sessionStorage = makeStorage();
  windowObj.localStorage = localStorage;
  windowObj.sessionStorage = sessionStorage;
  windowObj.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
  document.cookie = '';
  const stubFetch = async (url) => {
    fetchLog.push(String(url));
    if (/\/api\/events\.json/.test(String(url))) {
      return { ok: true, status: 200, statusText: 'OK', json: async () => apiPayload };
    }
    return { ok: false, status: 404, statusText: 'Not Found (stub)', json: async () => ({}) };
  };
  const sandbox = {
    document, window: windowObj, navigator: { onLine: true, userAgent: 'EventsGuard' },
    fetch: stubFetch,
    localStorage, sessionStorage, matchMedia: windowObj.matchMedia,
    console: { log: (...a) => consoleCaptured.logs.push(a.map((x) => (typeof x === 'object' ? JSON.stringify(x) : String(x))).join(' ')), info() {}, warn: (...a) => consoleCaptured.warns.push(a.join(' ')), error: (...a) => consoleCaptured.errors.push(a.join(' ')) },
    setInterval: () => 0, clearInterval() {}, setTimeout: () => 0, clearTimeout() {},
    requestAnimationFrame: () => 0, alert() {},
    performance: windowObj.performance, location: windowObj.location,
    Date, Math, JSON, parseInt, parseFloat, isNaN, isFinite,
    encodeURIComponent, decodeURIComponent, String, Number, Array, Object, RegExp, Error, Promise,
    URLSearchParams, URL, TextEncoder, TextDecoder,
  };
  sandbox.globalThis = sandbox;
  return { sandbox, byId, consoleCaptured };
}

// ------------------------------------------- independent expected counts
// Re-implements the page's ACTUAL filter contract (events/index.md loadEvents)
// from scratch so the assertion is independent of the code under test:
//   - keep categories always kept
//   - holiday/health dropped ONLY if timestamped within the last hour
//   - page normalizes date = date || dateISO || start || end, then splits on it
function expectedCounts(apiEvents, now) {
  const nd = (e) => e.date || e.dateISO || e.start || e.end;
  const keep = ['community', 'support', 'educational', 'advocacy', 'rally'];
  const filtered = apiEvents.filter((e) => {
    if (keep.includes(e.category)) return true;
    if (e.category === 'holiday' || e.category === 'health') {
      const eventTime = new Date(nd(e)).getTime();
      const isRecentlyTimestamped = eventTime > now.getTime() - 3600000 && eventTime <= now.getTime();
      return !isRecentlyTimestamped;
    }
    return true;
  });
  const d = (e) => new Date(nd(e));
  // 30-day archive grace mirrors events/index.md evtArchiveCutoff (2026-11-20):
  // an event stays Upcoming until 30 days after its date, then archives.
  const cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  return {
    upcoming: filtered.filter((e) => d(e) >= cutoff),
    past: filtered.filter((e) => d(e) < cutoff),
  };
}

function validateApiData(apiEvents, findings) {
  let bad = 0;
  for (const e of apiEvents) {
    const problems = [];
    if (!e.id) problems.push('missing id');
    if (!e.title) problems.push('missing title');
    if (!e.description) problems.push('missing description');
    const dt = new Date(e.date || e.dateISO || e.start || e.end);
    if (isNaN(dt.getTime())) problems.push(`no parseable date/dateISO/start/end (has: ${JSON.stringify(e.date ?? e.dateISO ?? e.start ?? null)}) — SILENTLY DROPPED from display`);
    if (problems.length) {
      bad++;
      if (bad <= 10) findings.push(`DATA: event "${(e.title || e.id || '?').slice(0, 60)}" [${e.id || 'no-id'}]: ${problems.join('; ')}`);
    }
  }
  if (bad > 10) findings.push(`DATA: ...and ${bad - 10} more event(s) with contract violations`);
}

// ------------------------------------------------------------- harness
export async function runRenderHarness(pageHtml, apiPayload) {
  const findings = [];
  const warnings = [];
  const blocks = extractInlineScripts(pageHtml);
  const checkable = blocks.filter((b) => b.kind === 'check');
  const skipped = blocks.length - checkable.length;

  // 1) syntax first — the exact outage class
  for (const b of checkable) {
    const err = syntaxError(b.code, `events-page:${b.startLine}`);
    if (err) findings.push(`SYNTAX: inline script at line ${b.startLine}: ${err}`);
  }

  // 2) data contract
  const apiEvents = Array.isArray(apiPayload) ? apiPayload : (apiPayload && Array.isArray(apiPayload.events) ? apiPayload.events : null);
  if (!apiEvents) {
    findings.push('DATA: events API payload is not an array and has no .events array');
    return { findings, warnings, receipt: { blocks: checkable.length, skipped } };
  }
  validateApiData(apiEvents, findings);

  // 3) execute scripts in stub DOM (browser semantics: each block isolated)
  const fetchLog = [];
  const { sandbox, byId, consoleCaptured } = makeSandbox(apiPayload, fetchLog);
  const ctx = vm.createContext(sandbox);
  let eventsBlockRan = false;
  for (const b of checkable) {
    const isEventsBlock = /upcoming-events-list/.test(b.code) && /loadEvents|renderEventCard/.test(b.code);
    try {
      vm.runInContext(b.code, ctx, { filename: `events-page:${b.startLine}`, timeout: 5000 });
      if (isEventsBlock) eventsBlockRan = true;
    } catch (err) {
      if (isEventsBlock) findings.push(`RENDER: events script threw at load: ${err.message}`);
      else warnings.push(`non-events inline script at line ${b.startLine} threw in stub DOM (may be stub artifact): ${err.message}`);
    }
  }
  if (!eventsBlockRan && !findings.some((f) => f.startsWith('SYNTAX'))) {
    findings.push('NO-EVENTS-SCRIPT: no inline script containing the events renderer was found on the page');
  }

  // 4) wait for async loadEvents() to reach a terminal state. The page writes
  //    its sync-status line LAST (success / empty / error), so that is the
  //    reliable completion signal — not "container non-empty".
  //    NOTE: elements must be read LIVE from byId — the page creates some of
  //    them only after its first await, so a reference captured before the
  //    poll can be stale (undefined) even though the page later renders fine.
  const syncEl = byId.get('events-sync-status');
  const deadline = Date.now() + 10000;
  const terminal = () => {
    const s = syncEl ? syncEl.textContent : '';
    if (/^(✅|⚠️|📭)/.test(s)) return true;
    const el = byId.get('upcoming-events-list');
    const html = el ? el.innerHTML : '';
    return /event-card|info-box|warning-box/.test(html);
  };
  while (Date.now() < deadline) {
    if (terminal()) break;
    const el = byId.get('upcoming-events-list');
    if (el && /warning-box|Connection Issue/.test(el.innerHTML)) break;
    if (findings.some((f) => f.startsWith('RENDER'))) break;
    await new Promise((r) => setTimeout(r, 50));
  }
  const upcomingEl = byId.get('upcoming-events-list');
  const upcomingHtml = upcomingEl ? upcomingEl.innerHTML : '';
  const pastEl = byId.get('past-events-list');
  const pastHtml = pastEl ? pastEl.innerHTML : '';
  for (const m of asyncErrors.splice(0)) warnings.push(`async script error (layout or events): ${m}`);
  const pageLog = consoleCaptured.logs.filter((l) => /📅|🎯|❌|✅ Loaded/.test(l)).join(' | ');

  if (/warning-box|Connection Issue/.test(upcomingHtml)) {
    const msgMatch = upcomingHtml.match(/<p[^>]*>([^<]*(?:Error|error)[^<]*)<\/p>/);
    findings.push(`RENDER: page shows its error box instead of events${msgMatch ? ' — ' + msgMatch[1].trim() : ''}${consoleCaptured.errors.length ? ' | console: ' + consoleCaptured.errors[0].slice(0, 200) : ''}`);
  }

  // 5) independent count assertions (±5s boundary tolerance)
  const now = new Date();
  const cardCount = (html) => (html.match(/<article class="event-card"/g) || []).length;
  const renderedUpcoming = cardCount(upcomingHtml);
  const renderedPast = cardCount(pastHtml);
  let exp = expectedCounts(apiEvents, now);
  const matches = (r, e) => r === e.upcoming.length || r === expectedCounts(apiEvents, new Date(now.getTime() - 5000)).upcoming.length || r === expectedCounts(apiEvents, new Date(now.getTime() + 5000)).upcoming.length;
  if (exp.upcoming.length === 0) {
    findings.push('API-EMPTY: 0 upcoming events in the API — the community events surface is empty for all user bases');
  } else if (!matches(renderedUpcoming, exp)) {
    findings.push(`COUNT-MISMATCH: page rendered ${renderedUpcoming} upcoming event card(s), independently expected ${exp.upcoming.length}`);
  }
  if (exp.past.length > 0) {
    const pastSection = byId.get('past-events');
    const pastShown = pastSection && pastSection.style.display === 'block';
    const pastMatches = renderedPast === exp.past.length || renderedPast === expectedCounts(apiEvents, new Date(now.getTime() - 5000)).past.length || renderedPast === expectedCounts(apiEvents, new Date(now.getTime() + 5000)).past.length;
    if (!pastShown || !pastMatches) findings.push(`PAST-MISMATCH: past archive shown=${!!pastShown} rendered=${renderedPast} expected=${exp.past.length}`);
  }
  // spot-check first 3 upcoming titles actually present in rendered HTML
  for (const e of exp.upcoming.slice(0, 3)) {
    if (e.title && !upcomingHtml.includes(e.title)) {
      findings.push(`TITLE-MISSING: expected upcoming event "${e.title.slice(0, 60)}" not found in rendered HTML`);
    }
  }
  return {
    findings, warnings,
    receipt: {
      blocks: checkable.length, skipped, apiTotal: apiEvents.length,
      expectedUpcoming: exp.upcoming.length, expectedPast: exp.past.length,
      renderedUpcoming, renderedPast, fetches: fetchLog.length,
      consoleErrors: consoleCaptured.errors.length, warnings: warnings.length,
      syncStatus: syncEl ? syncEl.textContent : '(missing)', pageLog: pageLog.slice(0, 400),
    },
  };
}

// ------------------------------------------------------------- selftest
const FUTURE1 = new Date(Date.now() + 86400000 * 3).toISOString();
const FUTURE2 = new Date(Date.now() + 86400000 * 10).toISOString();
const PAST1 = new Date(Date.now() - 86400000 * 40).toISOString(); // 40d ago — clearly past the 30-day archive grace
const FIX_API = { events: [
  { id: 't1', title: 'Test Rally One', description: 'd', date: FUTURE1, category: 'rally', location: 'Toronto' },
  { id: 't2', title: 'Test Support Two', description: 'd', date: FUTURE2, category: 'support' },
  { id: 't3', title: 'Past Vigil Three', description: 'd', date: PAST1, category: 'vigil' },
] };
const FIX_DIVS = '<div id="loading-indicator"></div><span id="upcoming-count"></span><div id="upcoming-events-list"></div><div id="upcoming-empty"></div><section id="past-events"><span id="past-count"></span><div id="past-events-list"></div><div id="past-empty"></div></section>';
const FIX_GOOD_SCRIPT = `<script>
async function loadEvents() {
  try {
    const res = await fetch('/api/events.json?ts=' + Date.now());
    const data = await res.json();
    // Mirror the real page: containers are fetched AFTER the first await.
    const box = document.getElementById('upcoming-events-list');
    const ev = data.events || [];
    const now = new Date();
    const cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const up = ev.filter(e => new Date(e.dateISO || e.date) >= cutoff);
    const past = ev.filter(e => new Date(e.dateISO || e.date) < cutoff);
    document.getElementById('loading-indicator').style.display = 'none';
    document.getElementById('upcoming-count').textContent = up.length;
    box.innerHTML = up.length ? up.map(e => '<article class="event-card"><h3>' + e.title + '</h3></article>').join('') : '<div class="info-box">No Upcoming Events</div>';
    if (past.length) {
      document.getElementById('past-events').style.display = 'block';
      document.getElementById('past-count').textContent = past.length;
      document.getElementById('past-events-list').innerHTML = past.map(e => '<article class="event-card"><h3>' + e.title + '</h3></article>').join('');
    }
  } catch (err) {
    box.innerHTML = '<div class="warning-box"><h3>Connection Issue</h3><p>Error: ' + err.message + '</p></div>';
  }
}
loadEvents();
</script>`;
const FIX_SYNTAX_SCRIPT = '<script>\nconst card = (event) => `\n  ${event.imageUrl ? \\`<img>\\` : \'\'}\n`;\nloadEvents();\n' + FIX_GOOD_SCRIPT.slice(8);
const FIX_RUNTIME_SCRIPT = '<script>function loadEvents(){ throw new Error("boom"); }\nloadEvents();\n</script>';

async function selftest() {
  const missing = [];
  const good = await runRenderHarness(FIX_DIVS + FIX_GOOD_SCRIPT, FIX_API);
  if (good.findings.length !== 0 || good.receipt.renderedUpcoming !== 2 || good.receipt.renderedPast !== 1) {
    missing.push(`healthy fixture failed: findings=${JSON.stringify(good.findings)} receipt=${JSON.stringify(good.receipt)}`);
  }
  const syn = await runRenderHarness(FIX_DIVS + FIX_SYNTAX_SCRIPT, FIX_API);
  if (!syn.findings.some((f) => f.startsWith('SYNTAX'))) missing.push('syntax-bug fixture not detected');
  const run = await runRenderHarness(FIX_DIVS + FIX_RUNTIME_SCRIPT, FIX_API);
  if (run.findings.length === 0) missing.push('runtime-bug fixture not detected');
  const empty = await runRenderHarness(FIX_DIVS + FIX_GOOD_SCRIPT, { events: [] });
  if (!empty.findings.some((f) => f.startsWith('API-EMPTY'))) missing.push('empty-API fixture not detected');
  return missing;
}

// ------------------------------------------------------------- fetching
async function fetchWithRetry(url, asJson) {
  let lastErr;
  for (let i = 0; i < 2; i++) {
    try {
      const res = await fetch(url + (url.includes('?') ? '&' : '?') + 'ts=' + Date.now(), { cache: 'no-store', headers: UA });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return asJson ? await res.json() : await res.text();
    } catch (err) { lastErr = err; await new Promise((r) => setTimeout(r, 1500)); }
  }
  throw lastErr;
}

async function main() {
  const args = process.argv.slice(2);
  const verbose = args.includes('--verbose');
  // Selftests on EVERY invocation — blind harness must never say "healthy".
  const blindSyntax = syntaxSelftest();
  const blindRender = await selftest();
  const blind = [...blindSyntax, ...blindRender];
  if (blind.length) {
    console.error(`EVENTS GUARD: **BLIND** — selftest failed: ${blind.join(' | ')}`);
    process.exit(2);
  }
  if (args.includes('--selftest-only')) {
    console.log('events-guard selftest: OK (healthy=2 upcoming/1 past rendered; syntax-bug, runtime-bug, empty-API all detected)');
    process.exit(0);
  }

  const srcIdx = args.indexOf('--source');
  const apiIdx = args.indexOf('--api');
  let pageHtml, apiPayload, origin;
  try {
    if (srcIdx !== -1) {
      const srcFile = args[srcIdx + 1];
      pageHtml = fs.readFileSync(srcFile, 'utf8');
      apiPayload = apiIdx !== -1 ? JSON.parse(fs.readFileSync(args[apiIdx + 1], 'utf8')) : await fetchWithRetry(API_URL, true);
      origin = `source ${srcFile}`;
    } else {
      const positionalUrl = args.find((a) => /^https?:\/\//.test(a));
      const pageUrl = positionalUrl || PAGE_URL;
      const apiUrl = positionalUrl ? new URL('/api/events.json', positionalUrl).href : API_URL;
      [pageHtml, apiPayload] = await Promise.all([fetchWithRetry(pageUrl, false), fetchWithRetry(apiUrl, true)]);
      origin = `live ${pageUrl}`;
    }
  } catch (err) {
    console.error(`EVENTS GUARD: DEGRADED — could not fetch page/API: ${err.message}. Cannot verify the events surface; treat as unverified, not healthy.`);
    process.exit(2);
  }

  const t0 = Date.now();
  const { findings, warnings, receipt } = await runRenderHarness(pageHtml, apiPayload);
  const ms = Date.now() - t0;

  if (findings.length) {
    console.error(`EVENTS PAGE GUARD — FAILURE (${origin})`);
    for (const f of findings) console.error('  - ' + f);
    if (warnings.length && verbose) for (const w of warnings) console.error('  (warn) ' + w);
    console.error(`Impact: the events page is not correctly showing events for the user bases. Receipt: ${JSON.stringify(receipt)}`);
    console.error('Recovery: cd C:/Users/HP/marketing-site && git log --oneline -5 -- events/index.md api/events.json');
    console.error('  identify the offending commit, then: git revert <sha> && git push origin main (auto-deploys).');
    console.error('  verify after deploy: node scripts/verify-events-render.mjs --verbose');
    process.exit(1);
  }
  if (verbose) {
    console.log(`EVENTS PAGE GUARD — HEALTHY (${origin}, ${ms}ms)`);
    console.log(`  receipt: ${JSON.stringify(receipt)}`);
    if (warnings.length) for (const w of warnings) console.log('  (warn) ' + w);
  }
  process.exit(0);
}

main().catch((err) => { console.error(`EVENTS GUARD: TOOL ERROR — ${err.stack || err.message}`); process.exit(2); });
