# Agenda de Compromissos — Projeto Final C216 L1

Aplicação full stack para agendar compromissos em um calendário mensal:
o usuário escolhe um dia do mês e marca um horário.

> **Status:** em desenvolvimento. Por enquanto o projeto tem apenas a base
> (backend, frontend, banco, Docker, testes e CI), sem as funcionalidades da agenda.

## Tecnologias

- **Backend:** Python 3.12, FastAPI, SQLAlchemy, Alembic, Poetry
- **Banco de dados:** PostgreSQL 16
- **Frontend:** React, Vite, Tailwind CSS
- **Qualidade:** Pytest, Ruff, Vitest, Testing Library, Playwright, Biome
- **Infra:** Docker, Docker Compose, Makefile, GitHub Actions

## Estrutura

```
backend/
├── app/
│   ├── main.py              # Cria o app, configura o CORS e registra as rotas
│   ├── routes/              # Endpoints (HTTP)
│   ├── core/config.py       # Configurações lidas do ambiente
│   ├── database/            # Base dos modelos ORM e sessão do banco (get_db)
│   └── models/              # Modelos ORM (tabelas)
├── alembic/versions/        # Migrations
└── tests/                   # Pytest
frontend/
├── src/                     # Aplicação React
└── tests/                   # Vitest (unit/integration) e Playwright (e2e)
compose.yaml                 # frontend + api + db
Makefile                     # Atalhos dos comandos do projeto
.env.example                 # Variáveis de ambiente (copiar para .env)
```

## Pré-requisitos

- Docker com o plugin Compose
- Make
- Para rodar fora do Docker: Python 3.12 + Poetry e Node.js 22

## Variáveis de ambiente

```bash
cp .env.example .env
```

| Variável | Uso |
|---|---|
| `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` | Banco criado pelo container do PostgreSQL |
| `DATABASE_URL` | Conexão da API com o banco (host `db` dentro do Compose) |
| `POSTGRES_PORT` | Porta do banco publicada na máquina (usada pelo `make db-*`) |

O `.env` não é versionado. O `make up` cria o arquivo a partir do `.env.example` se ele não existir.

## Como executar

```bash
make up-build   # constrói as imagens e sobe frontend, api e db
make ps         # os três serviços devem aparecer como healthy
make down       # para os containers (os dados do banco são mantidos)
```

Ao iniciar, a API aplica as migrations (`alembic upgrade head`) automaticamente.

| Serviço | Endereço |
|---|---|
| Frontend | http://localhost:5173 |
| API | http://localhost:8000 |
| Documentação da API | http://localhost:8000/docs |

## Testes e qualidade

```bash
make install            # dependências do backend
make frontend-install   # dependências do frontend
make lint               # Ruff (backend)
make test               # Pytest (backend)
make frontend-check     # Biome: lint e formatação (frontend)
make frontend-test      # Vitest (frontend)
make e2e                # Playwright em uma stack Docker separada
make check-all          # tudo acima + build do frontend
```

O GitHub Actions executa o lint e os testes do backend e do frontend em todo pull request
(e a cada push na `main`).

## Migrations

Com o banco rodando:

```bash
make db-upgrade                       # aplica as migrations
make db-migration msg="descricao"     # gera uma migration a partir dos modelos
make db-current                       # revisão atual do banco
```

Use `make help` para ver todos os comandos.
