from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import CORS_ORIGINS
from app.routes.health import router as health_router

# Ponto de entrada: apenas cria a aplicação e registra as rotas
app = FastAPI(title="API da Agenda de Compromissos")

# O frontend (porta 5173) é outra origem: sem isso o navegador bloqueia a resposta
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

app.include_router(health_router)
