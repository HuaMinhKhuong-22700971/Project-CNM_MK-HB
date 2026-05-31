#!/usr/bin/env sh
set -eu

COMPOSE_FILES="${COMPOSE_FILES:--f docker-compose.prod.yml}"

git pull origin main
mkdir -p services/api/data services/api/uploads logs/nginx nginx/ssl
sh scripts/production/check-env.sh
docker compose $COMPOSE_FILES up -d --build
docker compose $COMPOSE_FILES ps

if [ "${SKIP_SMOKE:-0}" != "1" ]; then
  npm run prod:smoke
fi
