import pytest
from fastapi import status
from fastapi.testclient import TestClient

from backend.main import app


@pytest.fixture
def client():
    return TestClient(app)


def test_get_root_returns_status(client):
    response = client.get('/')

    assert response.status_code == status.HTTP_200_OK


@pytest.mark.parametrize('name', ['Joao', 'Maria'])
def test_get_hello_query_returns_greeting(client, name):
    response = client.get('/api/v1/hello', params={'name': name})

    assert response.status_code == status.HTTP_200_OK


def test_get_hello_path_returns_greeting(client):
    response = client.get('/api/v1/hello/Joao')

    assert response.status_code == status.HTTP_200_OK


def test_post_hello_accepts_user_payload(client):
    response = client.post('/api/v1/hello', json={'name': 'Joao'})

    assert response.status_code == status.HTTP_200_OK


def test_post_hello_rejects_invalid_payload(client):
    response = client.post('/api/v1/hello', json={})

    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT


def test_put_update_returns_updated_resource(client):
    response = client.put('/api/v1/update', json={'name': 'Joao'})

    assert response.status_code == status.HTTP_200_OK


def test_delete_user_returns_deleted_resource(client):
    response = client.delete('/api/v1/delete', params={'name': 'Joao'})

    assert response.status_code == status.HTTP_200_OK


def test_patch_user_returns_modified_resource(client):
    response = client.patch('/api/v1/patch', json={'name': 'Joao'})

    assert response.status_code == status.HTTP_200_OK