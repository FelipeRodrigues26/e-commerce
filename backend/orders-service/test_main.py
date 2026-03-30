from fastapi.testclient import TestClient
from main import app, get_current_user
from database import get_db
import main
from datetime import datetime

class FakeColumn:
    def desc(self):
        return self


# =========================
# MOCK MODELS
# =========================

class FakeOrderItemModel:
    def __init__(self, product_id, quantity, unit_price):
        self.product_id = product_id
        self.quantity = quantity
        self.unit_price = unit_price
        self.order_id = None


class FakeOrderModel:
    id = FakeColumn() 

    def __init__(self, user_id, total_price):
        self.id = None
        self.user_id = user_id
        self.total_price = total_price
        self.status = "PENDENTE"
        self.created_at = datetime.now()
        self.items = []


# Sobrescreve models reais
main.models.Order = FakeOrderModel
main.models.OrderItem = FakeOrderItemModel


# =========================
# MOCK DB
# =========================

fake_orders = []

class FakeQuery:
    def __init__(self, data):
        self.data = data

    def all(self):
        return self.data

    def order_by(self, *args):
        return self

    def offset(self, *args):
        return self

    def limit(self, *args):
        return self

    def filter(self, *args):
        # filtra por id (simples)
        if args:
            try:
                value = args[0].right.value
                self.data = [o for o in self.data if o.id == value]
            except:
                pass
        return self

    def first(self):
        return self.data[0] if self.data else None


class FakeDB:
    def query(self, model):
        return FakeQuery(fake_orders)

    def add(self, obj):
        # 👇 só persiste Order (ignora OrderItem)
        if isinstance(obj, FakeOrderModel):
            if obj.id is None:
                obj.id = len(fake_orders) + 1
                fake_orders.append(obj)

    def commit(self):
        pass

    def refresh(self, obj):
        pass


def override_get_db():
    yield FakeDB()


app.dependency_overrides[get_db] = override_get_db
app.dependency_overrides[get_current_user] = lambda: "admin"


# =========================
# MOCK REQUESTS (users + catalog)
# =========================

class FakeResponse:
    def __init__(self, data):
        self._data = data

    def json(self):
        return self._data

    def raise_for_status(self):
        pass


def fake_requests_get(url, headers=None):
    if "users" in url:
        return FakeResponse({"id": 1, "username": "admin"})
    if "catalog" in url:
        return FakeResponse([
            {"id": 1, "name": "Produto", "price": 100.0, "stock": 10}
        ])


def fake_requests_patch(url, json=None, headers=None):
    return FakeResponse({})


main.requests.get = fake_requests_get
main.requests.patch = fake_requests_patch


# =========================
# CLIENT
# =========================

client = TestClient(app)


# =========================
# TESTES
# =========================

def test_create_order():
    fake_orders.clear()

    res = client.post(
        "/orders/",
        json={
            "user_id": 1,
            "items": [
                {
                    "product_id": 1,
                    "quantity": 1,
                    "price": 100.0
                }
            ]
        },
        headers={"Authorization": "Bearer fake"}
    )

    print(res.status_code, res.json())
    assert res.status_code in [200, 201]


def test_list_orders():
    fake_orders.clear()

    order = FakeOrderModel(1, 100)
    order.id = 1
    fake_orders.append(order)

    res = client.get("/orders/")
    assert res.status_code == 200
    assert isinstance(res.json(), list)


def test_get_order():
    fake_orders.clear()

    order = FakeOrderModel(1, 100)
    order.id = 1
    fake_orders.append(order)

    res = client.get("/orders/1")
    assert res.status_code == 200


def test_get_order_not_found():
    fake_orders.clear()

    res = client.get("/orders/999")
    assert res.status_code == 404


def test_update_status():
    fake_orders.clear()

    order = FakeOrderModel(1, 100)
    order.id = 1
    fake_orders.append(order)

    res = client.patch(
        "/orders/1/status",
        json={"status": "APROVADO"},
        headers={"Authorization": "Bearer fake"}
    )

    assert res.status_code == 200