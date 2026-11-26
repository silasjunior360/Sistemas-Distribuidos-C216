import os

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app import models  # noqa: F401  (registra os modelos no Base.metadata)
from app.database.base import Base
from app.database.session import get_db
from app.main import app

# Os testes nunca usam o banco da aplicação. Por padrão rodam em um SQLite em
# memória; definindo TEST_DATABASE_URL eles rodam em um PostgreSQL de teste.
TEST_DATABASE_URL = os.getenv("TEST_DATABASE_URL", "sqlite://")

if TEST_DATABASE_URL.startswith("sqlite"):
    # StaticPool mantém uma única conexão; senão cada uma veria um banco vazio
    engine = create_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
else:
    engine = create_engine(TEST_DATABASE_URL)

TestingSessionLocal = sessionmaker(bind=engine, autoflush=False)


# Cria as tabelas antes de cada teste e apaga depois: cada teste começa limpo
@pytest.fixture
def db_session():
    Base.metadata.create_all(engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(engine)


# Cliente HTTP com a dependência get_db trocada pela sessão de teste
@pytest.fixture
def client(db_session):
    app.dependency_overrides[get_db] = lambda: db_session
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
