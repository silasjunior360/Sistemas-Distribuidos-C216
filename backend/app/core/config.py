import os

# A URL do banco vem do ambiente (.env / compose.yaml). Dentro do Compose o host
# é o nome do serviço (db); o padrão abaixo serve para rodar fora do Compose.
DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql+psycopg://app:change-me@localhost:5432/app"
)

# Endereços do frontend que podem chamar a API (separados por vírgula)
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
