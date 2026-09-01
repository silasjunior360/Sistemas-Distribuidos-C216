FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY pyproject.toml poetry.lock* ./
COPY backend ./backend
COPY tests ./tests

RUN pip install --no-cache-dir \
    "fastapi>=0.141.1,<0.142.0" \
    "uvicorn>=0.52.3,<0.53.0" \
    "pytest>=9.1.1,<10.0.0" \
    "httpx>=0.28.1,<0.29.0" \
    "ruff>=0.16.3,<0.17.0"

EXPOSE 8000

CMD ["python", "-m", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
