from sqlalchemy import String, false
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


# Modelo ORM: representa como a tarefa é armazenada (tabela tasks).
# O formato de entrada e saída da API fica nos schemas Pydantic.
class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(100))
    description: Mapped[str | None]
    completed: Mapped[bool] = mapped_column(default=False, server_default=false())
