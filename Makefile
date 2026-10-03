.PHONY: help install run lint format test clean

POETRY := poetry
PYTEST := python -m pytest -q

help:
	@echo "Targets:"
	@echo "  install   Install project dependencies with poetry"
	@echo "  run       Run the FastAPI app (uvicorn)"
	@echo "  lint      Run Ruff checks"
	@echo "  format    Run Ruff formatter"
	@echo "  test      Run pytest"
	@echo "  clean     Remove build artifacts"

install:
	$(POETRY) install --with dev --no-root

run:
	$(POETRY) run python -m uvicorn backend.main:app --reload

lint:
	$(POETRY) run ruff check backend tests

format:
	$(POETRY) run ruff format backend tests

test:
	$(POETRY) run pytest tests -q

clean:
	rm -rf dist build *.egg-info .pytest_cache .venv
