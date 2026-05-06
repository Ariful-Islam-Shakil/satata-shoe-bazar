from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class ProductBase(BaseModel):
    name: str
    description: str
    price: float
    brand: str
    category: str
    sizes: List[int]
    colors: List[str]
    stock: int = 0
    images: List[str] = []

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    brand: Optional[str] = None
    category: Optional[str] = None
    sizes: Optional[List[int]] = None
    colors: Optional[List[str]] = None
    stock: Optional[int] = None
    images: Optional[List[str]] = None

class Product(ProductBase):
    id: str = Field(alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "name": "Classic Leather Sneaker",
                "description": "Premium leather sneakers for everyday wear.",
                "price": 4500.0,
                "brand": "Apex",
                "category": "Sneakers",
                "sizes": [40, 41, 42, 43],
                "colors": ["Black", "Brown"],
                "stock": 50,
                "images": ["https://example.com/image1.jpg"]
            }
        }
