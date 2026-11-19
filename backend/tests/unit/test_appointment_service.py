import pytest

from app.repositories.appointment import AppointmentRepository
from app.schemas.appointment import AppointmentCreate
from app.services.appointment import AppointmentConflictError, AppointmentService


@pytest.fixture
def service(db_session):
    return AppointmentService(AppointmentRepository(db_session))


# Compromisso no dia 20/11/2026. Ex.: data("14:00", "15:00")
def data(start, end, title="Compromisso", day="2026-11-20"):
    return AppointmentCreate(title=title, date=day, start_time=start, end_time=end)


@pytest.mark.parametrize(
    ("start", "end"),
    [
        ("14:00", "15:00"),  # mesmo horário
        ("14:30", "15:30"),  # começa no meio
        ("13:30", "14:30"),  # termina no meio
        ("13:00", "16:00"),  # engloba o outro
        ("14:15", "14:45"),  # fica dentro do outro
    ],
)
def test_overlapping_time_is_rejected(service, start, end):
    service.create_appointment(data("14:00", "15:00", title="Dentista"))

    with pytest.raises(AppointmentConflictError, match="Dentista"):
        service.create_appointment(data(start, end))


def test_back_to_back_appointments_are_allowed(service):
    service.create_appointment(data("10:00", "11:00"))

    created = service.create_appointment(data("11:00", "12:00"))

    assert created.id is not None


def test_same_time_on_another_day_is_allowed(service):
    service.create_appointment(data("14:00", "15:00"))

    created = service.create_appointment(data("14:00", "15:00", day="2026-11-21"))

    assert created.id is not None


def test_editing_does_not_conflict_with_itself(service):
    appointment = service.create_appointment(data("14:00", "15:00"))

    updated = service.replace_appointment(
        appointment.id, data("14:30", "15:30", title="Dentista (remarcado)")
    )

    assert updated.title == "Dentista (remarcado)"


def test_editing_into_another_appointment_is_rejected(service):
    service.create_appointment(data("14:00", "15:00", title="Dentista"))
    other = service.create_appointment(data("16:00", "17:00"))

    with pytest.raises(AppointmentConflictError):
        service.replace_appointment(other.id, data("14:30", "15:30"))


def test_missing_appointment_returns_none_or_false(service):
    assert service.get_appointment(99) is None
    assert service.replace_appointment(99, data("14:00", "15:00")) is None
    assert service.delete_appointment(99) is False
