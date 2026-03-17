#!/bin/bash
set -euo pipefail

# Deploy backend by triggering a Render deploy hook (recommended for CI/CD).
# Requirements:
# - Export RENDER_DEPLOY_HOOK_URL in your shell OR set it in your CI secrets.
#
# Example:
# export RENDER_DEPLOY_HOOK_URL="https://api.render.com/deploy/srv-...?...token=..."

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ -z "${RENDER_DEPLOY_HOOK_URL:-}" ]]; then
  echo "ERROR: RENDER_DEPLOY_HOOK_URL is not set."
  echo "Create a deploy hook in Render (Service → Settings → Deploy Hooks) and export it."
  exit 1
fi

echo "Validating backend files..."
test -f "$ROOT_DIR/backend/requirements.txt"
test -f "$ROOT_DIR/backend/app/main.py"

echo "Triggering Render deploy..."
curl -fsS -X POST "$RENDER_DEPLOY_HOOK_URL" >/dev/null

echo "SUCCESS: Deploy triggered."
echo "Next: open your backend URL and check /health"

