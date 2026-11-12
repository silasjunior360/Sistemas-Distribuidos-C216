from app.models.task import Task
from app.repositories.task import TaskRepository
from app.schemas.task import TaskCreate, TaskPatch


# Erro de regra de negócio: a rota o converte em 409 Conflict
class TaskAlreadyExistsError(Exception):
    pass


# Regras de negócio das tarefas. Recebe schemas Pydantic e usa o repository
# para persistir os dados no banco.
class TaskService:
    def __init__(self, repository: TaskRepository):
        self.repository = repository

    def list_tasks(self, completed: bool | None = None, limit: int = 10) -> list[Task]:
        return self.repository.get_all(completed, limit)

    def get_task(self, task_id: int) -> Task | None:
        return self.repository.get(task_id)

    def create_task(self, data: TaskCreate) -> Task:
        if self.repository.get_by_title(data.title) is not None:
            raise TaskAlreadyExistsError
        return self.repository.create(Task(**data.model_dump()))

    def replace_task(self, task_id: int, data: TaskCreate) -> Task | None:
        task = self.repository.get(task_id)
        if task is None:
            return None
        return self.repository.update(task, data.model_dump())

    def patch_task(self, task_id: int, data: TaskPatch) -> Task | None:
        task = self.repository.get(task_id)
        if task is None:
            return None
        return self.repository.update(task, data.model_dump(exclude_unset=True))

    def delete_task(self, task_id: int) -> bool:
        task = self.repository.get(task_id)
        if task is None:
            return False
        self.repository.delete(task)
        return True
