import pytest
from fastapi import status
from fastapi.testclient import TestClient

from app.main import app

BASE_URL = "/api/v1/tasks"


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def created_task(client):
    return client.post(BASE_URL, json={"title": "Estudar FastAPI"}).json()


def test_create_task(client):
    response = client.post(BASE_URL, json={"title": "Nova tarefa"})

    assert response.status_code == status.HTTP_201_CREATED
    assert response.json() == {
        "id": 1,
        "title": "Nova tarefa",
        "description": None,
        "completed": False,
    }


def test_create_task_rejects_invalid_payload(client):
    response = client.post(BASE_URL, json={})

    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT


def test_list_tasks(client, created_task):
    response = client.get(BASE_URL)

    assert response.status_code == status.HTTP_200_OK
    assert response.json() == [created_task]


def test_list_tasks_with_query_params(client):
    client.post(BASE_URL, json={"title": "Feita", "completed": True})
    client.post(BASE_URL, json={"title": "Pendente"})

    response = client.get(BASE_URL, params={"completed": True, "limit": 5})

    assert [task["title"] for task in response.json()] == ["Feita"]


def test_get_task(client, created_task):
    response = client.get(f"{BASE_URL}/{created_task['id']}")

    assert response.status_code == status.HTTP_200_OK
    assert response.json() == created_task


def test_get_task_not_found(client):
    response = client.get(f"{BASE_URL}/999")

    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_replace_task(client, created_task):
    response = client.put(f"{BASE_URL}/{created_task['id']}", json={"title": "Nova"})

    assert response.status_code == status.HTTP_200_OK
    assert response.json()["title"] == "Nova"


def test_replace_task_not_found(client):
    response = client.put(f"{BASE_URL}/999", json={"title": "X"})

    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_patch_task(client, created_task):
    response = client.patch(
        f"{BASE_URL}/{created_task['id']}", json={"completed": True}
    )

    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {**created_task, "completed": True}


def test_patch_task_not_found(client):
    response = client.patch(f"{BASE_URL}/999", json={"completed": True})

    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_delete_task(client, created_task):
    response = client.delete(f"{BASE_URL}/{created_task['id']}")

    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert client.get(f"{BASE_URL}/{created_task['id']}").status_code == 404


def test_delete_task_not_found(client):
    response = client.delete(f"{BASE_URL}/999")

    assert response.status_code == status.HTTP_404_NOT_FOUND
