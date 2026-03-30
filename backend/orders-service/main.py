from fastapi import FastAPI, Depends, HTTPException
from prometheus_fastapi_instrumentator import Instrumentator
import logging
import threading
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import get_db, Base, engine, SessionLocal
import models, schemas
import os
import requests
import jwt
from fastapi.security import OAuth2PasswordBearer
from observability import setup_logging, CorrelationIdMiddleware, get_correlation_id
from mq_publisher import publish_order_created
import contextvars

# Configura logs estruturados em JSON
setup_logging()

SECRET_KEY = os.getenv("JWT_SECRET", "351656f50b44558e805567c293708dfd919a27c00681b95ec3df16e25605d8f2")
ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="http://localhost:8001/login")

TESTING = os.getenv("TESTING", "false").lower() == "true"

def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return username
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

if not TESTING:
    Base.metadata.create_all(bind=engine)

def seed_db():
    db = SessionLocal()
    try:
        if db.query(models.Order).count() == 0:
            # Seed simplificado para o novo modelo
            order1 = models.Order(user_id=1, status="PENDENTE", total_price=250.0)
            db.add(order1)
            db.commit()
            db.refresh(order1)
            
            db.add(models.OrderItem(order_id=order1.id, product_id=1, quantity=1, unit_price=250.0))
            db.commit()
    finally:
        db.close()

if not TESTING:
    seed_db()

app = FastAPI(title="Orders Service", version="1.0.0")
Instrumentator().instrument(app).expose(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(CorrelationIdMiddleware)

USERS_SERVICE_URL = os.getenv("USERS_SERVICE_URL", "http://users-service:8000")
CATALOG_SERVICE_URL = os.getenv("CATALOG_SERVICE_URL", "http://catalog-service:8000")

@app.post("/orders/", response_model=schemas.OrderResponse)
def create_order(order: schemas.OrderCreate, token: str = Depends(oauth2_scheme), current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    logging.info(f"Carrinho recebido para processamento. Itens: {len(order.items)}")
    headers = {
        "Authorization": f"Bearer {token}",
        "X-Correlation-ID": get_correlation_id()
    }
    
    # 1. Valida Usuário no Users Service
    try:
        user_res = requests.get(f"{USERS_SERVICE_URL}/users/by-username/{current_user}",headers=headers)
        user_res.raise_for_status()
        user = user_res.json()
        user_id = user["id"]
    except requests.RequestException:
        raise HTTPException(status_code=500, detail="Não foi possível validar o usuário. Serviço de Usuários offline ou inacessível.")

    total_price = 0.0
    items_to_save = []
    items_reserved = [] # Rastreia itens que já tiveram estoque baixado

    # 2. Valida Produtos e Estoque no Catalog Service
    try:
        logging.info("Validando estoque e preços no catálogo...")
        cat_res = requests.get(f"{CATALOG_SERVICE_URL}/catalog/", headers=headers)
        cat_res.raise_for_status()
        catalog = {p["id"]: p for p in cat_res.json()}

        for item in order.items:
            if item.product_id not in catalog:
                raise HTTPException(status_code=400, detail=f"Product {item.product_id} not found")
            
            product = catalog[item.product_id]
            if product["stock"] < item.quantity:
                raise HTTPException(status_code=400, detail=f"Estoque insuficiente para {product['name']}")

            # Validação de Preço: Se o preço mudou enquanto o item estava no carrinho
            if abs(product["price"] - item.price) > 0.01:
                raise HTTPException(
                    status_code=400, 
                    detail=f"O preço do item '{product['name']}' mudou de R${item.price} para R${product['price']}. Por favor, revise seu carrinho."
                )

            # 3. Baixa o Estoque (Reserva temporária)
            stock_res = requests.patch(
                f"{CATALOG_SERVICE_URL}/catalog/{item.product_id}/stock",
                json={"quantity_delta": -item.quantity},
                headers=headers
            )
            stock_res.raise_for_status()
            # Se chegou aqui, o estoque foi baixado. Adicionamos à lista para possível rollback.
            items_reserved.append(item)

            unit_price = product["price"]
            total_price += unit_price * item.quantity
            items_to_save.append(models.OrderItem(
                product_id=item.product_id,
                quantity=item.quantity,
                unit_price=unit_price
            ))

        # 4. Persiste o Pedido
        logging.info("Persistindo pedido no banco de dados...")
        db_order = models.Order(user_id=user_id, total_price=total_price)
        db.add(db_order)
        db.commit()
        db.refresh(db_order)

        for oi in items_to_save:
            oi.order_id = db_order.id
            db.add(oi)
        
        db.commit()
        db.refresh(db_order)

        # 5. Publica evento assíncrono para o notification-service via RabbitMQ
        event_data = {
            "order_id": db_order.id,
            "user_id": user_id,
            "username": current_user,
            "total_price": total_price,
            "items": [
                {
                    "product_id": oi.product_id,
                    "product_name": catalog[oi.product_id]["name"],
                    "quantity": oi.quantity,
                    "unit_price": oi.unit_price
                }
                for oi in items_to_save
            ]
        }
        # Publica em thread separada para não bloquear a resposta ao cliente
        ctx = contextvars.copy_context()

        threading.Thread(
            target=lambda: ctx.run(publish_order_created, event_data, headers),
            daemon=True
        ).start()

        return db_order

    except Exception as e:
        # 5. COMPENSAÇÃO (Rollback de Estoque)
        if items_reserved:
            logging.warning(f"Erro ao criar pedido (Erro: {str(e)}). Iniciando reversão de estoque para {len(items_reserved)} itens...")
            for item in items_reserved:
                try:
                    # Devolve o estoque enviando delta positivo
                    requests.patch(
                        f"{CATALOG_SERVICE_URL}/catalog/{item.product_id}/stock",
                        json={"quantity_delta": item.quantity},
                        headers=headers
                    )
                    logging.info(f"Estoque do produto {item.product_id} revertido com sucesso.")
                except Exception as re:
                    logging.error(f"FALHA CRÍTICA: Não foi possível reverter estoque do produto {item.product_id}: {re}")
        
        # Propaga o erro original
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Erro interno ao processar pedido: {str(e)}")

@app.get("/orders/", response_model=list[schemas.OrderResponse])
def list_orders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    orders = db.query(models.Order).order_by(models.Order.id.desc()).offset(skip).limit(limit).all()
    return orders

@app.get("/orders/{order_id}", response_model=schemas.OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    return order

@app.patch("/orders/{order_id}/status", response_model=schemas.OrderResponse)
def update_order_status(order_id: int, status_update: schemas.OrderUpdateStatus, current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    order.status = status_update.status
    logging.info(f"Alterando status do pedido {order_id} para: {order.status}")
    db.commit()
    db.refresh(order)
    return order

