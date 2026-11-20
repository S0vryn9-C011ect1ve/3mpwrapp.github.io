#!/usr/bin/env node
/**
 * EVENTS DATA GATE — validate api/events.json before it can ship.
 *
 * Why: /events/ is a 24/7 event-sharing source for all 3mpwrapp user bases.
 * On 2026-11-20 a dead inline script left the page blank for 12+ hours while
 * the feed itself was fine. This gate is the DATA half of the defense: it
 * rejects any feed that would crash the renderer or silently drop events.
 * The RENDER half is scripts/verify-events-render.mjs.
 *
 * Contract (mirrors events/index.md loadEvents + homepage index.md panel):
 *   - feed is a JSON array of events, OR an object { events: [...] }
 *   - every event: id (unique), title, description (renderer calls .replace
 *     on it — missing description CRASHES the whole page), and a parseable
 *     date via date || dateISO || start || end
 *   - any date/dateISO/start/end field that IS present must itself parse
 *   - an EMPTY feed is a failure: a 24/7 events source never ships zero events
 *
 * Usage:
 *   node scripts/validate-events-data.mjs [--file path/to/events.json]
 * Exit: 0 = healthy, 1 = errors (block commit/deploy), 2 = unreadable file.
 *
 * Also exports validateEventsData() for scripts/utils/add-event.mjs.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_FILE = path.join(__dirname, '..', 'api', 'events.json');

// Categories observed in the live feed (2026-11-20). Unknown categories are
// a WARNING, not an error — the page renders any category string.
const KNOWN_CATEGORIES = new Set([
  'community', 'support', 'educational', 'advocacy', 'rally', 'vigil',
  'holiday', 'health', 'health-awareness', 'research', 'memorial',
  'info-session', 'public-meeting', 'public-event', 'workshop', 'conference',
  'fundraiser', 'social', 'cultural', 'webinar', 'meeting', 'training',
  'ceremony', 'protest', 'tabling', 'information', 'drop-in', 'awareness',
]);

function parseable(v) {
  if (v === undefined || v === null || v === '') return false;
  return !isNaN(new Date(v).getTime());
}

/**
 * Validate a parsed feed. Returns { errors, warnings, receipt }.
 * `raw` may be an array or { events: [...] }. `now` defaults to current time.
 */
export function validateEventsData(raw, now = new Date()) {
  const errors = [];
  const warnings = [];
  let events = null;
  if (Array.isArray(raw)) events = raw;
  else if (raw && typeof raw === 'object' && Array.isArray(raw.events)) events = raw.events;
  else {
    errors.push('FEED SHAPE: expected a JSON array of events or an object with an "events" array');
    return { errors, warnings, receipt: { total: 0 } };
  }

  if (events.length === 0) {
    errors.push('EMPTY FEED: 0 events — a 24/7 events source must never ship an empty feed');
  }

  const seenIds = new Map();
  const byCategory = {};
  let upcoming = 0, past = 0, undated = 0;

  events.forEach((e, idx) => {
    const label = `event #${idx + 1} "${String(e && e.title || '').slice(0, 50)}" [${e && e.id || 'no-id'}]`;
    if (!e || typeof e !== 'object') { errors.push(`${label}: not an object`); return; }
    if (!e.id || typeof e.id !== 'string') errors.push(`${label}: missing/non-string id`);
    else if (seenIds.has(e.id)) errors.push(`${label}: DUPLICATE id (first at #${seenIds.get(e.id) + 1}) — renders twice; upsert by id instead`);
    else seenIds.set(e.id, idx);
    if (!e.title || typeof e.title !== 'string') errors.push(`${label}: missing/non-string title`);
    if (!e.description || typeof e.description !== 'string') errors.push(`${label}: missing/non-string description — renderEventCard calls .replace() on it and would CRASH the page`);

    // Date contract: normalized date = date || dateISO || start || end.
    const norm = e.date || e.dateISO || e.start || e.end;
    if (!parseable(norm)) {
      errors.push(`${label}: no parseable date/dateISO/start/end — SILENTLY DROPPED from display`);
      undated++;
    } else {
      // Each present field must itself parse (a garbage `date` masks a good
      // `start` after normalization and still drops the event).
      for (const f of ['date', 'dateISO', 'start', 'end']) {
        if (e[f] !== undefined && e[f] !== null && e[f] !== '' && !parseable(e[f])) {
          errors.push(`${label}: field "${f}" present but unparseable: ${JSON.stringify(e[f])}`);
        }
      }
      if (new Date(norm) >= now) upcoming++; else past++;
    }

    if (!e.category) warnings.push(`${label}: missing category (renders, but no badge/filter grouping)`);
    else if (!KNOWN_CATEGORIES.has(e.category)) warnings.push(`${label}: unusual category "${e.category}"`);
    if (e.status === 'cancelled' || e.status === 'postponed') warnings.push(`${label}: status=${e.status} but the page still renders it — consider removing or annotating`);
    byCategory[e.category || '(none)'] = (byCategory[e.category || '(none)'] || 0) + 1;
  });

  return {
    errors, warnings,
    receipt: { total: events.length, upcoming, past, undated, byCategory, warnings: warnings.length },
  };
}

function main() {
  const args = process.argv.slice(2);
  let file = DEFAULT_FILE;
  const fi = args.indexOf('--file');
  if (fi !== -1 && args[fi + 1]) file = args[fi + 1];

  let raw;
  try {
    raw = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    console.error(`EVENTS DATA GATE — UNREADABLE (${file}): ${err.message}`);
    process.exit(2);
  }

  const { errors, warnings, receipt } = validateEventsData(raw);
  if (errors.length) {
    console.error(`EVENTS DATA GATE — FAILURE (${file})`);
    errors.slice(0, 25).forEach((e) => console.error(`  - ${e}`));
    if (errors.length > 25) console.error(`  ... and ${errors.length - 25} more errors`);
    console.error('Fix the feed (use scripts/utils/add-event.mjs for safe updates), then re-run.');
    process.exit(1);
  }
  console.log(`EVENTS DATA GATE — HEALTHY (${file})`);
  console.log(`  receipt: ${JSON.stringify(receipt)}`);
  if (warnings.length) {
    console.log(`  ${warnings.length} warning(s) (non-blocking):`);
    warnings.slice(0, 8).forEach((w) => console.log(`    ! ${w}`));
    if (warnings.length > 8) console.log(`    ... and ${warnings.length - 8} more`);
  }
  process.exit(0);
}

// Run only when invoked directly (not when imported by add-event.mjs).
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}