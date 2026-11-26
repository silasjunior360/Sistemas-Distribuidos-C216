# Agenda de Compromissos — Projeto Final C216 L1

Aplicação full stack para marcar compromissos em um calendário mensal: o usuário
escolhe um dia, vê os compromissos dele e pode criar, editar e excluir.

**Vídeo de apresentação:** https://youtu.be/kOez9vrTUW4
## Funcionalidades e regras

- Calendário do mês com navegação entre meses e marcação dos dias com compromisso
- Lista dos compromissos do dia selecionado, em ordem de horário
- Criar, editar e excluir compromissos (título, descrição, data, início e fim)
- **Regras de negócio:**
  - o término deve ser depois do início (validação do schema, `422`)
  - dois compromissos não podem se sobrepor no mesmo dia (service, `409`);
    horários encostados (14h–15h e 15h–16h) são permitidos
- Os dados ficam no PostgreSQL e continuam após recarregar a página

## Tecnologias

- **Backend:** Python 3.12, FastAPI, SQLAlchemy, Alembic, PostgreSQL 16
- **Frontend:** React, Vite, Tailwind CSS
- **Testes e qualidade:** Pytest, Ruff, Vitest, Testing Library, Playwright, Biome
- **Infra:** Docker Compose, Makefile, GitHub Actions

## Arquitetura

```
Frontend (React) → Rotas (HTTP) → Service (regras) → Repository (SQLAlchemy) → PostgreSQL
```

```
backend/app/
├── routes/          # Endpoints e códigos HTTP
├── services/        # Regra de conflito de horário
├── repositories/    # Consultas ao banco
├── schemas/         # Validação de entrada e saída (Pydantic)
└── models/          # Tabela appointments (ORM)
frontend/src/
├── components/      # MonthCalendar, DayAppointments, AppointmentForm
├── services/        # Chamadas à API
└── utils/           # Contas do calendário
```

## API

Base: `/api/v1/appointments`

| Método | Rota | Descrição | Respostas |
|---|---|---|---|
| GET | `?year=2026&month=11` | Compromissos do mês | 200, 422 |
| GET | `/{id}` | Um compromisso | 200, 404 |
| POST | `/` | Cria | 201, 409, 422 |
| PUT | `/{id}` | Substitui | 200, 404, 409, 422 |
| DELETE | `/{id}` | Exclui | 204, 404 |

Documentação interativa: http://localhost:8000/docs

## Como executar

Pré-requisitos: Docker com Compose e Make.

```bash
make up-build   # cria o .env, constrói as imagens e sobe db, api e frontend
make ps         # os três serviços devem aparecer como healthy
make down       # para os containers (os dados do banco são mantidos)
```

A API aplica as migrations automaticamente ao iniciar.

| Serviço | Endereço |
|---|---|
| Frontend | http://localhost:5173 |
| API | http://localhost:8000 |

## Testes

```bash
make install && make frontend-install   # dependências (Python 3.12 + Poetry, Node 22)
make lint && make test                  # Ruff e Pytest (unitários e integração)
make frontend-check && make frontend-test   # Biome e Vitest
make e2e                                # Playwright em uma stack Docker separada
```

- **Backend:** unitários (schemas e regra de conflito) e integração (repository e
  endpoints com banco real)
- **Frontend:** unitários (componentes e funções) e integração (App com a API simulada)
- **E2E:** navegador real contra a stack completa: criar e recarregar, conflito,
  validação e edição

O GitHub Actions roda lint, migrations, testes e E2E em todo pull request.

`make help` lista todos os comandos.
