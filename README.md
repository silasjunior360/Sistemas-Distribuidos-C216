

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

Executa a suíte de testes do backend com Pytest.

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


