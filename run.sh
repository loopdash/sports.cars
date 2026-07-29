#!/usr/bin/env bash
# Start Sports.Cars with live MarketCheck data.
# The API key is pulled from the 1Password "sports.cars" vault at runtime
# via `op run` and injected as an env var — it never touches disk or git.
set -euo pipefail
cd "$(dirname "$0")"
exec op run --account loopdash.1password.com \
  --env-file=marketcheck.env.tmpl -- node server/marketcheck-proxy.js
