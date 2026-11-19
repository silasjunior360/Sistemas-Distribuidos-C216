import pytest
from fastapi import status
from sqlalchemy.orm import Session

from app.models.appointment import Appointment

BASE_URL = "/api/v1/appointments"


# Corpo válido de um compromisso; cada teste muda só o que precisa
def body(**changes):
    data = {
        "title": "Dentista",
        "date": "2026-11-20",
        "start_time": "14:00",
        "end_time": "15:00",
    }
    return {**data, **changes}


# Sessão nova, independente da usada pela API: só enxerga o que foi commitado
@pytest.fixture
def other_session(db_session):
    session = Session(bind=db_session.get_bind())
    yield session
    session.close()


def test_create_returns_201_and_saves_in_database(client, other_session):
    response = client.post(BASE_URL, json=body())

    assert response.status_code == status.HTTP_201_CREATED
    created = response.json()
    assert created["start_time"] == "14:00:00"
    saved = other_session.get(Appointment, created["id"])
    assert saved.title == "Dentista"


def test_list_month_returns_only_that_month(client):
    client.post(BASE_URL, json=body(title="Novembro"))
    client.post(BASE_URL, json=body(title="Dezembro", date="2026-12-01"))

    response = client.get(BASE_URL, params={"year": 2026, "month": 11})

    assert response.status_code == status.HTTP_200_OK
    assert [a["title"] for a in response.json()] == ["Novembro"]


@pytest.mark.parametrize(
    "params", [{"year": 2026}, {"year": 2026, "month": 13}, {"month": 11}]
)
def test_list_month_requires_valid_year_and_month(client, params):
    response = client.get(BASE_URL, params=params)

    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT


def test_get_by_id_and_404(client):
    created = client.post(BASE_URL, json=body()).json()

    assert client.get(f"{BASE_URL}/{created['id']}").json() == created
    assert client.get(f"{BASE_URL}/999").status_code == status.HTTP_404_NOT_FOUND


def test_create_with_conflicting_time_returns_409(client):
    client.post(BASE_URL, json=body())

    response = client.post(
        BASE_URL, json=body(title="Reunião", start_time="14:30", end_time="15:30")
    )

    assert response.status_code == status.HTTP_409_CONFLICT
    assert "Dentista" in response.json()["detail"]


def test_create_with_end_before_start_returns_422(client):
    response = client.post(BASE_URL, json=body(start_time="15:00", end_time="14:00"))

    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT


def test_put_replaces_appointment(client, other_session):
    created = client.post(BASE_URL, json=body(description="Levar exames")).json()

    response = client.put(
        f"{BASE_URL}/{created['id']}", json=body(title="Médico", end_time="16:00")
    )

    assert response.status_code == status.HTTP_200_OK
    saved = other_session.get(Appointment, created["id"])
    assert (saved.title, saved.description) == ("Médico", None)


def test_put_returns_404_and_409(client):
    client.post(BASE_URL, json=body())
    other = client.post(BASE_URL, json=body(start_time="16:00", end_time="17:00"))

    missing = client.put(
        f"{BASE_URL}/999", json=body(start_time="18:00", end_time="19:00")
    )
    conflict = client.put(f"{BASE_URL}/{other.json()['id']}", json=body())

    assert missing.status_code == status.HTTP_404_NOT_FOUND
    assert conflict.status_code == status.HTTP_409_CONFLICT


def test_delete_returns_204_then_404(client, other_session):
    created = client.post(BASE_URL, json=body()).json()

    first = client.delete(f"{BASE_URL}/{created['id']}")
    second = client.delete(f"{BASE_URL}/{created['id']}")

    assert first.status_code == status.HTTP_204_NO_CONTENT
    assert second.status_code == status.HTTP_404_NOT_FOUND
    assert other_session.get(Appointment, created["id"]) is None
