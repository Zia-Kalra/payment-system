#!/bin/bash
set -euo pipefail

# Migrates SQLite to Postgres using pgloader (recommended).
# Requirements:
# - pgloader installed (brew install pgloader on macOS)
#
# Usage:
#   DATABASE_URL="postgresql://user:pass@host:5432/db" ./scripts/pgloader-migrate.sh backend/payment_system.db

SQLITE_DB="${1:-backend/payment_system.db}"

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "ERROR: DATABASE_URL is not set."
  exit 1
fi

if [[ ! -f "$SQLITE_DB" ]]; then
  echo "ERROR: SQLite DB not found at $SQLITE_DB"
  exit 1
fi

if ! command -v pgloader >/dev/null 2>&1; then
  echo "ERROR: pgloader not found."
  echo "Install it (macOS): brew install pgloader"
  exit 1
fi

echo "Migrating $SQLITE_DB -> $DATABASE_URL"
pgloader "$SQLITE_DB" "$DATABASE_URL"
echo "Migration complete."

