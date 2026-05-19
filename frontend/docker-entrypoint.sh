#!/bin/sh
# =============================================================================
# Docker Entrypoint - Frontend
# =============================================================================
# Generates a runtime environment config file from container environment
# variables, enabling configuration without rebuilding the image.
# =============================================================================

# Create the runtime env config from environment variables
cat <<EOF > /usr/share/nginx/html/env-config.js
// Auto-generated at container startup — do NOT edit manually
window.__ENV__ = {
  API_BASE_URL: "${API_BASE_URL:-/api}",
  BASE_URL: "${BASE_URL:-}"
};
EOF

echo "Runtime env-config.js generated:"
cat /usr/share/nginx/html/env-config.js

# Substitute environment variables in nginx config template
# This allows BACKEND_HOST to be configurable per deployment
envsubst '${BACKEND_HOST} ${BACKEND_PORT}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

echo "Nginx config generated with BACKEND_HOST=${BACKEND_HOST:-backend} BACKEND_PORT=${BACKEND_PORT:-5000}"

# Start Nginx
exec nginx -g 'daemon off;'
