#!/usr/bin/env bash
set -euo pipefail

echo "This script removes .env files from the working tree and adds them to .gitignore. It will create a regular commit (non-history-rewriting)."

git rm -f .env || true
git rm -f server/.env || true

echo "/.env" >> .gitignore || true
echo "/server/.env" >> .gitignore || true

git add .gitignore || true
git commit -m "chore: remove committed env files and add to .gitignore" || true

cat <<EOF
IMPORTANT:
- This does NOT remove secrets from git history. If you previously pushed the repo with secrets, rotate those secrets immediately.
- To remove secrets from history, use a tool such as git filter-repo or the BFG repo cleaner. This is a destructive operation; make a backup first.

Suggested next steps:
1) Rotate any exposed credentials (DB user, NEXTAUTH_SECRET, OPENAI_API_KEY, Supabase keys).
2) If you need me to remove secrets from the git history, confirm and I will provide the exact commands using git filter-repo.
EOF
