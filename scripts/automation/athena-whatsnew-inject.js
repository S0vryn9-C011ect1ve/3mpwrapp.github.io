#!/usr/bin/env node
/**
 * Athena extension — What's New JSON Feed Auto-Injector
 *
 * Purpose: close the gap where `_whats_new/*.md` posts (from commit-ingest.js)
 * and manual KB doc commits never propagate into `public/whatsnew-YYYY.json`,
 * which is what the live /whats-new page polls.
 *
 * Behaviour:
 *  1. Read latest `public/whatsnew-YYYY.json` (current year). If missing, init.
 *  2. Collect already-indexed entry dates (by `id`, not date, to avoid dupes).
 *  3. Scan `_whats_new/*.md` posts whose date >= last indexed entry date.
 *     - Parse frontmatter (date, title, layout).
 *     - Infer category from body headings: Features→feature, Fixes→fix,
 *       Improvements→improvement, Documentation→docs, System→system.
 *     - Inject one entry per post into the JSON (id = `wn-post-<file-basename>`).
 *  4. Scan `data/weekly-queue.json` for commits today tagged `docs` whose
 *     message mentions a KB article → inject as a `docs` draft entry
 *     (id = `wn-commit-<short-sha>`). This is the Bill 105 / Bill 86 path:
 *     KB doc updates made directly (not via commit-ingest) get picked up.
 *  5. Write back JSON, update lastUpdated. Idempotent — re-running skips
 *     already-present ids.
 *
 * Runs as part of Athena's daily cron (after brief generation).
 */

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, 'data');
const WHATS_NEW_DIR = path.join(ROOT, '_whats_new');
const JSON_PATH = path.join(ROOT, 'public', 'whatsnew-2026.json');
const QUEUE_PATH = path.join(DATA_DIR, 'weekly-queue.json');

function thisYear() { return new Date().getFullYear(); }

function isoNow() { return new Date().toISOString().replace(/\.\d{3}Z$/, '.000Z'); }

function loadJson() {
  if (!fs.existsSync(JSON_PATH)) {
    return { year: thisYear(), version: '1.0', lastUpdated: isoNow(), entries: [] };
  }
  return JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
}

function writeJson(data) {
  data.lastUpdated = isoNow();
  fs.mkdirSync(path.join(ROOT, 'public'), { recursive: true });
  fs.writeFileSync(JSON_PATH, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function frontmatter(md) {
  const m = /^---\n([\s\S]*?)\n---/.exec(md);
  if (!m) return {};
  const out = {};
  for (const line of m[1].split('\n')) {
    const [k, ...rest] = line.split(':');
    if (k && rest.length) out[k.trim()] = rest.join(':').trim();
  }
  return out;
}

function inferCategoryFromBody(body) {
  const lower = body.toLowerCase();
  if (/## new features|## features/.test(lower)) return 'feature';
  if (/## fixes/.test(lower)) return 'fix';
  if (/## improvements/.test(lower)) return 'improvement';
  if (/## documentation/.test(lower)) return 'docs';
  if (/## system operations/.test(lower)) return 'system';
  return 'system';
}

function collectWhatsNewPosts(data) {
  if (!fs.existsSync(WHATS_NEW_DIR)) return [];
  const existingIds = new Set(data.entries.map(e => e.id || ''));
  // Only scan posts NEWER than the latest entry already in the JSON,
  // to avoid duplicating the git-history-generated archive.
  const latestDate = data.entries.reduce((max, e) => {
    if (!e.date) return max;
    return e.date > max ? e.date : max;
  }, '1970-01-01');
  const cutoff = new Date(latestDate);
  const out = [];
  for (const f of fs.readdirSync(WHATS_NEW_DIR).filter(f => f.endsWith('.md'))) {
    const id = `wn-post-${f.slice(0, -3)}`;
    if (existingIds.has(id)) continue; // idempotent
    const full = path.join(WHATS_NEW_DIR, f);
    const raw = fs.readFileSync(full, 'utf8');
    const fm = frontmatter(raw);
    const body = raw.replace(/^---[\s\S]*?---/, '').trim();
    const date = fm.date || fm.Date || null;
    if (!date) continue;
    // skip if this post predates the existing archive (already covered by git-history JSON)
    if (new Date(date) <= cutoff) continue;
    out.push({
      id,
      title: (fm.title || f.slice(0, 60)).slice(0, 70),
      summary: body.slice(0, 140).replace(/\n+/g, ' ') || fm.title,
      date,
      category: inferCategoryFromBody(body),
      repo: 'website',
      commitSha: fm.commitSha || '',
      archived: false,
    });
  }
  return out;
}

function collectQueueDocCommits(data) {
  if (!fs.existsSync(QUEUE_PATH)) return [];
  const existingIds = new Set(data.entries.map(e => e.id || ''));
  let q;
  try { q = JSON.parse(fs.readFileSync(QUEUE_PATH, 'utf8')); } catch { return []; }
  if (!q.commits || !Array.isArray(q.commits)) return [];
  const lastIndexed = new Date(
    data.entries.reduce((max, e) => (e.date && e.date > max ? e.date : max), '1970-01-01')
  );
  const out = [];
  for (const c of q.commits) {
    const id = `wn-commit-${c.sha.slice(0, 7)}`;
    if (existingIds.has(id)) continue;
    if (c.category !== 'docs') continue;
    if (c.message && /bill 86|bill 105|knowledge base|knowledge-base|kb:/.test(c.message.toLowerCase())) {
      const d = new Date(c.date || new Date());
      if (d < lastIndexed) continue;
      out.push({
        id,
        title: c.message.slice(0, 70),
        summary: c.message.slice(0, 140),
        date: c.date || isoNow(),
        category: 'docs',
        repo: 'website',
        commitSha: c.sha.slice(0, 10),
        archived: false,
      });
    }
  }
  return out;
}

function main() {
  const data = loadJson();
  const existingIds = new Set(data.entries.map(e => e.id || ''));
  const added = [];
  added.push(...collectWhatsNewPosts(data));
  added.push(...collectQueueDocCommits(data));

  // MERGE ADDITIVELY — never drop existing entries (idempotent).
  // collectX() functions already skip ids in existingIds, but guard anyway:
  data.entries = [
    ...data.entries,
    ...added.filter(e => !existingIds.has(e.id))
  ];

  // sort newest-first by date
  data.entries.sort((a, b) => new Date(b.date) - new Date(a.date));

  if (added.length) {
    writeJson(data);
    console.log(`[athena-whatsnew-inject] Added ${added.length} new entries:`);
    for (const e of added) console.log(`  + ${e.date} [${e.category}] ${e.title.slice(0, 60)}`);
  } else {
    console.log('[athena-whatsnew-inject] No new entries to inject. Feed is current.');
  }
}

main();
