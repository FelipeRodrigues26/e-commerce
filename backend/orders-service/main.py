from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import get_db, Base, engine, SessionLocal
import models, schemas
import os
import requests

Base.metadata.create_all(bind=engine)

def seed_db():
    db = SessionLocal()
    try:
        if db.query(models.Order).count() == 0:
            db.add_all([
                models.Order(user_id=1, product_name="Teclado Mecânico", quantity=1, status="PENDING"),
                models.Order(user_id=2, product_name="Monitor 27 Polegadas", quantity=2, status="SHIPPED"),
                models.Order(user_id=1, product_name="Mouse Gamer Sem Fio", quantity=1, status="DELIVERED"),
                models.Order(user_id=3, product_name="Cadeira Ergonômica", quantity=1, status="PENDING"),
                models.Order(user_id=2, product_name="Headset 7.1 Surround", quantity=1, status="SHIPPED")
            ])
            db.commit()
    finally:
        db.close()

seed_db()

app = FastAPI(title="Orders Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

USERS_SERVICE_URL = os.getenv("USERS_SERVICE_URL", "http://users-service:8000")

@app.post("/orders/", response_model=schemas.OrderResponse)
def create_order(order: schemas.OrderCreate, db: Session = Depends(get_db)):
    db_order = models.Order(**order.model_dump())
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order

@app.get("/orders/", response_model=list[schemas.OrderResponse])
def list_orders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    orders = db.query(models.Order).offset(skip).limit(limit).all()
    return orders

@app.get("/orders/{order_id}", response_model=schemas.OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@app.patch("/orders/{order_id}/status", response_model=schemas.OrderResponse)
def update_order_status(order_id: int, status_update: schemas.OrderUpdateStatus, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = status_update.status
    db.commit()
    db.refresh(order)
    return order

