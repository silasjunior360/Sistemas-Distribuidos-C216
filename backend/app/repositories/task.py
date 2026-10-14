from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.task import Task


# Acesso aos dados das tarefas: só esta camada conhece o SQLAlchemy
class TaskRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self, completed: bool | None = None, limit: int = 10) -> list[Task]:
        query = select(Task).order_by(Task.id).limit(limit)
        if completed is not None:
            query = query.where(Task.completed == completed)
        return list(self.db.scalars(query))

    def get(self, task_id: int) -> Task | None:
        return self.db.get(Task, task_id)

    def create(self, task: Task) -> Task:
        self.db.add(task)
        self.db.commit()
        self.db.refresh(task)
        return task

    def update(self, task: Task, changes: dict[str, Any]) -> Task:
        for field, value in changes.items():
            setattr(task, field, value)
        self.db.commit()
        self.db.refresh(task)
        return task

    def delete(self, task: Task) -> None:
        self.db.delete(task)
        self.db.commit()
