.PHONY: help install run lint format test test-unit test-integration clean \
	env up up-build down build logs logs-api ps shell

# O projeto Python (pyproject.toml, poetry.lock e tests/) fica em backend/
POETRY := poetry -P backend

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
