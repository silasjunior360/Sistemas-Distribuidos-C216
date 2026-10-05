# API de Tarefas — C216 L1 (Prática 4)

API REST em FastAPI organizada em camadas para o recurso **Tarefas** (`/api/v1/tasks`).

## Estrutura

```
backend/
├── app/
│   ├── main.py              # Apenas cria o app e registra as rotas
│   ├── api/routes/tasks.py  # Endpoints (recebem HTTP)
│   ├── schemas/task.py      # Modelos Pydantic
│   └── services/task.py     # Regras de negócio + dados em memória
├── tests/
│   ├── conftest.py          # Limpa os dados antes de cada teste
│   ├── unit/                # Testam o service direto, sem HTTP
│   └── integration/         # Testam os endpoints via TestClient
├── .dockerignore
├── Dockerfile               # Como construir a imagem do backend
├── poetry.lock
├── pyproject.toml
└── pytest.ini
.env.example                 # Variáveis necessárias (copiar para .env)
compose.yaml                 # Orquestra api + PostgreSQL
Makefile
```

## Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/v1/tasks?completed=&limit=` | Lista tarefas (query parameters) |
| GET | `/api/v1/tasks/{task_id}` | Busca uma tarefa (path parameter) |
| POST | `/api/v1/tasks` | Cria uma tarefa (201) |
| PUT | `/api/v1/tasks/{task_id}` | Substitui todos os campos |
| PATCH | `/api/v1/tasks/{task_id}` | Atualiza apenas os campos enviados |
| DELETE | `/api/v1/tasks/{task_id}` | Remove a tarefa (204) |

Documentação interativa: `http://localhost:8000/docs`

## Como usar Docker

O ambiente sobe dois serviços com Docker Compose:

- `api`: o backend FastAPI, construído a partir de `backend/Dockerfile`
  (contexto de build `./backend`), publicado em `http://localhost:8000`;
- `db`: PostgreSQL 16, com os dados persistidos no volume `postgres_data`.

A API acessa o banco pelo nome do serviço (`db`), não por `localhost`. Nesta
etapa a API ainda guarda os dados em memória; o banco já fica pronto para a
próxima prática.

### Pré-requisitos

- Docker com o plugin Compose (`docker compose version`)

### Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Ajuste os valores do `.env` se quiser. Ele não é versionado. O `make up` cria
o `.env` automaticamente a partir do `.env.example` se ele não existir.

### Subir o ambiente

```bash
make up-build   # constrói as imagens e sobe (primeira vez ou após mudanças)
make up         # sobe sem reconstruir
```

Equivalente a `docker compose up -d --build`

### Outros comandos

```bash
make ps         # lista os serviços
make logs       # acompanha os logs de todos os serviços
make logs-api   # acompanha os logs da API
make shell      # abre um shell dentro do container da API
make down       # para e remove os containers (o volume do banco é mantido)
```

Para apagar também os dados do banco: `docker compose down -v`

## Como usar Poetry

O projeto Python fica em `backend/`, então os comandos abaixo são executados
dentro dessa pasta:

```bash
cd backend
```

### Instalar dependências

```bash
poetry install --with dev --no-root
```

### Executar a aplicação

```bash
poetry run uvicorn app.main:app --reload
```

A API estará disponível em `http://localhost:8000`

### Entrar no ambiente virtual

```bash
poetry shell
```

Depois use qualquer comando sem prefixo `poetry run`:

```bash
uvicorn app.main:app --reload
```

---

## Como usar Makefile

Os comandos do Makefile são executados a partir da raiz do repositório.

### Ver todos os targets disponíveis

```bash
make help
```

### Instalar dependências

```bash
make install
```

Equivalente a `poetry install`

### Executar a aplicação

```bash
make run
```

Equivalente a `poetry run uvicorn app.main:app --reload --app-dir backend`

### Lint e formatação

```bash
make lint
make format
```

Roda o Ruff (lint e formatter) em `backend`

### Rodar testes

```bash
make test
```

Executa a suíte de testes do backend com Pytest. Também é possível rodar cada
camada separadamente:

```bash
make test-unit
make test-integration
```

Também é possível executar diretamente com Poetry (dentro de `backend/`):

```bash
poetry run pytest tests -q
```

Os testes usam `TestClient`, portanto não é necessário iniciar o servidor da API
separadamente.

O GitHub Actions executa essa mesma suíte automaticamente em cada `push` e
`pull_request`.

### Limpar artefatos

```bash
make clean
```

Remove arquivos de build, cache e `.venv`


