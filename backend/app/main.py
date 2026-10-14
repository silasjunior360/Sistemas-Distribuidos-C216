from fastapi import FastAPI

from app.api.routes.tasks import router as tasks_router

# Ponto de entrada: apenas cria a aplicação e registra as rotas
app = FastAPI(title="API de Tarefas")
app.include_router(tasks_router)
