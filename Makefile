.PHONY: help install run lint format test test-unit test-integration clean \
	env up up-build down build logs logs-api ps shell 	db-upgrade db-downgrade db-migration db-current db-history db-shell

# O projeto Python (pyproject.toml, poetry.lock e tests/) fica em backend/
POETRY := poetry -P backend

# Lê o .env (se existir) para montar a URL do banco vista da máquina:
# fora do Compose o PostgreSQL é acessado por localhost, na porta publicada
-include .env
POSTGRES_PORT ?= 5432
HOST_DATABASE_URL = postgresql+psycopg://$(POSTGRES_USER):$(POSTGRES_PASSWORD)@localhost:$(POSTGRES_PORT)/$(POSTGRES_DB)
ALEMBIC := cd backend && poetry run alembic

help:
	@echo "Targets:"
	@echo "  install   Install project dependencies with poetry"
	@echo "  run       Run the FastAPI app (uvicorn)"
	@echo "  lint      Run Ruff checks"
	@echo "  format    Run Ruff formatter"
	@echo "  test      Run all tests (unit + integration)"
	@echo "  test-unit         Run only unit tests"
	@echo "  test-integration  Run only integration tests"
	@echo "  clean     Remove build artifacts"
	@echo ""
	@echo "Docker:"
	@echo "  env       Create .env from .env.example (if missing)"
	@echo "  up        Start the environment (api + db) in background"
	@echo "  up-build  Rebuild images and start the environment"
	@echo "  down      Stop and remove the containers"
	@echo "  build     Build the images"
	@echo "  logs      Follow logs of all services"
	@echo "  logs-api  Follow logs of the api service"
	@echo "  ps        List the running services"
	@echo "  shell     Open a shell inside the api container"
	@echo ""
	@echo "Database (Alembic, com o db rodando):"
	@echo "  db-upgrade              Apply all migrations (upgrade head)"
	@echo "  db-downgrade            Revert the last migration"
	@echo "  db-migration msg=\"...\"  Generate a migration from the models"
	@echo "  db-current              Show the current revision of the database"
	@echo "  db-history              Show the migration history"
	@echo "  db-shell                Open psql inside the db container"

install:
	$(POETRY) install --with dev --no-root

run:
	$(POETRY) run python -m uvicorn app.main:app --reload --app-dir backend

lint:
	$(POETRY) run ruff check backend

format:
	$(POETRY) run ruff format backend

test:
	cd backend && poetry run pytest tests -q

test-unit:
	cd backend && poetry run pytest tests/unit -q

test-integration:
	cd backend && poetry run pytest tests/integration -q

clean:
	rm -rf dist build *.egg-info .pytest_cache backend/.pytest_cache backend/.venv

env:
	@test -f .env || (cp .env.example .env && echo ".env criado a partir de .env.example")

up: env
	docker compose up -d

up-build: env
	docker compose up -d --build

down:
	docker compose down

build: env
	docker compose build

logs:
	docker compose logs -f

logs-api:
	docker compose logs -f api

ps:
	docker compose ps

shell:
	docker compose exec api sh

run db-upgrade db-downgrade db-migration db-current db-history: export DATABASE_URL = $(HOST_DATABASE_URL)

db-upgrade:
	$(ALEMBIC) upgrade head

db-downgrade:
	$(ALEMBIC) downgrade -1

db-migration:
	@test -n "$(msg)" || (echo 'Uso: make db-migration msg="descricao"' && exit 1)
	$(ALEMBIC) revision --autogenerate -m "$(msg)"

db-current:
	$(ALEMBIC) current

db-history:
	$(ALEMBIC) history

db-shell:
	docker compose exec db psql -U $(POSTGRES_USER) -d $(POSTGRES_DB)
