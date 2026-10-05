import pytest

from app.services import task as task_service


# Limpa o "banco" em memória antes de cada teste
@pytest.fixture(autouse=True)
def clean_tasks():
    task_service.reset()
