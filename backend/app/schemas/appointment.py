import datetime
from typing import Self

from pydantic import BaseModel, ConfigDict, Field, model_validator


# Corpo do POST e do PUT (o PUT substitui todos os campos)
class AppointmentCreate(BaseModel):
    # Tira os espaços das pontas: um título só com espaços vira vazio e é recusado
    model_config = ConfigDict(str_strip_whitespace=True)

    title: str = Field(min_length=1, max_length=100)
    description: str | None = None
    date: datetime.date
    start_time: datetime.time
    end_time: datetime.time

    # Roda depois de validar os campos: compara o início com o fim (senão, 422)
    @model_validator(mode="after")
    def check_end_after_start(self) -> Self:
        if self.end_time <= self.start_time:
            raise ValueError("O horário de término deve ser depois do início")
        return self


# Compromisso retornado pela API (lido a partir do modelo ORM)
class AppointmentRead(AppointmentCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
