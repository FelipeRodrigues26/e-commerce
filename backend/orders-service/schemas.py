from pydantic import BaseModel
from datetime import datetime

class OrderBase(BaseModel):
    user_id: int
    product_name: str
    quantity: int

class OrderCreate(OrderBase):
    pass

class OrderUpdateStatus(BaseModel):
    status: str

class OrderResponse(OrderBase):
    id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
