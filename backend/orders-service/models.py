from sqlalchemy import Column, Integer, String, DateTime
from database import Base
import datetime

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    product_name = Column(String, index=True)
    quantity = Column(Integer, default=1)
    status = Column(String, default="PENDING")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
