#!/usr/bin/env bash
set -euo pipefail

# Usage: SUPABASE_DB_URL=postgres://user:pass@host:5432/db ./export_supabase_db.sh [out-file]
OUT=${1:-"$(pwd)/dumps/supabase_dump.sqlc"}

if [ -z "${SUPABASE_DB_URL:-}" ]; then
  echo "Please set SUPABASE_DB_URL env var to your Supabase Postgres connection string." >&2
  echo "Example: SUPABASE_DB_URL=postgres://user:pass@db.supabase.co:5432/dbname" >&2
  exit 1
fi

mkdir -p "$(dirname "$OUT")"
echo "Dumping Supabase DB to $OUT"
pg_dump "$SUPABASE_DB_URL" -Fc -f "$OUT"
echo "Dump complete"
