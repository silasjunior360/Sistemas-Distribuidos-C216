# Importa todos os modelos para registrá-los no Base.metadata (usado pelo
# Alembic e pelos testes)
from app.models.appointment import Appointment

__all__ = ["Appointment"]
