#!/bin/bash
#
# MoneySpot autonomous growth pipeline.
#
# Runs weekly from launchd. The OSM importer (Cloudflare cron) adds new shops
# to Supabase every week; this pipeline turns that fresh data into new live,
# indexable pages with zero human input:
#
#   1. Regenerate world-cities.generated.json from Supabase (new shops/cities)
#   2. Rebuild the Next.js static site
#   3. If the generated data changed, commit + push (Vercel auto-deploys)
#   4. Ping IndexNow so Bing/Yandex re-crawl the new/updated pages
#
# Idempotent: if nothing changed, it does nothing (no empty commits/deploys).
#
set -euo pipefail

SRC="$HOME/ClaudeCode/moneyspot"
DEPLOY="$HOME/moneyspot-deploy"
LOG="$HOME/.moneyspot-autogrow.log"
ANON_KEY="$(grep NEXT_PUBLIC_SUPABASE_ANON_KEY "$SRC/.env.local" | cut -d= -f2)"
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin"

ts() { date "+%Y-%m-%d %H:%M:%S"; }
log() { echo "$(ts)  $*" >> "$LOG"; }

log "=== auto-grow start ==="

cd "$SRC"

# 1. Regenerate world cities from latest Supabase data
GEN="src/lib/world-cities.generated.json"
# Content hash that ignores the generated_at timestamp, so we only deploy on
# real data changes (new shops/cities), not on every run.
content_hash() {
  node -e "const fs=require('fs'),c=require('crypto');try{const d=JSON.parse(fs.readFileSync('$1','utf8'));console.log(c.createHash('sha1').update(JSON.stringify(d.cities)).digest('hex'))}catch(e){console.log('')}" 2>/dev/null || true
}
BEFORE_HASH="$(content_hash "$GEN")"
if node scripts/build-world-cities.mjs >> "$LOG" 2>&1; then
  log "regenerated world-cities"
else
  log "ERROR regenerating world-cities — aborting"
  exit 1
fi
AFTER_HASH="$(content_hash "$GEN")"

if [ "$BEFORE_HASH" = "$AFTER_HASH" ]; then
  log "no data change — still pinging IndexNow and exiting"
  MONEYSPOT_ANON_KEY="$ANON_KEY" node scripts/submit-indexnow.mjs >> "$LOG" 2>&1 || log "indexnow ping failed"
  log "=== auto-grow end (no change) ==="
  exit 0
fi

# 2. Rebuild to validate the new data compiles
if npm run build >> "$LOG" 2>&1; then
  log "build OK"
else
  log "ERROR build failed — not deploying"
  exit 1
fi

# 3. Sync to the deploy repo and push (Vercel auto-deploys on push)
rsync -a --delete \
  --exclude=.git --exclude=.vercel --exclude=.next --exclude=out --exclude=node_modules \
  --exclude='.next.old.*' --exclude='out.old.*' --exclude=tsconfig.tsbuildinfo \
  --exclude=mobile --exclude=.wrangler \
  "$SRC/" "$DEPLOY/" >> "$LOG" 2>&1

cd "$DEPLOY"
git add -A
if git diff --cached --quiet; then
  log "nothing staged after rsync — skipping commit"
else
  git commit -m "auto-grow: refresh world cities from OSM data ($(date +%Y-%m-%d))" >> "$LOG" 2>&1 || true
  git push origin main >> "$LOG" 2>&1 || log "push failed"
  log "pushed — Vercel will auto-deploy"
fi

# 4. Wait for deploy to settle, then ping IndexNow
sleep 120
cd "$SRC"
MONEYSPOT_ANON_KEY="$ANON_KEY" node scripts/submit-indexnow.mjs >> "$LOG" 2>&1 || log "indexnow ping failed"

log "=== auto-grow end (deployed) ==="
