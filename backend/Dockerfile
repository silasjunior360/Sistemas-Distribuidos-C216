FROM python:3.12-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Dependências primeiro: esta camada só é refeita quando o lock muda
COPY pyproject.toml poetry.lock ./

RUN pip install --no-cache-dir poetry==2.4.1 \
    && poetry config virtualenvs.create false \
    && poetry install --only main --no-root --no-interaction --no-ansi \
    && pip uninstall -y poetry

COPY app ./app

# Executa a aplicação sem privilégios de root
RUN useradd --create-home --uid 1000 appuser
USER appuser

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
