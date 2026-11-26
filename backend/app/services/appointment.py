from app.models.appointment import Appointment
from app.repositories.appointment import AppointmentRepository
from app.schemas.appointment import AppointmentCreate


# Erro de regra de negócio: a rota o converte em 409 Conflict
class AppointmentConflictError(Exception):
    pass


# Regras de negócio dos compromissos. Recebe schemas Pydantic e usa o
# repository para ler e gravar no banco.
class AppointmentService:
    def __init__(self, repository: AppointmentRepository):
        self.repository = repository

    def list_month(self, year: int, month: int) -> list[Appointment]:
        return self.repository.list_by_month(year, month)

    def get_appointment(self, appointment_id: int) -> Appointment | None:
        return self.repository.get(appointment_id)

    def create_appointment(self, data: AppointmentCreate) -> Appointment:
        self._check_conflict(data)
        return self.repository.create(Appointment(**data.model_dump()))

    def replace_appointment(
        self, appointment_id: int, data: AppointmentCreate
    ) -> Appointment | None:
        appointment = self.repository.get(appointment_id)
        if appointment is None:
            return None
        # Na edição, o próprio compromisso não conta como conflito
        self._check_conflict(data, ignore_id=appointment_id)
        return self.repository.update(appointment, data.model_dump())

    def delete_appointment(self, appointment_id: int) -> bool:
        appointment = self.repository.get(appointment_id)
        if appointment is None:
            return False
        self.repository.delete(appointment)
        return True

    # Regra: dois compromissos do mesmo dia não podem ter horários sobrepostos.
    # Sobrepõe quando um começa antes do outro terminar e termina depois de o
    # outro começar. Encostar não conta: 10h-11h e 11h-12h podem coexistir.
    def _check_conflict(
        self, data: AppointmentCreate, ignore_id: int | None = None
    ) -> None:
        for other in self.repository.list_by_date(data.date):
            if other.id == ignore_id:
                continue
            if data.start_time < other.end_time and data.end_time > other.start_time:
                raise AppointmentConflictError(
                    f"Horário em conflito com '{other.title}' "
                    f"({other.start_time:%H:%M} às {other.end_time:%H:%M})"
                )
