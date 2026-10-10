#!/bin/sh
# Daily logical backup of the fursan database, keeping 14 days.
# Cron (as root):  30 0 * * * /opt/fursan/deploy/backup.sh >> /var/log/fursan-backup.log 2>&1
set -eu
cd "$(dirname "$0")/.."
BACKUP_DIR="${BACKUP_DIR:-/opt/fursan-backups}"
mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"
OUT="$BACKUP_DIR/fursan-$(date -u +%F-%H%M).dump"

docker compose exec -T db sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --format=custom' > "$OUT.tmp"
mv "$OUT.tmp" "$OUT"
find "$BACKUP_DIR" -name 'fursan-*.dump' -mtime +14 -delete
echo "$(date -u +%FT%TZ) backup ok: $OUT ($(du -h "$OUT" | cut -f1))"
