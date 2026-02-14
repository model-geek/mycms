#!/bin/bash
# Usage: ./scripts/setup-worktree.sh <name> <branch> <port_offset>
set -euo pipefail

NAME=$1
BRANCH=$2
OFFSET=$3

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

git worktree add "${PROJECT_ROOT}/worktrees/${NAME}" "${BRANCH}"

cat > "${PROJECT_ROOT}/worktrees/${NAME}/.envrc" << EOF
export PORT_OFFSET=${OFFSET}
source_env ../../.envrc.template
EOF

cd "${PROJECT_ROOT}/worktrees/${NAME}"
direnv allow
npm install
echo "Worktree '${NAME}' created with PORT_OFFSET=${OFFSET}"
