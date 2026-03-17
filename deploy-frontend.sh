#!/bin/bash
set -euo pipefail

# Deploy frontend using the Vercel CLI.
# Requirements:
# - Install Vercel CLI: npm i -g vercel
# - Login: vercel login
# - From repo root, run this script.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$ROOT_DIR/frontend"

if ! command -v vercel >/dev/null 2>&1; then
  echo "ERROR: vercel CLI not found."
  echo "Install it with: npm i -g vercel"
  exit 1
fi

echo "Validating frontend..."
test -f "$FRONTEND_DIR/package.json"
test -f "$FRONTEND_DIR/vite.config.ts"

echo "Building frontend locally (sanity check)..."
(cd "$FRONTEND_DIR" && npm ci && npm run build)

echo "Deploying to Vercel (production)..."
(cd "$FRONTEND_DIR" && vercel --prod --confirm)

echo "SUCCESS: Frontend deployed."

