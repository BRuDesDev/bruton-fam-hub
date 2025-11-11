# Architecture overview

## Services

- **FastAPI** (`backend/`): REST + WebSocket API, Redis pub/sub bridge, Google Calendar sync workers to be added.
- **React PWA** (`frontend/`): Tailwind + shadcn UI, offline-ready shell that consumes the API via `/api` and `/ws` proxies.
- **PostgreSQL**: Primary relational store (SQLite fallback for dev by switching `DATABASE_URL`).
- **Redis**: Fan-out notifications, background job queue (RQ/Arq/Celery-compatible) and rate limiting cache.
- **MinIO**: S3-compatible media store served privately via Caddy.
- **Caddy**: Reverse proxy + TLS automation for `familyhub.local`, future mDNS advertisement via Avahi.

## Data flow

1. FastAPI issues JWTs backed by Postgres.
2. Notifications pushed into Redis pub/sub streams → forwarded to WebSocket clients.
3. Calendar sync worker polls Google Calendar API, persists events, and emits updates through Redis.
4. Uploaded media lands in MinIO buckets; DB stores signed URLs.

## Deployment notes

- Use Docker Compose on the Raspberry Pi (arm64 images chosen) or break out to Kubernetes later.
- Recommended extras: Tailscale sidecar container, nightly `pg_dump` + `mc mirror` snapshots triggered via cron.
