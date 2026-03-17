#!/bin/bash
set -euo pipefail

# One-click "production setup" helper.
# This script:
# 1) Validates required env vars (backend + frontend)
# 2) Builds frontend
# 3) Runs a backend health check (if BACKEND_HEALTH_URL is provided)
# 4) Triggers backend deploy hook (if RENDER_DEPLOY_HOOK_URL is provided)
# 5) Optionally deploys frontend via Vercel CLI
#
# NOTE: Database migrations and blockchain contract deployments depend on your app code.
# This script provides the safety rails and verification steps.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

require_env() {
  local key="$1"
  if [[ -z "${!key:-}" ]]; then
    echo "ERROR: missing env var: $key"
    exit 1
  fi
}

echo "== Validating environment variables =="
require_env VITE_API_BASE_URL
require_env VITE_API_MOCK

echo "VITE_API_BASE_URL=$VITE_API_BASE_URL"
echo "VITE_API_MOCK=$VITE_API_MOCK"

echo "== Building frontend =="
(cd "$ROOT_DIR/frontend" && npm ci && npm run build)

if [[ -n "${BACKEND_HEALTH_URL:-}" ]]; then
  echo "== Checking backend health ($BACKEND_HEALTH_URL) =="
  curl -fsS "$BACKEND_HEALTH_URL" | head -c 500 || {
    echo
    echo "ERROR: health check failed"
    exit 1
  }
  echo
fi

if [[ -n "${RENDER_DEPLOY_HOOK_URL:-}" ]]; then
  echo "== Triggering Render backend deploy =="
  curl -fsS -X POST "$RENDER_DEPLOY_HOOK_URL" >/dev/null
  echo "Triggered backend deploy."
else
  echo "Skipping backend deploy (RENDER_DEPLOY_HOOK_URL not set)."
fi

if [[ "${DEPLOY_FRONTEND:-false}" == "true" ]]; then
  if ! command -v vercel >/dev/null 2>&1; then
    echo "ERROR: vercel CLI not found (needed because DEPLOY_FRONTEND=true)."
    exit 1
  fi
  echo "== Deploying frontend to Vercel =="
  (cd "$ROOT_DIR/frontend" && vercel --prod --confirm)
else
  echo "Skipping frontend deploy (set DEPLOY_FRONTEND=true to enable)."
fi

echo "== Done =="

