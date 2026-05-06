from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum

class OrderStatus(str, Enum):
    RECEIVED = "Order Received"
    PACKAGING = "Packaging"
    OUT_FOR_DELIVERY = "Out for Delivery"
    COMPLETED = "Completed"
    CANCELLED = "Cancelled"

class OrderItem(BaseModel):
    product_id: str
    name: str
    price: float
    quantity: int
    size: int
    image: Optional[str] = None

class ShippingAddress(BaseModel):
    full_name: str
    phone: str
    address: str
    city: str
    region: str  # "Dhaka" or "Outside Dhaka"

class OrderBase(BaseModel):
    items: List[OrderItem]
    shipping_address: ShippingAddress
    subtotal: float
    shipping_fee: float
    total: float

class OrderCreate(OrderBase):
    pass

class OrderUpdate(BaseModel):
    status: OrderStatus

class Order(OrderBase):
    id: str = Field(alias="_id")
    user_email: str
    status: OrderStatus = OrderStatus.RECEIVED
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
