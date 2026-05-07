from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from app.db.mongodb import db
from app.schemas.order import Order, OrderCreate, OrderUpdate, OrderStatus
from app.api import deps
from bson import ObjectId
from datetime import datetime

router = APIRouter()

@router.post("/", response_model=Order, status_code=status.HTTP_201_CREATED)
async def create_order(
    *,
    order_in: OrderCreate,
    current_user: Any = Depends(deps.get_current_user)
) -> Any:
    """
    Place a new order.
    """
    # 1. Validate stock and decrement
    for item in order_in.items:
        if not ObjectId.is_valid(item.product_id):
            raise HTTPException(status_code=400, detail=f"Invalid product ID: {item.product_id}")
            
        product = await db.db.products.find_one({"_id": ObjectId(item.product_id)})
        if not product:
            raise HTTPException(status_code=404, detail=f"Product not found: {item.name}")
            
        if product["stock"] < item.quantity:
            raise HTTPException(
                status_code=400, 
                detail=f"Insufficient stock for {item.name}. Available: {product['stock']}"
            )

    # 2. Start a transaction-like update for stock
    # Note: In a real production app, use MongoDB transactions
    for item in order_in.items:
        await db.db.products.update_one(
            {"_id": ObjectId(item.product_id)},
            {"$inc": {"stock": -item.quantity}}
        )

    # 3. Create order
    order_dict = order_in.model_dump()
    order_dict["user_email"] = current_user.email
    order_dict["status"] = OrderStatus.RECEIVED
    order_dict["created_at"] = datetime.utcnow()
    order_dict["updated_at"] = datetime.utcnow()
    
    new_order = await db.db.orders.insert_one(order_dict)
    created_order = await db.db.orders.find_one({"_id": new_order.inserted_id})
    created_order["_id"] = str(created_order["_id"])
    return created_order

@router.get("/my-orders", response_model=List[Order])
async def get_my_orders(
    current_user: Any = Depends(deps.get_current_user)
) -> Any:
    """
    Retrieve orders for the current user.
    """
    orders_cursor = db.db.orders.find({"user_email": current_user.email}).sort("created_at", -1)
    orders = await orders_cursor.to_list(length=100)
    for o in orders:
        o["_id"] = str(o["_id"])
    return orders

@router.get("/all", response_model=List[Order])
async def get_all_orders(
    current_admin: Any = Depends(deps.get_current_active_admin)
) -> Any:
    """
    Retrieve all orders (Admin only).
    """
    orders_cursor = db.db.orders.find().sort("created_at", -1)
    orders = await orders_cursor.to_list(length=1000)
    for o in orders:
        o["_id"] = str(o["_id"])
    return orders

@router.get("/{id}", response_model=Order)
async def get_order(
    id: str,
    current_user: Any = Depends(deps.get_current_user)
) -> Any:
    """
    Get order by ID.
    """
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid order ID")
        
    order = await db.db.orders.find_one({"_id": ObjectId(id)})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Check if order belongs to user (or is admin)
    if order["user_email"] != current_user.email and (not hasattr(current_user, 'role') or current_user.role != "ADMIN"):
        raise HTTPException(status_code=403, detail="Not authorized to view this order")
        
    order["_id"] = str(order["_id"])
    return order

@router.patch("/{id}/status", response_model=Order)
async def update_order_status(
    *,
    id: str,
    status_in: OrderUpdate,
    current_admin: Any = Depends(deps.get_current_active_admin)
) -> Any:
    """
    Update order status (Admin only).
    """
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid order ID")
        
    order = await db.db.orders.find_one({"_id": ObjectId(id)})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Business Rule: No backward status movement
    # RECEIVED -> PACKAGING -> OUT_FOR_DELIVERY -> COMPLETED
    status_order = [OrderStatus.RECEIVED, OrderStatus.PACKAGING, OrderStatus.OUT_FOR_DELIVERY, OrderStatus.COMPLETED]
    current_idx = status_order.index(order["status"]) if order["status"] in status_order else -1
    new_idx = status_order.index(status_in.status) if status_in.status in status_order else -1
    
    if new_idx != -1 and new_idx < current_idx:
         raise HTTPException(status_code=400, detail="Cannot move order status backward")

    updated_order = await db.db.orders.find_one_and_update(
        {"_id": ObjectId(id)},
        {"$set": {"status": status_in.status, "updated_at": datetime.utcnow()}},
        return_document=True
    )
    
    updated_order["_id"] = str(updated_order["_id"])
    return updated_order
