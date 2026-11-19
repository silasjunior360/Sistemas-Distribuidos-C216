from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.repositories.appointment import AppointmentRepository
from app.schemas.appointment import AppointmentCreate, AppointmentRead
from app.services.appointment import AppointmentConflictError, AppointmentService

router = APIRouter(prefix="/api/v1/appointments", tags=["appointments"])


# Monta o service com um repository ligado à sessão da requisição
def get_service(db: Annotated[Session, Depends(get_db)]) -> AppointmentService:
    return AppointmentService(AppointmentRepository(db))


ServiceDep = Annotated[AppointmentService, Depends(get_service)]


def _not_found() -> HTTPException:
    return HTTPException(status.HTTP_404_NOT_FOUND, detail="Compromisso não encontrado")


def _conflict(error: AppointmentConflictError) -> HTTPException:
    return HTTPException(status.HTTP_409_CONFLICT, detail=str(error))


# As rotas usam "def" (e não "async def") porque o acesso ao banco é síncrono:
# o FastAPI as executa em uma thread separada, sem travar o event loop.


# GET - Compromissos de um mês (query parameters): ?year=2026&month=11
@router.get("", response_model=list[AppointmentRead])
def list_month(
    service: ServiceDep,
    year: Annotated[int, Query(ge=2000, le=2100)],
    month: Annotated[int, Query(ge=1, le=12)],
):
    return service.list_month(year, month)


# GET - Um compromisso pelo id (path parameter)
@router.get("/{appointment_id}", response_model=AppointmentRead)
def get_appointment(appointment_id: int, service: ServiceDep):
    appointment = service.get_appointment(appointment_id)
    if appointment is None:
        raise _not_found()
    return appointment


# POST - Cria um compromisso (409 se o horário estiver ocupado)
@router.post("", response_model=AppointmentRead, status_code=status.HTTP_201_CREATED)
def create_appointment(data: AppointmentCreate, service: ServiceDep):
    try:
        return service.create_appointment(data)
    except AppointmentConflictError as error:
        raise _conflict(error) from None


# PUT - Substitui todos os campos de um compromisso
@router.put("/{appointment_id}", response_model=AppointmentRead)
def replace_appointment(
    appointment_id: int, data: AppointmentCreate, service: ServiceDep
):
    try:
        appointment = service.replace_appointment(appointment_id, data)
    except AppointmentConflictError as error:
        raise _conflict(error) from None
    if appointment is None:
        raise _not_found()
    return appointment


# DELETE - Remove um compromisso (204: deu certo e não há conteúdo para devolver)
@router.delete("/{appointment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_appointment(appointment_id: int, service: ServiceDep):
    if not service.delete_appointment(appointment_id):
        raise _not_found()
