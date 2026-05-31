#!/usr/bin/env sh
set -eu

ENV_FILE="${ENV_FILE:-.env}"

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing $ENV_FILE. Copy env.production.example to .env and fill production values."
  exit 1
fi

required_keys="
MYSQL_ROOT_PASSWORD
MYSQL_DATABASE
MYSQL_USER
MYSQL_PASSWORD
JWT_ACCESS_SECRET
JWT_REFRESH_SECRET
FRONTEND_URL
API_BASE_URL
"

for key in $required_keys; do
  if ! grep -q "^${key}=" "$ENV_FILE"; then
    echo "Missing required key in $ENV_FILE: $key"
    exit 1
  fi

  value="$(grep "^${key}=" "$ENV_FILE" | tail -n 1 | cut -d '=' -f 2-)"
  if [ -z "$value" ]; then
    echo "Empty required value in $ENV_FILE: $key"
    exit 1
  fi

  case "$value" in
    your_*|replace_*|change_me*)
      echo "Placeholder value still present in $ENV_FILE: $key"
      exit 1
      ;;
  esac
done

for key in JWT_ACCESS_SECRET JWT_REFRESH_SECRET MYSQL_ROOT_PASSWORD MYSQL_PASSWORD; do
  value="$(grep "^${key}=" "$ENV_FILE" | tail -n 1 | cut -d '=' -f 2-)"
  if [ "${#value}" -lt 24 ]; then
    echo "$key should be at least 24 characters long"
    exit 1
  fi
done

echo "Production environment check passed."
