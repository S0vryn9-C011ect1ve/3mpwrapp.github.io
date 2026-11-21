#!/usr/bin/env node
// verify-hrto.js — tally committed HRTO outcome + email-keyword rates.
// Run from repo root: node scripts/verify-hrto.js
// ponytail: reads data/comprehensive-extraction/hrto-batches/batch-*.json only.
const fs = require('fs');
const path = require('path');
const dir = 'data/comprehensive-extraction/hrto-batches';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort((a, b) => {
  const na = +a.match(/batch-(\d+)/)[1], nb = +b.match(/batch-(\d+)/)[1];
  return na - nb;
});
const outcomes = {};
let total = 0, email = 0, abEmail = 0, minY = 9999, maxY = 0;
const years = {};
for (const f of files) {
  const d = require(path.join(dir, f));
  for (const x of d.decisions || []) {
    total++;
    const o = x.outcome || 'none';
    outcomes[o] = (outcomes[o] || 0) + 1;
    const k = [...(x.keywords_api || []), ...(x.keywords_extracted || [])].join(' ').toLowerCase();
    const em = /email|undeliverable|e-mail/.test(k);
    if (em) email++;
    if (o === 'abandoned' && em) abEmail++;
    const y = parseInt((x.decision_date || '').slice(0, 4));
    if (y) { if (y < minY) minY = y; if (y > maxY) maxY = y; years[y] = (years[y] || 0) + 1; }
  }
}
const ab = outcomes.abandoned || 0;
const al = outcomes.allowed || 0;
console.log(`HRTO committed batches: ${files.length} files (${files[0]}..${files[files.length - 1]})`);
console.log(`TOTAL decisions: ${total}  (years ${minY}-${maxY})`);
console.log('per-year:', years);
console.log('outcomes:', outcomes);
console.log(`abandoned: ${ab} (${(ab / total * 100).toFixed(1)}%)`);
console.log(`allowed (victory): ${al} (${(al / total * 100).toFixed(1)}%)`);
console.log(`email-keyword: ${email} (${(email / total * 100).toFixed(1)}%)`);
console.log(`abandoned w/ email-keyword: ${abEmail}/${ab} (${(abEmail / ab * 100).toFixed(1)}%)`);
