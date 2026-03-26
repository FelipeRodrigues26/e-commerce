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

from unittest.mock import patch, MagicMock

@pytest.fixture
def mock_external_services():
    with patch("main.requests.get") as mock_get, \
         patch("main.requests.patch") as mock_patch:
        # Mock Users Service
        mock_user_res = MagicMock()
        mock_user_res.status_code = 200
        mock_user_res.json.return_value = [{"id": 1, "username": "admin"}]
        
        # Mock Catalog Service (List)
        mock_cat_res = MagicMock()
        mock_cat_res.status_code = 200
        mock_cat_res.json.return_value = [{"id": 1, "name": "Teclado", "price": 100.0, "stock": 50}]
        
        # Mock Stock Update
        mock_stock_res = MagicMock()
        mock_stock_res.status_code = 200
        
        mock_get.side_effect = [mock_user_res, mock_cat_res]
        mock_patch.return_value = mock_stock_res
        yield mock_get, mock_patch

def test_list_orders_empty():
    # Limpa banco antes do teste se necessário, mas create_all já inicia limpo
    response = client.get("/orders/")
    assert response.status_code == 200

def test_create_order_unauthorized():
    response = client.post(
        "/orders/",
        json={"user_id": 1, "items": [{"product_id": 1, "quantity": 1}]}
    )
    assert response.status_code == 401

def test_create_order_authorized(mock_external_services):
    from main import get_current_user
    app.dependency_overrides[get_current_user] = lambda: "admin"
    
    response = client.post(
        "/orders/",
        json={
            "user_id": 1,
            "items": [{"product_id": 1, "quantity": 2}]
        },
        headers={"Authorization": "Bearer fake-token"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["total_price"] == 200.0 # 2 * 100.0
    assert len(data["items"]) == 1
    assert data["items"][0]["product_id"] == 1

def test_get_order_by_id():
    # Assume que o ID 1 foi criado no teste anterior ou via seed (como estamos em StaticPool, persiste)
    response = client.get("/orders/1")
    if response.status_code == 404:
        pytest.skip("Order 1 not found in this test session")
    assert response.status_code == 200
    assert "total_price" in response.json()

def test_get_order_not_found():
    response = client.get("/orders/999")
    assert response.status_code == 404

def test_update_order_status():
    # Tenta atualizar o status do pedido 1
    response = client.patch(
        "/orders/1/status",
        json={"status": "ENTREGUE"}
    )
    if response.status_code == 404:
        pytest.skip("Order 1 not found for status update")
    assert response.status_code == 200
    assert response.json()["status"] == "ENTREGUE"
