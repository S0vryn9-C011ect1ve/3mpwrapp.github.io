#!/usr/bin/env bash
# 3mpwrapp.ca deploy script — Hermes Chief of Staff
# Builds Jekyll, VERIFIES clean content, deploys straight to production, purges cache.
# Auto-reads CF token from secret file. No manual token handling needed.
set -euo pipefail

SITE_DIR="C:/Users/HP/3mpwrapp-site-tmp"
SECRET="C:/Users/HP/AppData/Local/hermes/secrets/cf_api_token.txt"
ACCT="999c912eef0affd7b78a7781dc98e3d0"
PROJECT="3mpwrapp"
WRANGLER="C:/Users/HP/AppData/Roaming/npm/node_modules/wrangler/bin/wrangler.js"
RUBY="C:/Ruby33-x64/bin/ruby.exe"

echo "==> [1/5] Loading CF token"
if [ ! -f "$SECRET" ]; then echo "FATAL: token file missing at $SECRET"; exit 1; fi
export CLOUDFLARE_API_TOKEN="$(cat "$SECRET" | tr -d '\r\n')"
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then echo "FATAL: empty token"; exit 1; fi

cd "$SITE_DIR"

echo "==> [2/5] Clean Jekyll build"
# Use Gemfile.local if present (no wdm, local build), else system jekyll
mv Gemfile Gemfile.bak 2>/dev/null || true
mv Gemfile.lock Gemfile.lock.bak 2>/dev/null || true
rm -rf _site
"$RUBY" -S jekyll build 2>&1 | tail -4
mv Gemfile.bak Gemfile 2>/dev/null || true
mv Gemfile.lock.bak Gemfile.lock 2>/dev/null || true

echo "==> [3/5] VERIFY clean content (hard fail if old update blocks present)"
FAIL=0
declare -A PAGES=( [privacy]=privacy/index.html [terms]=terms/index.html [data-ownership]=data-ownership/index.html [code-of-conduct]=code-of-conduct/index.html )
for name in "${!PAGES[@]}"; do
  f="_site/${PAGES[$name]}"
  if [ ! -f "$f" ]; then echo "  FATAL: $f missing"; FAIL=1; continue; fi
  if grep -qE "January 2026 Updates|December 2025 Updates|November 2025 Updates|What's New Reference" "$f"; then
    echo "  BLOCKED: $name still has old update blocks"; FAIL=1
  else
    echo "  OK: $name clean"
  fi
  # Confirm today's date present
  if ! grep -q "September 11, 2026" "$f"; then
    echo "  WARN: $name missing Sep 11 2026 date"
  fi
done
if [ "$FAIL" -ne 0 ]; then echo "DEPLOY ABORTED — content verification failed"; exit 1; fi

echo "==> [4/5] Deploy to PRODUCTION (--branch=main)"
node "$WRANGLER" pages deploy _site --project-name="$PROJECT" --branch=main 2>&1 | tail -6

echo "==> [5/5] Purge CDN cache + confirm production deploy"
curl -s -X POST "https://api.cloudflare.com/client/v4/accounts/$ACCT/pages/projects/$PROJECT/purge_cache" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" -H "Content-Type: application/json" -d '{"everything":true}' \
  -o /dev/null && echo "  cache purge requested"
echo "  latest deploy:"
curl -s "https://api.cloudflare.com/client/v4/accounts/$ACCT/pages/projects/$PROJECT" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  | python -c "import sys,json; d=json.load(sys.stdin); print('   ', d['result'].get('latest_deployment',{}).get('id','?')[:14])"
echo "==> DONE"
