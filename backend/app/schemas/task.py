from pydantic import BaseModel, Field


# Corpo do POST e do PUT
class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=100)
    description: str | None = None
    completed: bool = False


# Corpo do PATCH: todos os campos são opcionais
class TaskPatch(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=100)
    description: str | None = None
    completed: bool | None = None


# Tarefa retornada pela API
class Task(TaskCreate):
    id: int
