#!/usr/bin/env sh
set -eu

BACKUP_DIR="${BACKUP_DIR:-backups}"
DB_NAME="${MYSQL_DATABASE:-cnm_mk_hb}"
STAMP="$(date +%Y%m%d-%H%M%S)"

mkdir -p "$BACKUP_DIR"
docker exec cnm_mysql_prod sh -c 'mysqldump -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE"' > "$BACKUP_DIR/${DB_NAME}-${STAMP}.sql"
echo "Backup created: $BACKUP_DIR/${DB_NAME}-${STAMP}.sql"
