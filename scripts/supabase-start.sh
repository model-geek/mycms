#!/bin/bash
# Supabase CLI のポートオーバーライド
# PORT_OFFSET は direnv から取得
set -euo pipefail

OFFSET=${PORT_OFFSET:-0}

supabase start \
  --api-port $((54321 + OFFSET)) \
  --db-port $((54322 + OFFSET)) \
  --studio-port $((54323 + OFFSET)) \
  --auth-port $((54324 + OFFSET)) \
  --inbucket-port $((54325 + OFFSET))
