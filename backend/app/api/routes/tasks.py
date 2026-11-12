from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.repositories.task import TaskRepository
from app.schemas.task import Task, TaskCreate, TaskPatch
from app.services.task import TaskAlreadyExistsError, TaskService

router = APIRouter(prefix="/api/v1/tasks", tags=["tasks"])


# Monta o service com um repository ligado à sessão da requisição
def get_task_service(db: Annotated[Session, Depends(get_db)]) -> TaskService:
    return TaskService(TaskRepository(db))


TaskServiceDep = Annotated[TaskService, Depends(get_task_service)]


def _not_found() -> HTTPException:
    return HTTPException(status.HTTP_404_NOT_FOUND, detail="Tarefa não encontrada")


# As rotas usam "def" (e não "async def") porque o acesso ao banco é síncrono:
# o FastAPI as executa em uma thread separada, sem travar o event loop.


# Método GET - Lista tarefas, com filtros via query parameters
@router.get("", response_model=list[Task])
def list_tasks(service: TaskServiceDep, completed: bool | None = None, limit: int = 10):
    return service.list_tasks(completed, limit)


# Método GET - Busca uma tarefa pelo path parameter
@router.get("/{task_id}", response_model=Task)
def get_task(task_id: int, service: TaskServiceDep):
    task = service.get_task(task_id)
    if task is None:
        raise _not_found()
    return task


# Método POST - Cria uma nova tarefa
@router.post("", response_model=Task, status_code=status.HTTP_201_CREATED)
def create_task(data: TaskCreate, service: TaskServiceDep):
    try:
        return service.create_task(data)
    except TaskAlreadyExistsError:
        raise HTTPException(
            status.HTTP_409_CONFLICT, detail="Já existe uma tarefa com esse título"
        ) from None


# Método PUT - Substitui todos os campos de uma tarefa
@router.put("/{task_id}", response_model=Task)
def replace_task(task_id: int, data: TaskCreate, service: TaskServiceDep):
    task = service.replace_task(task_id, data)
    if task is None:
        raise _not_found()
    return task


# Método PATCH - Atualiza só os campos enviados
@router.patch("/{task_id}", response_model=Task)
def patch_task(task_id: int, data: TaskPatch, service: TaskServiceDep):
    task = service.patch_task(task_id, data)
    if task is None:
        raise _not_found()
    return task


# Método DELETE - Remove uma tarefa
@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: int, service: TaskServiceDep):
    if not service.delete_task(task_id):
        raise _not_found()
