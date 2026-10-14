import pytest
from fastapi import status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.task import Task
from app.repositories.task import TaskRepository

BASE_URL = "/api/v1/tasks"


# Sessão nova, independente da usada pela API: só enxerga o que foi commitado
@pytest.fixture
def other_session(db_session):
    session = Session(bind=db_session.get_bind())
    yield session
    session.close()


def test_created_task_is_saved_in_database(client, other_session):
    response = client.post(BASE_URL, json={"title": "Notebook"})

    assert response.status_code == status.HTTP_201_CREATED
    saved = other_session.get(Task, response.json()["id"])
    assert saved is not None
    assert saved.title == "Notebook"
    assert saved.completed is False


def test_updates_are_saved_in_database(client, other_session):
    task_id = client.post(BASE_URL, json={"title": "A"}).json()["id"]

    client.put(f"{BASE_URL}/{task_id}", json={"title": "B", "description": "d"})
    client.patch(f"{BASE_URL}/{task_id}", json={"completed": True})

    saved = other_session.get(Task, task_id)
    assert (saved.title, saved.description, saved.completed) == ("B", "d", True)


def test_deleted_task_is_removed_from_database(client, other_session):
    task_id = client.post(BASE_URL, json={"title": "Temporária"}).json()["id"]

    client.delete(f"{BASE_URL}/{task_id}")

    assert other_session.get(Task, task_id) is None


def test_full_crud_cycle(client):
    created = client.post(BASE_URL, json={"title": "Notebook"}).json()
    assert len(client.get(BASE_URL).json()) > 0

    client.put(f"{BASE_URL}/{created['id']}", json={"title": "Notebook novo"})
    assert client.get(f"{BASE_URL}/{created['id']}").json()["title"] == "Notebook novo"

    client.delete(f"{BASE_URL}/{created['id']}")
    assert client.get(BASE_URL).json() == []


def test_repository_get_all_orders_by_id_and_filters(db_session):
    repository = TaskRepository(db_session)
    for title, completed in [("A", True), ("B", False), ("C", True)]:
        repository.create(Task(title=title, completed=completed))

    done = repository.get_all(completed=True)

    assert [task.title for task in done] == ["A", "C"]
    assert db_session.scalar(select(Task).where(Task.title == "B")).completed is False
