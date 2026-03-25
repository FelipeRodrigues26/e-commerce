import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_get_catalog():
    # Como o catálogo tem o fallback pro Postgres e popula o mock, deve retornar algo
    response = client.get("/catalog/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "name" in data[0]
