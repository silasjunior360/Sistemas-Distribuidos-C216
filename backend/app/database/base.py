from sqlalchemy.orm import DeclarativeBase


# Classe base de todos os modelos ORM (o Alembic lê o metadata dela)
class Base(DeclarativeBase):
    pass
