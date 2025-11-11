# Bruton Family Hub API

FastAPI backend with SQLModel (async SQLAlchemy) for persistence and Redis pub/sub for realtime fan-out.

## Quick start

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -e .[dev]
cp .env.example .env
uvicorn app.main:app --reload
```

Visit http://127.0.0.1:8000/api/health to confirm the service is online. Use `/api/events` to create/list events; each creation is stored in the database and published to Redis for WebSocket clients on `/ws/notify`.

## Tests

```bash
pytest
```

## Next steps

- Extend `app/models.py` with chores, media, and calendar tables plus Alembic migrations.
- Swap the `/api/media/upload` placeholder with a MinIO presigned-upload flow.
- Build authenticated routes and restrict notifications per-family account.
