from fastapi import APIRouter, HTTPException, status

from app.schemas.task import Task, TaskCreate, TaskPatch
from app.services import task as task_service

router = APIRouter(prefix="/api/v1/tasks", tags=["tasks"])


def _not_found() -> HTTPException:
    return HTTPException(status.HTTP_404_NOT_FOUND, detail="Tarefa não encontrada")


# Método GET - Lista tarefas, com filtros via query parameters
@router.get("", response_model=list[Task])
async def list_tasks(completed: bool | None = None, limit: int = 10):
    return task_service.list_tasks(completed, limit)


# Método GET - Busca uma tarefa pelo path parameter
@router.get("/{task_id}", response_model=Task)
async def get_task(task_id: int):
    task = task_service.get_task(task_id)
    if task is None:
        raise _not_found()
    return task


# Método POST - Cria uma nova tarefa
@router.post("", response_model=Task, status_code=status.HTTP_201_CREATED)
async def create_task(data: TaskCreate):
    return task_service.create_task(data)


# Método PUT - Substitui todos os campos de uma tarefa
@router.put("/{task_id}", response_model=Task)
async def replace_task(task_id: int, data: TaskCreate):
    task = task_service.replace_task(task_id, data)
    if task is None:
        raise _not_found()
    return task


# Método PATCH - Atualiza só os campos enviados
@router.patch("/{task_id}", response_model=Task)
async def patch_task(task_id: int, data: TaskPatch):
    task = task_service.patch_task(task_id, data)
    if task is None:
        raise _not_found()
    return task


# Método DELETE - Remove uma tarefa
@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(task_id: int):
    if not task_service.delete_task(task_id):
        raise _not_found()
