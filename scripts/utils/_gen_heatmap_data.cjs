#!/usr/bin/env node
/**
 * One-off generator for the two JSON files consumed by
 * tribunal-decision-heatmap.html:
 *   - data/outcome-by-year.json          ({ years: [{year,total,wins,losses,...}] })
 *   - data/covid-impact-analysis.json    ({ insights:[{type,finding}], periods:{...} })
 *
 * Reads the real predicted-outcome files in data/tribunal-decisions and
 * aggregates them the same way as scripts/utils/generate-outcome-statistics.js
 * and scripts/utils/covid-impact-analysis.js, but points at the repo-root data
 * directory (those scripts hardcode scripts/data/...). Output is written to the
 * repo-root data/ folder so Jekyll serves it at /data/...
 */
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data/tribunal-decisions');
const OUT_DIR = path.join(__dirname, '../../data');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const WIN_OUTCOMES = new Set(['Allowed', 'Granted', 'Partial Win', 'Allowed - Violation Found']);
const LOSS_OUTCOMES = new Set(['Dismissed', 'Dismissed - No Violation', 'Denied', 'No Jurisdiction']);

// ---- outcome-by-year ----
const byYear = {};
// ---- covid periods ----
const PERIODS = {
  PRE_COVID: { start: '2020-01-01', end: '2020-03-15', label: 'Pre-COVID (Jan-Mar 2020)' },
  EARLY_COVID: { start: '2020-03-16', end: '2020-12-31', label: 'Early COVID (Mar-Dec 2020)' },
  COVID_PEAK: { start: '2021-01-01', end: '2021-12-31', label: 'COVID Peak (2021)' },
  COVID_TRANSITION: { start: '2022-01-01', end: '2022-12-31', label: 'Transition (2022)' },
  POST_COVID: { start: '2023-01-01', end: '2026-12-31', label: 'Post-COVID (2023-2026)' },
};
const statsByPeriod = {};
Object.keys(PERIODS).forEach(k => {
  statsByPeriod[k] = { label: PERIODS[k].label, total: 0, by_outcome: {}, by_tribunal: {}, abandoned: 0, wins: 0, losses: 0 };
});

function getPeriod(date) {
  if (!date) return null;
  for (const [k, p] of Object.entries(PERIODS)) {
    if (date >= p.start && date <= p.end) return k;
  }
  return null;
}

function ensure(obj, yr) {
  if (!obj[yr]) obj[yr] = { total: 0, with_outcomes: 0, by_outcome: {}, wins: 0, losses: 0 };
  return obj[yr];
}

const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('-predicted-outcomes.json')).map(f => path.join(DATA_DIR, f));
console.log(`Found ${files.length} predicted-outcome files`);

let processed = 0;
for (const fp of files) {
  let decisions;
  try {
    decisions = JSON.parse(fs.readFileSync(fp, 'utf-8'));
  } catch (e) {
    console.warn(`skip ${path.basename(fp)}: ${e.message}`);
    continue;
  }
  if (!Array.isArray(decisions)) continue;
  for (const decision of decisions) {
    const d = decision.data || decision;
    const outcome = decision.outcome;
    const date = d.decisionDate;
    const yr = date ? date.substring(0, 4) : null;

    // year aggregation
    if (yr) {
      const y = ensure(byYear, yr);
      y.total++;
      if (outcome) {
        y.with_outcomes++;
        y.by_outcome[outcome] = (y.by_outcome[outcome] || 0) + 1;
        if (WIN_OUTCOMES.has(outcome)) y.wins++;
        else if (LOSS_OUTCOMES.has(outcome)) y.losses++;
      }
    }

    // covid period aggregation
    const period = getPeriod(date);
    if (period) {
      const s = statsByPeriod[period];
      s.total++;
      const tribunal = d.databaseId || 'unknown';
      s.by_tribunal[tribunal] = (s.by_tribunal[tribunal] || 0) + 1;
      if (outcome) {
        s.by_outcome[outcome] = (s.by_outcome[outcome] || 0) + 1;
        if (outcome === 'Abandoned') s.abandoned++;
        else if (WIN_OUTCOMES.has(outcome)) s.wins++;
        else if (LOSS_OUTCOMES.has(outcome)) s.losses++;
      }
    }
  }
  processed++;
}
console.log(`Processed ${processed} files`);

