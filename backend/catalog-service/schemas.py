from pydantic import BaseModel

class ProductBase(BaseModel):
    name: str
    price: float
    description: str | None = None
    stock: int = 0

class ProductCreate(ProductBase):
    pass

class ProductStockUpdate(BaseModel):
    quantity_delta: int # Pode ser negativo para baixar ou positivo para repor

class ProductResponse(ProductBase):
    id: int
    
    class Config:
        from_attributes = True
