# Importa todos os modelos para registrá-los no Base.metadata (usado pelo Alembic)
from app.models.task import Task

__all__ = ["Task"]
