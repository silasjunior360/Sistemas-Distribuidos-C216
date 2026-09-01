.PHONY: help install run lint format test clean docker-build docker-up docker-down docker-logs docker-shell

POETRY := poetry
PYTEST := python -m pytest -q
DOCKER_COMPOSE := docker compose

help:
	@echo "Targets:"
	@echo "  install       Install project dependencies with poetry"
	@echo "  run           Run the FastAPI app (uvicorn)"
	@echo "  lint          Run Ruff checks"
	@echo "  format        Run Ruff formatter"
	@echo "  test          Run pytest"
	@echo "  clean         Remove build artifacts"
	@echo "  docker-build  Build the backend Docker image"
	@echo "  docker-up     Start the application and database with Docker Compose"
	@echo "  docker-down   Stop and remove docker compose containers"
	@echo "  docker-logs   Follow backend logs"
	@echo "  docker-shell  Open a shell inside the backend container"

install:
	$(POETRY) install --with dev --no-root

run:
	$(POETRY) run python -m uvicorn backend.main:app --reload

lint:
	$(POETRY) run ruff check backend tests

format:
	$(POETRY) run ruff format backend tests

test:
	$(POETRY) run $(PYTEST)

clean:
	rm -rf dist build *.egg-info .pytest_cache .venv

docker-build:
	$(DOCKER_COMPOSE) build backend

docker-up:
	$(DOCKER_COMPOSE) up --build -d

docker-down:
	$(DOCKER_COMPOSE) down -v

docker-logs:
	$(DOCKER_COMPOSE) logs -f --tail=100 backend

docker-shell:
	$(DOCKER_COMPOSE) exec backend sh
