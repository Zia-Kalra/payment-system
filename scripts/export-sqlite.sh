#!/bin/bash
set -euo pipefail

# Exports SQLite DB to a SQL dump file.
# Usage:
#   ./scripts/export-sqlite.sh backend/payment_system.db /tmp/sqlite_dump.sql

DB_PATH="${1:-backend/payment_system.db}"
OUT_PATH="${2:-/tmp/sqlite_dump.sql}"

if [[ ! -f "$DB_PATH" ]]; then
  echo "ERROR: SQLite DB not found at $DB_PATH"
  exit 1
fi

if ! command -v sqlite3 >/dev/null 2>&1; then
  echo "ERROR: sqlite3 is required."
  exit 1
fi

sqlite3 "$DB_PATH" .dump > "$OUT_PATH"
echo "Exported to $OUT_PATH"

