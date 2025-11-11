# Bruton Family Hub

Monorepo skeleton for the Bruton family home hub. It ships with:

- FastAPI backend (async SQLAlchemy, Redis, Google Calendar placeholders)
- React + Vite + Tailwind + shadcn/ui frontend (PWA-ready)
- Docker Compose stack for Postgres, Redis, MinIO, Caddy reverse proxy, and dev servers

## Repository layout

```
backend/   # FastAPI app + routers, services, tests
frontend/  # React + Vite PWA
infra/     # docker-compose.yml, Caddyfile, env.example
scripts/   # bootstrap + backup helpers
```

## Local development (no containers)

1. Copy environment files
   ```bash
   cp infra/env.example .env
   cp backend/.env.example backend/.env
   ```
2. Start the backend
   ```bash
   cd backend
   python -m venv .venv && source .venv/bin/activate
   pip install -e .[dev]
   uvicorn app.main:app --reload
   ```
3. Start the frontend
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

Or run `./scripts/bootstrap.sh` to perform the setup automatically (copies `.env`, creates the backend venv, installs deps).

## Docker Compose workflow

```bash
cp infra/env.example .env
docker compose -f infra/docker-compose.yml up --build
```

Caddy serves everything at https://familyhub.local (configure mDNS/hosts + trust TLS certs). MinIO console lives at http://localhost:9001.

Frontend assets are built inside the `frontend-build` service (Node 20 container). Whenever you change the React app run:

```bash
docker compose -f infra/docker-compose.yml up --build frontend-build
```

This regenerates `frontend/dist`, which Caddy serves from `/srv`.

## Next steps

- Flesh out auth (JWT + passlib) and calendar sync background workers
- Add Alembic migrations + real models for chores, events, etc.
- Configure Backups: nightly pg_dump + MinIO replication script
- Integrate Tailscale for remote access once Pi deployment begins
