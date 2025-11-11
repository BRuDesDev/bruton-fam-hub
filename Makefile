.PHONY: dev up down test-backend lint-frontend

dev:
	cd backend && uvicorn app.main:app --reload

up:
	docker compose -f infra/docker-compose.yml up --build

down:
	docker compose -f infra/docker-compose.yml down -v

test-backend:
	cd backend && pytest

lint-frontend:
	cd frontend && npm run lint
