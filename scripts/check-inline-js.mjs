#!/usr/bin/env node
/**
 * check-inline-js.mjs — syntax gate for inline <script> blocks in Jekyll source.
 *
 * WHY THIS EXISTS: on 2026-11-20 the events page shipped with escaped backticks
 * (\`) inside a template-literal interpolation (${event.imageUrl ? \`...\` : ''}).
 * That is a SyntaxError: the escape is only valid in the template's string part,
 * not inside ${...}. One bad character killed the ENTIRE events script and the
 * page showed empty boxes for 12+ hours while every deploy job reported success.
 *
 * This gate compiles every inline script with vm.Script — browser-script
 * semantics, WITHOUT executing anything — so that class of fault can never
 * reach a deploy again. It is falsifiable: a baked-in selftest replays the
 * exact outage fixture on every invocation and refuses to report clean while
 * blind (exit 2).
 *
 * Usage:
 *   node scripts/check-inline-js.mjs [root]        # scan source tree (default '.')
 *   node scripts/check-inline-js.mjs --live <url>  # check a served page
 *   node scripts/check-inline-js.mjs --selftest-only
 *
 * Exit codes: 0 = clean, 1 = findings, 2 = blind / tool error (never "clean").
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

const SKIP_DIRS = new Set(['_site', '.git', 'node_modules', '_posts_broken', '_deploy', 'vendor', '.wrangler', '.backups']);
const JS_TYPES = new Set(['', 'text/javascript', 'application/javascript', 'module']);

/**
 * Extract inline <script> blocks from page source.
 * Returns [{code, startLine, kind}] where kind is 'check' | 'liquid' | 'module'.
 * Fenced code blocks and {% comment %} regions are blanked (line-preserving)
 * so documentation examples are never mistaken for shipped code. {% raw %}
 * regions ARE shipped verbatim by Jekyll, so they are deliberately kept.
 */
