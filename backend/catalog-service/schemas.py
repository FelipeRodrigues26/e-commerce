from pydantic import BaseModel
from typing import Optional

class ProductBase(BaseModel):
    name: str
    price: float
    description: str | None = None
    stock: int = 0

class ProductCreate(ProductBase):
    pass

class ProductStockUpdate(BaseModel):
    quantity_delta: int # Pode ser negativo para baixar ou positivo para repor

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    description: Optional[str] = None
    stock: Optional[int] = None

class ProductResponse(ProductBase):
    id: int
    
    class Config:
        from_attributes = True