// ---- build outcome-by-year.json ----
const years = Object.entries(byYear).sort(([a], [b]) => b.localeCompare(a)).map(([year, y]) => {
  const decisive = y.wins + y.losses;
  const win_rate = decisive > 0 ? parseFloat(((y.wins / decisive) * 100).toFixed(2)) : null;
  const coverage_percent = y.total > 0 ? parseFloat(((y.with_outcomes / y.total) * 100).toFixed(2)) : 0;
  return { year, total: y.total, with_outcomes: y.with_outcomes, coverage_percent, win_rate, wins: y.wins, losses: y.losses, by_outcome: y.by_outcome };
});
fs.writeFileSync(path.join(OUT_DIR, 'outcome-by-year.json'), JSON.stringify({ generated_at: new Date().toISOString(), years }, null, 2));
console.log(`wrote outcome-by-year.json (${years.length} years)`);

// ---- build covid-impact-analysis.json ----
const changes = {};
const periodKeys = Object.keys(PERIODS);
for (let i = 1; i < periodKeys.length; i++) {
  const cur = periodKeys[i], prev = periodKeys[i - 1];
  const c = statsByPeriod[cur], p = statsByPeriod[prev];
  const volChange = p.total > 0 ? parseFloat((((c.total - p.total) / p.total) * 100).toFixed(2)) : 0;
  const cWR = (c.wins + c.losses) > 0 ? (c.wins / (c.wins + c.losses)) * 100 : null;
  const pWR = (p.wins + p.losses) > 0 ? (p.wins / (p.wins + p.losses)) * 100 : null;
  const wrChange = (cWR !== null && pWR !== null) ? parseFloat((cWR - pWR).toFixed(2)) : null;
  const cAb = c.total > 0 ? parseFloat(((c.abandoned / c.total) * 100).toFixed(2)) : 0;
  const pAb = p.total > 0 ? parseFloat(((p.abandoned / p.total) * 100).toFixed(2)) : 0;
  changes[cur] = { from: PERIODS[prev].label, to: PERIODS[cur].label, volume_change_percent: volChange, win_rate_change_percent: wrChange, abandonment_change_percent: parseFloat((cAb - pAb).toFixed(2)) };
}

const insights = [];
let maxVol = 0, maxVolKey = null;
Object.entries(statsByPeriod).forEach(([k, s]) => { if (s.total > maxVol) { maxVol = s.total; maxVolKey = k; } });
if (maxVolKey) insights.push({ type: 'volume_peak', finding: `Highest decision volume during ${PERIODS[maxVolKey].label} with ${maxVol.toLocaleString()} decisions` });
const preAb = statsByPeriod.PRE_COVID.total > 0 ? (statsByPeriod.PRE_COVID.abandoned / statsByPeriod.PRE_COVID.total) * 100 : 0;
const peakAb = statsByPeriod.COVID_PEAK.total > 0 ? (statsByPeriod.COVID_PEAK.abandoned / statsByPeriod.COVID_PEAK.total) * 100 : 0;
if (peakAb > preAb + 5) insights.push({ type: 'abandonment_spike', finding: `Abandonment rate increased from ${preAb.toFixed(1)}% pre-COVID to ${peakAb.toFixed(1)}% during COVID peak (${(peakAb - preAb).toFixed(1)}% increase)` });
const winRates = {};
Object.entries(statsByPeriod).forEach(([k, s]) => { const dec = s.wins + s.losses; if (dec > 0) winRates[k] = (s.wins / dec) * 100; });
const wrVals = Object.values(winRates);
if (wrVals.length) {
  const avg = wrVals.reduce((a, b) => a + b, 0) / wrVals.length;
  const maxDev = Math.max(...wrVals.map(v => Math.abs(v - avg)));
  if (maxDev < 5) insights.push({ type: 'win_rate_stability', finding: `Win rates remained stable across all COVID periods (avg ${avg.toFixed(1)}%, max deviation ${maxDev.toFixed(1)}%)` });
}

fs.writeFileSync(path.join(OUT_DIR, 'covid-impact-analysis.json'), JSON.stringify({ generated_at: new Date().toISOString(), analysis_period: '2020-01-01 to 2026-12-31', periods: statsByPeriod, changes, insights }, null, 2));
console.log(`wrote covid-impact-analysis.json (${Object.keys(statsByPeriod).length} periods, ${insights.length} insights)`);
console.log('DONE');
