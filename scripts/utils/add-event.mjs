#!/usr/bin/env node
/**
 * SAFE EVENT UPDATE — the ONE correct way to add/update/remove events in
 * marketing-site/api/events.json (the 24/7 feed behind 3mpwrapp.ca/events/).
 *
 * Why this exists: ad-hoc edits to the feed once shipped a start-only event
 * that the page silently dropped, and duplicate ids that rendered twice.
 * This helper makes every update pass BOTH gates before it can stick:
 *   1. data gate  (scripts/validate-events-data.mjs rules)
 *   2. render gate (scripts/verify-events-render.mjs, source mode)
 * If either gate fails, the feed is rolled back to its exact prior bytes.
 *
 * Usage:
 *   node scripts/utils/add-event.mjs <new-events.json> [--dry-run]
 *       file = one event object, an array of events, or { events: [...] }
 *       events are UPSERTED by id (existing id -> replaced, new id -> added)
 *   node scripts/utils/add-event.mjs --remove <id> [<id> ...] [--dry-run]
 *
 * After a successful run: review `git diff`, then commit + push (Cloudflare
 * auto-deploys), then verify live:
 *   node scripts/verify-events-render.mjs            # live mode
 *
 * Exit: 0 = applied+gated (or dry-run clean), 1 = validation/gate failure
 *       (feed unchanged or rolled back), 2 = usage/read error.
 */
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { validateEventsData } from '../validate-events-data.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', '..');
const FEED = path.join(ROOT, 'api', 'events.json');

function fail(msg, code = 1) { console.error(`ADD-EVENT: ${msg}`); process.exit(code); }

function loadFeed() {
  let raw;
  try { raw = fs.readFileSync(FEED, 'utf8'); } catch (e) { fail(`cannot read ${FEED}: ${e.message}`, 2); }
  let parsed;
  try { parsed = JSON.parse(raw); } catch (e) { fail(`feed is not valid JSON: ${e.message}`, 2); }
  const events = Array.isArray(parsed) ? parsed : (parsed && parsed.events);
  if (!Array.isArray(events)) fail('feed shape unexpected (want array or {events:[...]})', 2);
  return { raw, events, isArray: Array.isArray(parsed) };
}

function writeFeed(events, isArray) {
  const payload = isArray ? events : { events };
  fs.writeFileSync(FEED, JSON.stringify(payload, null, 2) + '\n', { encoding: 'utf8' });
}

function runRenderGate() {
  const r = spawnSync(process.execPath, [
    path.join(ROOT, 'scripts', 'verify-events-render.mjs'),
    '--source', path.join(ROOT, 'events', 'index.md'),
    '--api', FEED,
  ], { encoding: 'utf8', timeout: 120000 });
  return { ok: r.status === 0, out: (r.stdout || '') + (r.stderr || '') };
}

function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const rest = args.filter((a) => a !== '--dry-run');
  if (!rest.length) fail('usage: add-event.mjs <new-events.json> | --remove <id>... [--dry-run]', 2);

  const { raw: originalRaw, events: current, isArray } = loadFeed();
  const nowIso = new Date().toISOString();
  const receipt = { added: [], updated: [], removed: [], dryRun };
  let next = current.slice();

  if (rest[0] === '--remove') {
    const ids = rest.slice(1);
    if (!ids.length) fail('--remove needs at least one id', 2);
    for (const id of ids) {
      const before = next.length;
      next = next.filter((e) => e.id !== id);
      if (next.length === before) fail(`id not found in feed: ${id}`, 2);
      receipt.removed.push(id);
    }
  } else {
    let incoming;
    try { incoming = JSON.parse(fs.readFileSync(rest[0], 'utf8')); } catch (e) { fail(`cannot read input ${rest[0]}: ${e.message}`, 2); }
    const list = Array.isArray(incoming) ? incoming : (incoming && Array.isArray(incoming.events) ? incoming.events : [incoming]);
    for (const e of list) {
      if (!e || typeof e !== 'object' || !e.id) fail('every incoming event needs a string id', 2);
      const idx = next.findIndex((x) => x.id === e.id);
      const merged = { ...(idx >= 0 ? next[idx] : {}), ...e, updatedAt: nowIso };
      if (idx >= 0) { next[idx] = merged; receipt.updated.push(e.id); }
      else { merged.createdAt = merged.createdAt || nowIso; next.push(merged); receipt.added.push(e.id); }
    }
  }

  // GATE 1 — data contract on the MERGED feed (before any write).
  const { errors, warnings, receipt: dataReceipt } = validateEventsData(next);
  if (errors.length) {
    console.error('ADD-EVENT: DATA GATE FAILED — feed NOT modified:');
    errors.slice(0, 20).forEach((e) => console.error(`  - ${e}`));
    process.exit(1);
  }

  if (dryRun) {
    console.log(`ADD-EVENT: DRY-RUN OK — would add ${receipt.added.length}, update ${receipt.updated.length}, remove ${receipt.removed.length}`);
    console.log(`  merged receipt: ${JSON.stringify(dataReceipt)}`);
    process.exit(0);
  }

  // Write, then GATE 2 — execute the real page script against the new feed.
  writeFeed(next, isArray);
  const gate = runRenderGate();
  if (!gate.ok) {
    fs.writeFileSync(FEED, originalRaw, { encoding: 'utf8' }); // exact rollback
    console.error('ADD-EVENT: RENDER GATE FAILED — feed ROLLED BACK to prior bytes:');
    console.error(gate.out.split('\n').slice(0, 20).join('\n'));
    process.exit(1);
  }

  console.log('ADD-EVENT: APPLIED + BOTH GATES PASSED');
  console.log(`  changes: ${JSON.stringify(receipt)}`);
  console.log(`  feed receipt: ${JSON.stringify(dataReceipt)}`);
  if (warnings.length) console.log(`  ${warnings.length} non-blocking warning(s) — see validate-events-data.mjs output`);
  console.log('  next: git diff -> commit -> push (CF auto-deploys) -> node scripts/verify-events-render.mjs (live check)');
  process.exit(0);
}

main();