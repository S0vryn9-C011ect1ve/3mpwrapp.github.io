// verify-wsiat.js — re-runnable WSIAT claim probe (canlii-research-audit)
// Run from the canlii-recovery repo root: node scripts/verify-wsiat.js
// Reproduces every WSIAT figure checked 2026-07-20 against COMMITTED data only.
const fs = require('fs');
const path = require('path');

const DIR = 'data/tribunal-decisions/wsiat/decisions-by-year';
const files = fs.readdirSync(DIR).filter(f => f.endsWith('.json'));
const recs = [];
for (const f of files) {
  const fullPath = path.join(DIR, f);
  const content = fs.readFileSync(fullPath, 'utf-8');
  recs.push(...JSON.parse(content));
}

const txt = r => ((r.DecKeywords || '') + ' ' + (r.DecSummary || '')).toLowerCase();

// 1. Total committed (post claims 98,992 from "Portal export")
console.log('COMMITTED records:', recs.length, '(post claims 98,992 Portal export)');
const metaPath = 'data/tribunal-decisions/wsiat/wsiat-metadata.json';
if (fs.existsSync(metaPath)) {
  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
  console.log('metadata.totalDecisions:', meta.totalDecisions,
    '(sum decisionsByYear:', Object.values(meta.decisionsByYear).reduce((a, b) => a + b, 0) + ')');
}

// 2. Keyword co-occurrences (post claims from Portal export)
const pairs = {
  'NEL+Permanent Impairment (post 11,516)': ['nel', 'permanent impairment'],
  'LOE+Loss of Earnings (post 9,167)': ['loe', 'loss of earnings'],
  'Pre-existing+SIEF (post 3,281)': ['pre-existing', 'sief'],
};
for (const [label, [a, b]] of Object.entries(pairs)) {
  const c = recs.filter(r => txt(r).includes(a) && txt(r).includes(b)).length;
  console.log(label + ' =>', c);
}

// 3. July 2023 (post claims 39; attributed to WSIAT 98,992 dataset)
const jul2023 = recs.filter(r => String(r.year) === '23' &&
  /-(\d{1,2})-/.test(r.DecDate || '') && parseInt((r.DecDate || '').match(/-(\d{1,2})-/)[1]) === 7).length;
console.log('July 2023 (year==23, month==7):', jul2023, '(post claims 39)');

// 4. Year 2024 committed (post claims 43.9% missing = 1,545 of 3,516 expected)
const y24 = recs.filter(r => String(r.year) === '24').length;
console.log("year=='24' committed:", y24, '(post implies ~3,516 expected / 1,971 CanLII)');

// 5. Knee stats (post claims 20% knee cite pre-existing; 13.3% baseline)
const knee = recs.filter(r => txt(r).includes('knee')).length;
const kneePre = recs.filter(r => txt(r).includes('knee') && txt(r).includes('pre-existing')).length;
console.log('knee mentions:', knee, '| knee+pre-existing:', kneePre,
  '=>', (kneePre / knee * 100).toFixed(1) + '% (post claims 20%)');

// 6. Complexity field (post claims 19.85/23.01/2.81 simple/moderate/complex)
const hasComplexity = recs.some(r => Object.keys(r).some(k => /complex|issue/i.test(k)));
console.log('complexity/issue field present:', hasComplexity, '(post 19.85/23.01/2.81 uncalculable if false)');

// 7. Portal export files committed? (search for a raw 98,992 export)
console.log('NOTE: Portal CSV export files are NOT committed; only parsed JSON + wsiat-metadata.json asserting totalDecisions=98992.');