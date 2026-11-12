# API de Tarefas — C216 L1 (Prática 5)

API REST em FastAPI organizada em camadas para o recurso **Tarefas** (`/api/v1/tasks`),
com persistência no PostgreSQL via SQLAlchemy e migrations com Alembic.

## Estrutura

```
backend/
├── app/
│   ├── main.py                  # Apenas cria o app e registra as rotas
│   ├── api/routes/tasks.py      # Endpoints (recebem HTTP)
│   ├── schemas/task.py          # Schemas Pydantic (entrada e saída da API)
│   ├── services/task.py         # Regras de negócio
│   ├── repositories/task.py     # Acesso aos dados (SQLAlchemy)
│   ├── models/task.py           # Modelo ORM (tabela tasks)
│   ├── database/
│   │   ├── base.py              # Classe base dos modelos ORM
│   │   └── session.py           # Engine, sessões e dependência get_db
│   └── core/config.py           # Configuração (DATABASE_URL)
├── alembic/
│   ├── env.py                   # Usa a DATABASE_URL e os modelos da aplicação
│   └── versions/                # Migrations versionadas
├── tests/
│   ├── conftest.py              # Banco de teste e cliente HTTP
│   ├── unit/                    # Testam o service
│   └── integration/             # Testam os endpoints e a persistência
├── .dockerignore
├── alembic.ini
├── Dockerfile                   # Como construir a imagem do backend
├── poetry.lock
├── pyproject.toml
└── pytest.ini
.env.example                     # Variáveis necessárias (copiar para .env)
compose.yaml                     # Orquestra api + PostgreSQL
Makefile
```

## Persistência

Fluxo de uma requisição:

```
Route → Service → Repository → SQLAlchemy → PostgreSQL
```

- **Schemas Pydantic** (`schemas/`) definem como os dados entram e saem da API;
- **Modelos ORM** (`models/`) definem como os dados são armazenados no banco;
- o **repository** é a única camada que conhece o SQLAlchemy;
- cada requisição recebe uma sessão do banco pela dependência `get_db`.

A conexão vem da variável de ambiente `DATABASE_URL`. Dentro do Compose o host
é o nome do serviço (`db`); fora dele (Alembic, `make run`) é `localhost`.

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

A API acessa o banco pelo nome do serviço (`db`), não por `localhost`. Ao
iniciar, o container da API executa `alembic upgrade head`, então o banco é
criado/atualizado automaticamente a partir das migrations. A porta do banco
também é publicada na máquina (`POSTGRES_PORT`, padrão `5432`) para rodar as
migrations fora do container.

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

### Validar a persistência

1. `make up-build`
2. Criar uma tarefa: `POST /api/v1/tasks` com `{"title": "Notebook"}`
3. Listar: `GET /api/v1/tasks`
4. Reiniciar a API: `docker compose restart api`
5. Listar de novo: a tarefa continua lá

Também dá para consultar o banco direto:

```bash
make db-shell          # abre o psql no container do banco
SELECT * FROM tasks;
```

## Migrations (Alembic)

Os comandos rodam na máquina e acessam o banco publicado em `localhost`, com as
credenciais do `.env`. O serviço `db` precisa estar rodando (`make up` ou
`docker compose up -d db`).

```bash
make db-upgrade                          # aplica todas as migrations
make db-migration msg="add due date"     # gera migration a partir dos modelos
make db-current                          # revisão atual do banco
make db-history                          # histórico de migrations
make db-downgrade                        # desfaz a última migration
```

Fluxo para alterar o banco:

```
Alterar o modelo → make db-migration → revisar o arquivo gerado → make db-upgrade
```

Sempre revise a migration gerada em `backend/alembic/versions/` antes de aplicar.

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

Com o banco rodando e as migrations aplicadas:

```bash
poetry run uvicorn app.main:app --reload
```

A API estará disponível em `http://localhost:8000`. Sem `DATABASE_URL` definida,
ela usa `postgresql+psycopg://app:change-me@localhost:5432/app` (os valores do
`.env.example`).

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

Equivalente a `poetry run uvicorn app.main:app --reload --app-dir backend`,
usando o banco publicado em `localhost` com as credenciais do `.env`

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
separadamente. Eles nunca usam o banco da aplicação: por padrão rodam em um
SQLite em memória, recriando as tabelas a cada teste. Para rodar contra um
PostgreSQL de teste, defina `TEST_DATABASE_URL`:

```bash
TEST_DATABASE_URL=postgresql+psycopg://app:change-me@localhost:5432/app_test make test
```

O GitHub Actions executa essa mesma suíte automaticamente em cada `push` e
`pull_request`, e também um job com PostgreSQL que aplica as migrations em um
banco vazio, confere se elas batem com os modelos (`alembic check`) e roda os
testes de integração no PostgreSQL.

### Limpar artefatos

```bash
make clean
```

Remove arquivos de build, cache e `.venv`


