# Prática 1: Git/GitHub, Poetry e Makefile

## Como usar Poetry

### Instalar dependências

```bash
cd backend
poetry install
```

### Executar a aplicação

```bash
poetry run uvicorn main:app --reload
```

A API estará disponível em `http://localhost:8000`

### Entrar no ambiente virtual

```bash
poetry shell
```

Depois use qualquer comando sem prefixo `poetry run`:

```bash
uvicorn main:app --reload
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

Equivalente a `poetry run uvicorn backend.main:app --reload`

### Formatar código

```bash
make lint
```

Roda Black e isort nos arquivos de código

### Rodar testes

```bash
make test
```

Executa pytest

### Limpar artefatos

```bash
make clean
```

Remove arquivos de build, cache e `.venv`


