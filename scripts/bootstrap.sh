#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
ENV_FILE="$ROOT_DIR/.env"
EXAMPLE_FILE="$ROOT_DIR/infra/env.example"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Creating .env from infra/env.example"
  cp "$EXAMPLE_FILE" "$ENV_FILE"
fi

if [[ -d "$ROOT_DIR/backend" ]]; then
  echo "Setting up backend virtualenv"
  python3 -m venv "$ROOT_DIR/backend/.venv"
  source "$ROOT_DIR/backend/.venv/bin/activate"
  pip install --upgrade pip
  (cd "$ROOT_DIR/backend" && pip install -e .[dev])
  deactivate
fi

if [[ -d "$ROOT_DIR/frontend" ]]; then
  echo "Installing frontend dependencies"
  (cd "$ROOT_DIR/frontend" && npm install)
fi

echo "Bootstrap complete. Run 'npm run dev' (frontend) and 'uvicorn app.main:app --reload' (backend)."
