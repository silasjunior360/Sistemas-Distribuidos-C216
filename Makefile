.PHONY: help install run lint format test test-unit test-integration \
	env up up-build down logs ps \
	db-upgrade db-downgrade db-migration db-current db-shell \
	frontend-install frontend-dev frontend-lint frontend-format frontend-check \
	frontend-test frontend-build e2e check-all

# O projeto Python (pyproject.toml, poetry.lock e tests/) fica em backend/
POETRY := poetry -P backend

# Lê o .env (se existir) para montar a URL do banco vista da máquina:
# fora do Compose o PostgreSQL é acessado por localhost, na porta publicada
-include .env
POSTGRES_PORT ?= 5432
HOST_DATABASE_URL = postgresql+psycopg://$(POSTGRES_USER):$(POSTGRES_PASSWORD)@localhost:$(POSTGRES_PORT)/$(POSTGRES_DB)
ALEMBIC := cd backend && poetry run alembic

help:
	@echo "Backend:"
	@echo "  install           Instala as dependencias do backend (Poetry)"
	@echo "  run               Roda a API fora do Docker, com reload (precisa do db no ar)"
	@echo "  lint              Ruff: verifica o codigo do backend"
	@echo "  format            Ruff: formata o codigo do backend"
	@echo "  test              Pytest: todos os testes do backend"
	@echo "  test-unit         Pytest: so os testes unitarios"
	@echo "  test-integration  Pytest: so os testes de integracao"
	@echo ""
	@echo "Docker:"
	@echo "  env               Cria o .env a partir do .env.example (se nao existir)"
	@echo "  up                Sobe frontend, api e db em segundo plano"
	@echo "  up-build          Reconstroi as imagens e sobe tudo"
	@echo "  down              Para e remove os containers (os dados do banco ficam)"
	@echo "  logs              Acompanha os logs dos servicos"
	@echo "  ps                Lista os servicos e o status de cada um"
	@echo ""
	@echo "Banco (Alembic, com o db rodando):"
	@echo "  db-upgrade        Aplica todas as migrations"
	@echo "  db-downgrade      Desfaz a ultima migration"
	@echo "  db-migration msg=\"...\"  Gera uma migration a partir dos modelos"
	@echo "  db-current        Mostra a migration atual do banco"
	@echo "  db-shell          Abre o psql dentro do container do banco"
	@echo ""
	@echo "Frontend:"
	@echo "  frontend-install  Instala as dependencias do frontend (npm ci)"
	@echo "  frontend-dev      Roda o Vite fora do Docker, com reload"
	@echo "  frontend-lint     Biome: verifica o codigo do frontend"
	@echo "  frontend-format   Biome: formata o codigo do frontend"
	@echo "  frontend-check    Biome: lint + checagem de formatacao"
	@echo "  frontend-test     Vitest: testes unitarios e de integracao"
	@echo "  frontend-build    Gera o build de producao do frontend"
	@echo ""
	@echo "Testes completos:"
	@echo "  e2e               Playwright em uma stack separada (apagada no final)"
	@echo "  check-all         Lint, testes, build e e2e de uma vez"

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

env:
	@test -f .env || (cp .env.example .env && echo ".env criado a partir de .env.example")

up: env
	docker compose up -d

up-build: env
	docker compose up -d --build

down:
	docker compose down

logs:
	docker compose logs -f

ps:
	docker compose ps

run db-upgrade db-downgrade db-migration db-current: export DATABASE_URL = $(HOST_DATABASE_URL)

db-upgrade:
	$(ALEMBIC) upgrade head

db-downgrade:
	$(ALEMBIC) downgrade -1

db-migration:
	@test -n "$(msg)" || (echo 'Uso: make db-migration msg="descricao"' && exit 1)
	$(ALEMBIC) revision --autogenerate -m "$(msg)"

db-current:
	$(ALEMBIC) current

db-shell:
	docker compose exec db psql -U $(POSTGRES_USER) -d $(POSTGRES_DB)

# Frontend (React + Vite), executado a partir da raiz
NPM := npm --prefix frontend

frontend-install:
	$(NPM) ci

frontend-dev:
	$(NPM) run dev

frontend-lint:
	$(NPM) run lint

frontend-format:
	$(NPM) run format

frontend-check:
	$(NPM) run lint
	$(NPM) run format:check

frontend-test:
	$(NPM) run test

frontend-build:
	$(NPM) run build

# E2E em uma stack separada (agenda-e2e, outras portas e banco próprio).
# No final derruba tudo com down -v, mesmo se algum teste falhar.
E2E_COMPOSE := API_PORT=8001 FRONTEND_PORT=5174 POSTGRES_PORT=5433 docker compose -p agenda-e2e

e2e: env
	$(E2E_COMPOSE) up -d --build --wait && \
	E2E_BASE_URL=http://localhost:5174 $(NPM) run test:e2e; \
	status=$$?; $(E2E_COMPOSE) down -v; exit $$status

check-all: lint test frontend-check frontend-test frontend-build e2e
