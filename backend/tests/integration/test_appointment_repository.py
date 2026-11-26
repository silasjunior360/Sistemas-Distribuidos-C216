import datetime

import pytest

from app.models.appointment import Appointment
from app.repositories.appointment import AppointmentRepository


@pytest.fixture
def repository(db_session):
    return AppointmentRepository(db_session)


# Salva um compromisso no banco de teste. Ex.: add(repository, "2026-11-20", "14:00")
def add(repository, day, start, end="23:00", title="Compromisso"):
    return repository.create(
        Appointment(
            title=title,
            date=datetime.date.fromisoformat(day),
            start_time=datetime.time.fromisoformat(start),
            end_time=datetime.time.fromisoformat(end),
        )
    )


def test_list_by_month_returns_only_that_month_in_order(repository):
    add(repository, "2026-10-31", "09:00", title="Outubro")
    add(repository, "2026-11-20", "14:00", title="Tarde")
    add(repository, "2026-11-20", "08:00", title="Manhã")
    add(repository, "2026-11-01", "10:00", title="Dia 1")
    add(repository, "2026-12-01", "09:00", title="Dezembro")

    titles = [a.title for a in repository.list_by_month(2026, 11)]

    assert titles == ["Dia 1", "Manhã", "Tarde"]


def test_list_by_month_handles_december(repository):
    add(repository, "2026-12-31", "09:00", title="Último dia do ano")
    add(repository, "2027-01-01", "09:00", title="Ano novo")

    titles = [a.title for a in repository.list_by_month(2026, 12)]

    assert titles == ["Último dia do ano"]


def test_list_by_date_returns_only_that_day(repository):
    add(repository, "2026-11-20", "14:00", title="Dia 20")
    add(repository, "2026-11-21", "14:00", title="Dia 21")

    titles = [a.title for a in repository.list_by_date(datetime.date(2026, 11, 20))]

    assert titles == ["Dia 20"]


def test_create_update_and_delete(repository):
    created = add(repository, "2026-11-20", "14:00", "15:00", title="Dentista")
    assert created.id is not None

    repository.update(created, {"title": "Médico", "end_time": datetime.time(16)})
    saved = repository.get(created.id)
    assert (saved.title, saved.end_time) == ("Médico", datetime.time(16))

    repository.delete(saved)
    assert repository.get(created.id) is None
