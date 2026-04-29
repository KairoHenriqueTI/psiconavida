#!/usr/bin/env bash
set -euo pipefail

# Usage: LOCAL_DATABASE_URL=postgresql://user:pass@localhost:5433/db ./import_to_local.sh dump.sqlc
IN=${1:-"$(pwd)/dumps/supabase_dump.sqlc"}
LOCAL_DATABASE_URL=${LOCAL_DATABASE_URL:-"postgresql://pnv_user:pnv_pass@localhost:5433/pnv_db"}

if [ ! -f "$IN" ]; then
  echo "Dump file not found: $IN" >&2
  exit 1
fi

echo "Restoring $IN into $LOCAL_DATABASE_URL"
pg_restore --clean --no-owner --no-privileges -d "$LOCAL_DATABASE_URL" "$IN"
echo "Restore complete"
