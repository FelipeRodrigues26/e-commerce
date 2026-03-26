from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
import datetime

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    status = Column(String, default="PENDENTE")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    total_price = Column(Float, default=0.0)
    
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    product_id = Column(Integer) # ID do produto no Catalog Service
    quantity = Column(Integer, default=1)
    unit_price = Column(Float) # Preço capturado no momento da venda

    order = relationship("Order", back_populates="items")
