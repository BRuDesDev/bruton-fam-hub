# Backup notes

- Schedule `pg_dump` nightly (cron/systemd timer) using the `postgres` container credentials in `.env`
- Sync MinIO buckets via `mc mirror` to external storage or S3 Glacier
- Keep Google Calendar tokens (if stored locally) backed up in MinIO secrets bucket
