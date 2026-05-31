#!/usr/bin/env sh
set -eu

if [ $# -ne 1 ]; then
  echo "Usage: scripts/production/restore-db.sh <backup.sql>"
  exit 1
fi

DB_NAME="${MYSQL_DATABASE:-cnm_mk_hb}"

docker exec -i cnm_mysql_prod sh -c 'mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE"' < "$1"
echo "Database restored from: $1"
