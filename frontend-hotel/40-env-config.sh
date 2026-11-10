#!/bin/sh
set -eu

if [ -n "${VITE_API_URL:-}" ]; then
  ESCAPED_URL=$(printf '%s' "$VITE_API_URL" | sed 's/\\/\\\\/g; s/"/\\"/g')
  printf 'window.__ENV__ = { VITE_API_URL: "%s" };\n' "$ESCAPED_URL" > /usr/share/nginx/html/env-config.js
fi

