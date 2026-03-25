import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import Base, get_db
from main import app
from sqlalchemy.pool import StaticPool
import models

# Configuração do banco de dados de teste (SQLite em memória com Pool Estático)
SQLALCHEMY_DATABASE_URL = "sqlite://"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
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

def test_create_order_authorized():
    # Mock do usuário logado injetando no dependency_overrides
    from main import get_current_user
    app.dependency_overrides[get_current_user] = lambda: "testuser"
    
    response = client.post(
        "/orders/",
        json={"user_id": 1, "product_name": "Test Product", "quantity": 2}
    )
    assert response.status_code == 200
    assert response.json()["product_name"] == "Test Product"

def test_get_order_by_id():
    response = client.get("/orders/1")
    assert response.status_code == 200
    assert response.json()["id"] == 1

def test_get_order_not_found():
    response = client.get("/orders/999")
    assert response.status_code == 404

def test_update_order_status():
    response = client.patch(
        "/orders/1/status",
        json={"status": "Shipped"}
    )
    assert response.status_code == 200
    assert response.json()["status"] == "Shipped"
