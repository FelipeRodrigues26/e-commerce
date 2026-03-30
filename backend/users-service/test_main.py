from fastapi.testclient import TestClient
from main import app, get_current_user
from database import get_db
import main

# =========================
# COLUNA E EXPRESSÕES FAKE
# =========================

class Expr:
    def __init__(self, value):
        self.right = type("obj", (), {"value": value})

    def __or__(self, other):
        return ("OR", self, other)


class FakeColumn:
    def __eq__(self, other):
        return Expr(other)


# =========================
# MOCK MODEL
# =========================

class FakeUser:
    id = FakeColumn()
    username = FakeColumn()
    email = FakeColumn()

    def __init__(self, username, name, email, hashed_password, is_active=True):
        self.id = None
        self.username = username
        self.name = name
        self.email = email
        self.hashed_password = hashed_password
        self.is_active = is_active


main.models.User = FakeUser


# =========================
# MOCK DB
# =========================

fake_users = []


class FakeQuery:
    def __init__(self, data):
        self.data = data

    def filter(self, *args):
        if args:
            expr = args[0]

            if isinstance(expr, tuple) and expr[0] == "OR":
                val1 = expr[1].right.value
                val2 = expr[2].right.value
                self.data = [
                    u for u in self.data
                    if u.email == val1 or u.username == val2
                ]
            else:
                try:
                    value = expr.right.value
                    self.data = [
                        u for u in self.data
                        if u.id == value or u.username == value or u.email == value
                    ]
                except Exception:
                    pass

        return self

    def first(self):
        return self.data[0] if self.data else None

    def all(self):
        return self.data

    def offset(self, *args):
        return self

    def limit(self, *args):
        return self


class FakeDB:
    def query(self, model):
        return FakeQuery(fake_users)

    def add(self, obj):
        if obj.id is None:
            obj.id = len(fake_users) + 1
            fake_users.append(obj)

    def commit(self):
        pass

    def refresh(self, obj):
        pass


def override_get_db():
    yield FakeDB()


app.dependency_overrides[get_db] = override_get_db
app.dependency_overrides[get_current_user] = lambda: "admin"


# =========================
# MOCK PASSWORD
# =========================

def fake_verify_password(plain, hashed):
    return plain == "admin"


def fake_get_password_hash(password):
    return "fake_hashed_password"


main.verify_password = fake_verify_password
main.get_password_hash = fake_get_password_hash


# =========================
# CLIENT
# =========================

client = TestClient(app)


# =========================
# TESTES
# =========================

def test_create_user():
    fake_users.clear()

    res = client.post(
        "/users/",
        json={
            "username": "user1",
            "name": "User Test",
            "email": "user@test.com",
            "password": "123"
        },
        headers={"Authorization": "Bearer fake"}
    )

    assert res.status_code == 200


def test_create_user_duplicate():
    fake_users.clear()

    u = FakeUser("user1", "User", "user@test.com", "hash")
    u.id = 1
    fake_users.append(u)

    res = client.post(
        "/users/",
        json={
            "username": "user1",
            "name": "User Test",
            "email": "user@test.com",
            "password": "123"
        },
        headers={"Authorization": "Bearer fake"}
    )

    assert res.status_code == 400


def test_list_users():
    fake_users.clear()

    u = FakeUser("user1", "User", "user@test.com", "hash")
    u.id = 1
    fake_users.append(u)

    res = client.get(
        "/users/",
        headers={"Authorization": "Bearer fake"}
    )
    assert res.status_code == 200
    assert isinstance(res.json(), list)


def test_get_user():
    fake_users.clear()

    u = FakeUser("user1", "User", "user@test.com", "hash")
    u.id = 1
    fake_users.append(u)

    res = client.get(
        "/users/1",
        headers={"Authorization": "Bearer fake"}
    )
    assert res.status_code == 200


def test_get_user_not_found():
    fake_users.clear()

    res = client.get(
        "/users/999",
        headers={"Authorization": "Bearer fake"}
    )
    assert res.status_code == 404


def test_get_user_by_username():
    fake_users.clear()

    u = FakeUser("admin", "Admin", "admin@test.com", "hash")
    u.id = 1
    fake_users.append(u)

    res = client.get(
        "/users/by-username/admin",
        headers={"Authorization": "Bearer fake"}
    )
    assert res.status_code == 200


def test_login_success():
    fake_users.clear()

    u = FakeUser("admin", "Admin", "admin@test.com", "hash")
    u.id = 1
    fake_users.append(u)

    res = client.post(
        "/login",
        data={
            "username": "admin",
            "password": "admin"
        }
    )

    assert res.status_code == 200
    assert "access_token" in res.json()


def test_login_fail():
    fake_users.clear()

    u = FakeUser("admin", "Admin", "admin@test.com", "hash")
    u.id = 1
    fake_users.append(u)

    res = client.post(
        "/login",
        data={
            "username": "admin",
            "password": "wrong"
        }
    )

    assert res.status_code == 401


def test_users_unauthorized():
    app.dependency_overrides.pop(get_current_user, None)

    res = client.get("/users/")
    assert res.status_code == 401

    app.dependency_overrides[get_current_user] = lambda: "admin"