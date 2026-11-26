import datetime

import pytest
from pydantic import ValidationError

from app.schemas.appointment import AppointmentCreate


# Dados válidos; cada teste muda só o campo que interessa
def appointment_data(**changes):
    data = {
        "title": "Dentista",
        "date": "2026-11-20",
        "start_time": "14:00",
        "end_time": "15:00",
    }
    return {**data, **changes}


def test_valid_appointment_converts_date_and_times():
    appointment = AppointmentCreate(**appointment_data())

    assert appointment.date == datetime.date(2026, 11, 20)
    assert appointment.start_time == datetime.time(14, 0)
    assert appointment.description is None


@pytest.mark.parametrize("end_time", ["14:00", "13:00"])
def test_end_time_must_be_after_start_time(end_time):
    with pytest.raises(ValidationError, match="término deve ser depois do início"):
        AppointmentCreate(**appointment_data(end_time=end_time))


def test_blank_title_is_rejected():
    with pytest.raises(ValidationError):
        AppointmentCreate(**appointment_data(title="   "))
