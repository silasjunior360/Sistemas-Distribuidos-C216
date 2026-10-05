from app.schemas.task import TaskCreate, TaskPatch
from app.services import task as task_service


def test_create_task_assigns_incremental_ids():
    first = task_service.create_task(TaskCreate(title="A"))
    second = task_service.create_task(TaskCreate(title="B"))

    assert (first.id, second.id) == (1, 2)


def test_list_tasks_filters_by_completed():
    task_service.create_task(TaskCreate(title="A", completed=True))
    task_service.create_task(TaskCreate(title="B"))

    tasks = task_service.list_tasks(completed=True)

    assert [task.title for task in tasks] == ["A"]


def test_list_tasks_respects_limit():
    for i in range(3):
        task_service.create_task(TaskCreate(title=f"Tarefa {i}"))

    assert len(task_service.list_tasks(limit=2)) == 2


def test_get_task_returns_none_when_missing():
    assert task_service.get_task(1) is None


def test_replace_task_overwrites_all_fields():
    task = task_service.create_task(TaskCreate(title="A", description="desc"))

    updated = task_service.replace_task(task.id, TaskCreate(title="B"))

    assert updated.title == "B"
    assert updated.description is None


def test_patch_task_changes_only_sent_fields():
    task = task_service.create_task(TaskCreate(title="A", description="desc"))

    patched = task_service.patch_task(task.id, TaskPatch(completed=True))

    assert patched.completed is True
    assert patched.description == "desc"


def test_delete_task_returns_false_when_missing():
    assert task_service.delete_task(1) is False
