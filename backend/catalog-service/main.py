from fastapi import FastAPI, Depends, HTTPException
from prometheus_fastapi_instrumentator import Instrumentator
import logging
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import get_db, Base, engine, SessionLocal
import models, schemas
import os
import json
import redis
from observability import setup_logging, CorrelationIdMiddleware
import jwt
from fastapi.security import OAuth2PasswordBearer


# Configura logs estruturados
setup_logging()
SECRET_KEY = os.getenv("JWT_SECRET", "351656f50b44558e805567c293708dfd919a27c00681b95ec3df16e25605d8f2")
ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="http://localhost:8001/login")

def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return username
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

Base.metadata.create_all(bind=engine)

redis_host = os.getenv("REDIS_HOST", "localhost")
redis_port = int(os.getenv("REDIS_PORT", 6379))

redis_client = redis.Redis(host=redis_host, port=redis_port, decode_responses=True)

def seed_catalog():
    db = SessionLocal()
    try:
        # Relational PostgreSQL DB Seeding
        if db.query(models.Product).count() == 0:
            db.add_all([
                models.Product(name="Teclado Mecânico", price=150.0),
                models.Product(name="Monitor 27 Polegadas", price=800.0),
                models.Product(name="Mouse Gamer Sem Fio", price=120.0),
                models.Product(name="Cadeira Ergonômica", price=600.0),
                models.Product(name="Headset 7.1 Surround", price=250.0)
            ])
            db.commit()
            
        # Redis Cache Seeding
        products = db.query(models.Product).all()
        catalog = [{"id": p.id, "name": p.name, "price": p.price, "description": p.description, "stock": p.stock} for p in products]
        redis_client.set("catalog", json.dumps(catalog))
    except Exception as e:
        print(f"Error seeding catalog: {e}")
    finally:
        db.close()

seed_catalog()

app = FastAPI(title="Catalog Service", version="1.0.0")
Instrumentator().instrument(app).expose(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(CorrelationIdMiddleware)

@app.get("/catalog/", response_model=list[schemas.ProductResponse])
def get_catalog(current_user: str = Depends(get_current_user),db: Session = Depends(get_db)):
    # 1. Fallback pattern: Try Redis first
    try:
        cached_catalog = redis_client.get("catalog")
        if cached_catalog:
            return json.loads(cached_catalog)
    except redis.RedisError:
        pass 
        
    # 2. Fallback to Postgres if Redis fails or is empty
    products = db.query(models.Product).all()
    
    # 3. Update Redis cache if possible
    try:
        catalog = [{"id": p.id, "name": p.name, "price": p.price, "description": p.description, "stock": p.stock} for p in products]
        redis_client.set("catalog", json.dumps(catalog))
    except redis.RedisError:
        pass 
        
    return products

@app.post("/catalog/", response_model=schemas.ProductResponse)
def create_product(product: schemas.ProductCreate, current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    new_product = models.Product(**product.model_dump())
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    # Invalida o cache
    try:
        redis_client.delete("catalog")
    except redis.RedisError:
        pass
    return new_product

@app.delete("/catalog/{product_id}")
def delete_product(product_id: int, current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    db.commit()
    # Invalida o cache
    try:
        redis_client.delete("catalog")
    except redis.RedisError:
        pass
    return {"detail": "Product deleted"}

@app.patch("/catalog/{product_id}", response_model=schemas.ProductResponse)
def update_product(product_id: int, product_update: schemas.ProductUpdate, current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_data = product_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(product, key, value)
    
    db.commit()
    db.refresh(product)
    
    # Invalida o cache
    try:
        redis_client.delete("catalog")
    except redis.RedisError:
        pass
        
    return product

@app.patch("/catalog/{product_id}/stock", response_model=schemas.ProductResponse)
def update_stock(product_id: int, stock_update: schemas.ProductStockUpdate, current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    logging.info(f"🏬 Atualizando estoque do produto {product_id}. Delta: {stock_update.quantity_delta}")
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Valida se o estoque ficaria negativo
    if product.stock + stock_update.quantity_delta < 0:
        raise HTTPException(status_code=400, detail="Insufficient stock")
    
    product.stock += stock_update.quantity_delta
    db.commit()
    db.refresh(product)
    
    # Invalida o cache
    try:
        redis_client.delete("catalog")
    except redis.RedisError:
        pass
        
    return product
