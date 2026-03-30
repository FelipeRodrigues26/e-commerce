from fastapi.testclient import TestClient
from main import app, get_current_user
from database import get_db
import main

# =========================
# MOCKS SIMPLES
# =========================

class FakeProduct:
    def __init__(self, id, name, price, description=None, stock=10):
        self.id = id
        self.name = name
        self.price = price
        self.description = description
        self.stock = stock


fake_db = [
    FakeProduct(1, "Produto 1", 100.0, "desc", 10)
]


class FakeDB:
    def query(self, model):
        return self

    def all(self):
        return fake_db

    def filter(self, *args, **kwargs):
        return self

    def first(self):
        return fake_db[0] if fake_db else None

    def add(self, obj):
        obj.id = len(fake_db) + 1
        fake_db.append(obj)

    def commit(self):
        pass

    def refresh(self, obj):
        pass

    def delete(self, obj):
        fake_db.remove(obj)


def override_get_db():
    yield FakeDB()


app.dependency_overrides[get_db] = override_get_db
app.dependency_overrides[get_current_user] = lambda: "admin"


# =========================
# MOCK REDIS
# =========================

class FakeRedis:
    def get(self, key):
        return None

    def set(self, key, value):
        pass

    def delete(self, key):
        pass


main.redis_client = FakeRedis()

client = TestClient(app)

# =========================
# TESTES PRINCIPAIS
# =========================

def test_get_catalog():
    res = client.get(
        "/catalog/",
        headers={"Authorization": "Bearer fake"}
    )
    assert res.status_code == 200
    assert isinstance(res.json(), list)


def test_create_product():
    res = client.post(
        "/catalog/",
        json={
            "name": "Novo",
            "price": 50.0,
            "description": "teste",
            "stock": 5
        },
        headers={"Authorization": "Bearer fake"}
    )
    assert res.status_code in [200, 201]


def test_delete_product():
    res = client.delete(
        "/catalog/1",
        headers={"Authorization": "Bearer fake"}
    )
    assert res.status_code == 200


def test_update_stock():
    fake_db.clear()
    fake_db.append(FakeProduct(1, "Produto 1", 100.0, "desc", 10))

    res = client.patch(
        "/catalog/1/stock",
        json={"quantity_delta": -1},
        headers={"Authorization": "Bearer fake"}
    )
    assert res.status_code == 200


def test_get_catalog_unauthorized():
    app.dependency_overrides.pop(get_current_user, None)

    res = client.get("/catalog/")
    assert res.status_code == 401

    app.dependency_overrides[get_current_user] = lambda: "admin"