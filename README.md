# API de Tarefas — C216 L1 (Prática 4)

API REST em FastAPI organizada em camadas para o recurso **Tarefas** (`/api/v1/tasks`).

## Estrutura

```
backend/app/
├── main.py              # Apenas cria o app e registra as rotas
├── api/routes/tasks.py  # Endpoints (recebem HTTP)
├── schemas/task.py      # Modelos Pydantic
└── services/task.py     # Regras de negócio + dados em memória
tests/
├── conftest.py          # Limpa os dados antes de cada teste
├── unit/                # Testam o service direto, sem HTTP
└── integration/         # Testam os endpoints via TestClient
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

## Como usar Poetry

### Instalar dependências

```bash
poetry install --with dev --no-root
```

### Executar a aplicação

```bash
poetry run uvicorn app.main:app --reload --app-dir backend
```

A API estará disponível em `http://localhost:8000`

### Entrar no ambiente virtual

```bash
poetry shell
```

Depois use qualquer comando sem prefixo `poetry run`:

```bash
uvicorn app.main:app --reload --app-dir backend
```

---

## Como usar Makefile

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

Roda o Ruff (lint e formatter) em `backend` e `tests`

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

Também é possível executar diretamente com Poetry:

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


