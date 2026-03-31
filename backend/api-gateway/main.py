from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from prometheus_fastapi_instrumentator import Instrumentator
from fastapi.middleware.cors import CORSMiddleware
import httpx
import os

app = FastAPI(title="API Gateway", version="1.0.0")
Instrumentator().instrument(app).expose(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

USERS_SERVICE_URL = os.getenv("USERS_SERVICE_URL", "http://users-service:8000")
ORDERS_SERVICE_URL = os.getenv("ORDERS_SERVICE_URL", "http://orders-service:8000")
CATALOG_SERVICE_URL = os.getenv("CATALOG_SERVICE_URL", "http://catalog-service:8000")
GATEWAY_TIMEOUT_SECONDS = float(os.getenv("GATEWAY_TIMEOUT_SECONDS", "35"))


def build_forward_headers(request: Request) -> dict:
    headers = {}
    auth = request.headers.get("authorization")
    correlation_id = request.headers.get("x-correlation-id")

    if auth:
        headers["Authorization"] = auth
    if correlation_id:
        headers["X-Correlation-ID"] = correlation_id

    return headers


async def forward_request(
    method: str,
    target_url: str,
    request: Request,
    body: dict | None = None,
    params: dict | None = None,
):
    headers = build_forward_headers(request)

    async with httpx.AsyncClient(timeout=GATEWAY_TIMEOUT_SECONDS) as client:
        response = await client.request(
            method=method,
            url=target_url,
            headers=headers,
            json=body,
            params=params,
        )

    try:
        content = response.json()
    except Exception:
        content = {"detail": response.text}

    return JSONResponse(status_code=response.status_code, content=content)


# =========================
# USERS
# =========================

@app.post("/api/login")
async def login(request: Request):
    form = await request.form()

    async with httpx.AsyncClient(timeout=GATEWAY_TIMEOUT_SECONDS) as client:
        response = await client.post(
            f"{USERS_SERVICE_URL}/login",
            data={
                "username": form.get("username"),
                "password": form.get("password"),
            },
        )

    try:
        content = response.json()
    except Exception:
        content = {"detail": response.text}

    return JSONResponse(status_code=response.status_code, content=content)


@app.post("/api/users/")
async def create_user(request: Request):
    body = await request.json()
    return await forward_request("POST", f"{USERS_SERVICE_URL}/users/", request, body=body)


@app.get("/api/users/")
async def list_users(request: Request):
    return await forward_request("GET", f"{USERS_SERVICE_URL}/users/", request)


@app.get("/api/users/{user_id}")
async def get_user(user_id: int, request: Request):
    return await forward_request("GET", f"{USERS_SERVICE_URL}/users/{user_id}", request)


@app.get("/api/users/by-username/{username}")
async def get_user_by_username(username: str, request: Request):
    return await forward_request("GET", f"{USERS_SERVICE_URL}/users/by-username/{username}", request)


# =========================
# CATALOG
# =========================

@app.get("/api/catalog/")
async def get_catalog(request: Request):
    return await forward_request("GET", f"{CATALOG_SERVICE_URL}/catalog/", request)


@app.post("/api/catalog/")
async def create_product(request: Request):
    body = await request.json()
    return await forward_request("POST", f"{CATALOG_SERVICE_URL}/catalog/", request, body=body)


@app.patch("/api/catalog/{product_id}")
async def update_product(product_id: int, request: Request):
    body = await request.json()
    return await forward_request("PATCH", f"{CATALOG_SERVICE_URL}/catalog/{product_id}", request, body=body)


@app.patch("/api/catalog/{product_id}/stock")
async def update_stock(product_id: int, request: Request):
    body = await request.json()
    return await forward_request("PATCH", f"{CATALOG_SERVICE_URL}/catalog/{product_id}/stock", request, body=body)


@app.delete("/api/catalog/{product_id}")
async def delete_product(product_id: int, request: Request):
    return await forward_request("DELETE", f"{CATALOG_SERVICE_URL}/catalog/{product_id}", request)


# =========================
# ORDERS
# =========================

@app.post("/api/orders/")
async def create_order(request: Request):
    body = await request.json()
    return await forward_request("POST", f"{ORDERS_SERVICE_URL}/orders/", request, body=body)


@app.get("/api/orders/")
async def list_orders(request: Request):
    params = dict(request.query_params)
    return await forward_request("GET", f"{ORDERS_SERVICE_URL}/orders/", request, params=params)


@app.get("/api/orders/{order_id}")
async def get_order(order_id: int, request: Request):
    return await forward_request("GET", f"{ORDERS_SERVICE_URL}/orders/{order_id}", request)

@app.get("/api/orders/{order_id}/ai-priority")
async def get_order_ai_priority(order_id: int, request: Request):
    return await forward_request("GET", f"{ORDERS_SERVICE_URL}/orders/{order_id}/ai-priority", request)


@app.patch("/api/orders/{order_id}/status")
async def update_order_status(order_id: int, request: Request):
    body = await request.json()
    return await forward_request("PATCH", f"{ORDERS_SERVICE_URL}/orders/{order_id}/status", request, body=body)


# =========================
# AGREGAÃ‡ÃƒO SIMPLES
# =========================

@app.get("/api/dashboard/summary")
async def dashboard_summary(request: Request):
    headers = build_forward_headers(request)

    async with httpx.AsyncClient(timeout=GATEWAY_TIMEOUT_SECONDS) as client:
        catalog_res = await client.get(f"{CATALOG_SERVICE_URL}/catalog/", headers=headers)
        users_res = await client.get(f"{USERS_SERVICE_URL}/users/", headers=headers)
        orders_res = await client.get(f"{ORDERS_SERVICE_URL}/orders/", headers=headers)

    if catalog_res.status_code != 200:
        raise HTTPException(status_code=502, detail="Erro ao consultar catÃ¡logo")
    if users_res.status_code != 200:
        raise HTTPException(status_code=502, detail="Erro ao consultar usuÃ¡rios")
    if orders_res.status_code != 200:
        raise HTTPException(status_code=502, detail="Erro ao consultar pedidos")

    catalog = catalog_res.json()
    users = users_res.json()
    orders = orders_res.json()

    return {
        "users_count": len(users),
        "orders_count": len(orders),
        "products_count": len(catalog),
        "recent_orders": orders[:5],
        "featured_products": catalog[:5],
    }


# =========================
# PADRONIZAÃ‡ÃƒO DE ERROS
# =========================

@app.exception_handler(httpx.RequestError)
async def httpx_request_error_handler(request: Request, exc: httpx.RequestError):
    return JSONResponse(
        status_code=502,
        content={
            "detail": "Erro de comunicaÃ§Ã£o com serviÃ§o interno",
            "service_error": str(exc),
        },
    )

@app.exception_handler(httpx.TimeoutException)
async def httpx_timeout_error_handler(request: Request, exc: httpx.TimeoutException):
    return JSONResponse(
        status_code=504,
        content={
            "detail": "Gateway timeout: o serviço interno demorou para responder",
            "service_error": str(exc),
        },
    )

