#!/usr/bin/env bash
set -euo pipefail

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR=${BACKUP_DIR:-/tmp/bruton-hub-backups}
mkdir -p "$BACKUP_DIR"

if command -v pg_dump >/dev/null 2>&1; then
  echo "Dumping Postgres database..."
  pg_dump "$DATABASE_URL" > "$BACKUP_DIR/pg-${TIMESTAMP}.sql"
else
  echo "pg_dump not found; skipping database backup" >&2
fi

if command -v mc >/dev/null 2>&1; then
  echo "Syncing MinIO buckets..."
  mc mirror minio/family-media "$BACKUP_DIR/minio-media-${TIMESTAMP}"
else
  echo "MinIO client (mc) not found; skipping object storage backup" >&2
fi

echo "Backups stored in $BACKUP_DIR"
