#!/usr/bin/env sh
# Minimal husky shim — the repo's .husky hooks source this file.
# husky install was never run here (no _/ dir), which silently disabled ALL
# pre-commit gates until 2026-11-20 (events page outage follow-up).
# Kept as a committed no-op so hooks work on every clone without npm install.
if [ "$HUSKY_DEBUG" = "1" ]; then
  echo "husky (debug) - sourcing $(dirname "$0")/husky.sh"
fi