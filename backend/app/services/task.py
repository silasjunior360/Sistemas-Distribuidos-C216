from app.schemas.task import Task, TaskCreate, TaskPatch

# Regras de negócio das tarefas. Por enquanto os dados ficam em memória
# (a persistência com banco fica para as próximas práticas).
_tasks: dict[int, Task] = {}
_next_id = 1


def reset() -> None:
    global _next_id
    _tasks.clear()
    _next_id = 1


def list_tasks(completed: bool | None = None, limit: int = 10) -> list[Task]:
    tasks = list(_tasks.values())
    if completed is not None:
        tasks = [task for task in tasks if task.completed == completed]
    return tasks[:limit]


def get_task(task_id: int) -> Task | None:
    return _tasks.get(task_id)


def create_task(data: TaskCreate) -> Task:
    global _next_id
    task = Task(id=_next_id, **data.model_dump())
    _tasks[task.id] = task
    _next_id += 1
    return task


def replace_task(task_id: int, data: TaskCreate) -> Task | None:
    if task_id not in _tasks:
        return None
    _tasks[task_id] = Task(id=task_id, **data.model_dump())
    return _tasks[task_id]


def patch_task(task_id: int, data: TaskPatch) -> Task | None:
    if task_id not in _tasks:
        return None
    changes = data.model_dump(exclude_unset=True)
    _tasks[task_id] = _tasks[task_id].model_copy(update=changes)
    return _tasks[task_id]


def delete_task(task_id: int) -> bool:
    return _tasks.pop(task_id, None) is not None
