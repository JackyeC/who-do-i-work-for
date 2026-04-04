#!/usr/bin/env bash
# shellcheck shell=bash
# Sourced by deploy.sh and health-check.sh: optional .env.supabase.local + default SUPABASE_URL from config.toml.
_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
_env="${_root}/.env.supabase.local"
if [[ -f "$_env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$_env"
  set +a
fi
if [[ -z "${SUPABASE_URL:-}" && -f "${_root}/supabase/config.toml" ]]; then
  _pid="$(grep -E '^project_id[[:space:]]*=' "${_root}/supabase/config.toml" | head -1 | sed -E 's/^project_id[[:space:]]*=[[:space:]]*"([^"]+)".*/\1/')"
  if [[ -n "$_pid" ]]; then
    export SUPABASE_URL="https://${_pid}.supabase.co"
  fi
fi