export function extractInlineScripts(text) {
  const blank = (s) => s.replace(/[^\n]/g, ' ');
  let t = text.replace(/^(```|~~~)[\s\S]*?^\1[ \t]*$/gm, blank);
  t = t.replace(/\{%-?\s*comment\s*-?%\}[\s\S]*?\{%-?\s*endcomment\s*-?%\}/g, blank);
  const blocks = [];
  const re = /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi;
  let m;
  while ((m = re.exec(t)) !== null) {
    const attrs = m[1] || '';
    const code = m[2];
    if (/\bsrc\s*=/i.test(attrs)) continue; // external file, not inline
    const typeM = attrs.match(/\btype\s*=\s*["']?([^"'\s>]+)/i);
    const type = typeM ? typeM[1].toLowerCase() : '';
    if (!JS_TYPES.has(type)) continue; // JSON-LD etc. is data, not JS
    if (!code.trim()) continue;
    const startLine = t.slice(0, m.index).split('\n').length;
    if (type === 'module') { blocks.push({ code, startLine, kind: 'module' }); continue; }
    if (/\{%|\{\{/.test(code)) { blocks.push({ code, startLine, kind: 'liquid' }); continue; }
    blocks.push({ code, startLine, kind: 'check' });
  }
  return blocks;
}

/** Compile one block without executing. Returns null if OK, else an error string. */
export function syntaxError(code, filename) {
  try {
    new vm.Script(code, { filename });
    return null;
  } catch (err) {
    if (err instanceof SyntaxError) return err.message;
    return `unexpected compile error: ${err.message}`;
  }
}

/** The exact 2026-11-20 outage fault, and its fix, as permanent fixtures. */
const FAULT_FIXTURE = 'const card = (event) => `\n  ${event.imageUrl ? \\`<img src="${event.imageUrl}">\\` : \'\'}\n`;';
const FIXED_FIXTURE = 'const card = (event) => `\n  ${event.imageUrl ? `<img src="${event.imageUrl}">` : \'\'}\n`;';
const RUNTIME_FIXTURE = 'definitelyNotDefinedAtLoad();'; // runtime fault, NOT syntax — must compile

export function selftest() {
  const missing = [];
  if (syntaxError(FAULT_FIXTURE, 'fixture-outage.js') === null) missing.push('escaped-backtick SyntaxError not detected');
  if (syntaxError(FIXED_FIXTURE, 'fixture-fixed.js') !== null) missing.push('valid template literal wrongly rejected');
  if (syntaxError(RUNTIME_FIXTURE, 'fixture-runtime.js') !== null) missing.push('runtime-only fault wrongly rejected (gate must be syntax-only)');
  const ext = extractInlineScripts('<script>const a = 1;</script>\n<script type="application/ld+json">{"x":1}</script>\n<script src="/x.js"></script>\n```\n<script>bad`</script>\n```');
  const checkable = ext.filter((b) => b.kind === 'check');
  if (checkable.length !== 1 || checkable[0].code.trim() !== 'const a = 1;') missing.push('extractor mis-handles JSON-LD / external / fenced scripts');
  return missing;
}

function walk(root, out = []) {
  let entries;
  try { entries = fs.readdirSync(root, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    if (e.isDirectory()) {
      if (!SKIP_DIRS.has(e.name)) walk(path.join(root, e.name), out);
    } else if (e.isFile() && (e.name.endsWith('.md') || e.name.endsWith('.html'))) {
      out.push(path.join(root, e.name));
    }
  }
  return out;
}

function checkText(text, label, findings) {
  const blocks = extractInlineScripts(text);
  let checked = 0, liquid = 0, module = 0;
  for (const b of blocks) {
    if (b.kind === 'liquid') { liquid++; continue; }
    if (b.kind === 'module') { module++; continue; }
    checked++;
    const err = syntaxError(b.code, `${label}:${b.startLine}`);
    if (err) findings.push(`[inline-js] ${label}: script block at line ${b.startLine}: ${err}`);
  }
  return { checked, liquid, module };
}

async function main() {
  const args = process.argv.slice(2);
  // Selftest on EVERY invocation — a blind gate must never print "clean".
  const blind = selftest();
  if (blind.length) {
    console.error(`SELFTEST: **BLIND** - ${blind.join('; ')}`);
    process.exit(2);
  }
  if (args.includes('--selftest-only')) {
    console.log('inline-js selftest: OK (outage fixture detected, fixed fixture passes, runtime-only fault allowed, extractor sane)');
    process.exit(0);
  }
  const findings = [];
  const liveIdx = args.indexOf('--live');
  if (liveIdx !== -1) {
    const url = args[liveIdx + 1];
    if (!url) { console.error('usage: --live <url>'); process.exit(2); }
    let html;
    try {
      const res = await fetch(url + (url.includes('?') ? '&' : '?') + 'ts=' + Date.now(), { cache: 'no-store', headers: { 'User-Agent': 'Mozilla/5.0 (EventsGuard)' } });
      if (!res.ok) { console.error(`[inline-js] LIVE FETCH FAILED: HTTP ${res.status} for ${url}`); process.exit(2); }
      html = await res.text();
    } catch (err) {
      console.error(`[inline-js] LIVE FETCH FAILED: ${err.message} for ${url}`);
      process.exit(2);
    }
    const s = checkText(html, url, findings);
    console.log(`inline-js (live): ${s.checked} block(s) checked, ${s.liquid} liquid-skipped, ${s.module} module-skipped`);
  } else {
    const root = args.find((a) => !a.startsWith('--')) || '.';
    const files = walk(root);
    let checked = 0, liquid = 0, module = 0;
    for (const f of files) {
      let text;
      try { text = fs.readFileSync(f, 'utf8'); } catch (err) { findings.push(`[inline-js] ${f}: unreadable: ${err.message}`); continue; }
      const s = checkText(text, path.relative(root, f).replace(/\\/g, '/'), findings);
      checked += s.checked; liquid += s.liquid; module += s.module;
    }
    console.log(`inline-js: ${files.length} file(s) scanned, ${checked} block(s) checked, ${liquid} liquid-skipped, ${module} module-skipped`);
    if (liquid > 0 || module > 0) console.log(`inline-js: coverage note — ${liquid + module} block(s) NOT syntax-checked (Liquid-transformed or ES module)`);
  }
  if (findings.length) {
    console.error(`\nINLINE-JS FAIL - ${findings.length} blocking finding(s):`);
    for (const f of findings) console.error('  ' + f);
    process.exit(1);
  }
  console.log('INLINE-JS PASS');
  process.exit(0);
}

const invokedDirectly = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedDirectly) {
  main().catch((err) => { console.error(`[inline-js] TOOL ERROR: ${err.stack || err.message}`); process.exit(2); });
}
