import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import Base, get_db
from main import app
import models

# Configuração do banco de dados de teste (SQLite em memória)
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_orders.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

def test_list_orders_empty():
    response = client.get("/orders/")
    assert response.status_code == 200
    assert response.json() == []

def test_create_order_unauthorized():
    # Testar se falha sem o token JWT (que adicionamos agora na proteção de rota)
    response = client.post(
        "/orders/",
        json={"user_id": 1, "product_name": "Test Product", "quantity": 1}
    )
    assert response.status_code == 401
