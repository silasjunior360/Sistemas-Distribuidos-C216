.PHONY: help install run lint format test test-unit test-integration clean

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
