#!/usr/bin/env sh
set -eu

COMPOSE_FILES="${COMPOSE_FILES:--f docker-compose.prod.yml}"

git pull origin main
mkdir -p services/api/data services/api/uploads logs/nginx nginx/ssl
docker compose $COMPOSE_FILES up -d --build
docker compose $COMPOSE_FILES ps
