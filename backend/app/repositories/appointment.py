import datetime
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.appointment import Appointment


# Acesso aos dados dos compromissos: só esta camada conhece o SQLAlchemy
class AppointmentRepository:
    def __init__(self, db: Session):
        self.db = db

    # Compromissos do mês, em ordem de dia e horário (para montar o calendário)
    def list_by_month(self, year: int, month: int) -> list[Appointment]:
        first_day = datetime.date(year, month, 1)
        # Primeiro dia do mês seguinte (depois de dezembro vem janeiro do outro ano)
        next_month = datetime.date(year + month // 12, month % 12 + 1, 1)
        query = (
            select(Appointment)
            .where(Appointment.date >= first_day, Appointment.date < next_month)
            .order_by(Appointment.date, Appointment.start_time)
        )
        return list(self.db.scalars(query))

    # Compromissos de um dia (o service usa para verificar conflito de horário)
    def list_by_date(self, date: datetime.date) -> list[Appointment]:
        query = (
            select(Appointment)
            .where(Appointment.date == date)
            .order_by(Appointment.start_time)
        )
        return list(self.db.scalars(query))

    def get(self, appointment_id: int) -> Appointment | None:
        return self.db.get(Appointment, appointment_id)

    def create(self, appointment: Appointment) -> Appointment:
        self.db.add(appointment)
        self.db.commit()
        self.db.refresh(appointment)
        return appointment

    def update(self, appointment: Appointment, changes: dict[str, Any]) -> Appointment:
        for field, value in changes.items():
            setattr(appointment, field, value)
        self.db.commit()
        self.db.refresh(appointment)
        return appointment

    def delete(self, appointment: Appointment) -> None:
        self.db.delete(appointment)
        self.db.commit()
