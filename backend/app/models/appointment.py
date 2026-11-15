import datetime

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


# Modelo ORM: representa como o compromisso é armazenado (tabela appointments).
# O formato de entrada e saída da API fica nos schemas Pydantic.
class Appointment(Base):
    __tablename__ = "appointments"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(100))
    description: Mapped[str | None]
    # Data e horas em colunas separadas: não há fuso horário envolvido.
    # Índice na data porque as buscas são sempre por dia ou por mês.
    date: Mapped[datetime.date] = mapped_column(index=True)
    start_time: Mapped[datetime.time]
    end_time: Mapped[datetime.time]
