.PHONY: help install run lint format test test-unit test-integration clean

POETRY := poetry
PYTEST := python -m pytest -q

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

install:
	$(POETRY) install --with dev --no-root

run:
	$(POETRY) run python -m uvicorn app.main:app --reload --app-dir backend

lint:
	$(POETRY) run ruff check backend tests

format:
	$(POETRY) run ruff format backend tests

test:
	$(POETRY) run pytest tests -q

test-unit:
	$(POETRY) run pytest tests/unit -q

test-integration:
	$(POETRY) run pytest tests/integration -q

clean:
	rm -rf dist build *.egg-info .pytest_cache .venv
