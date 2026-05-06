from fastapi import APIRouter, Depends
from app.db.mongodb import db
from app.api import deps
from typing import Any

router = APIRouter()

@router.get("/stats")
async def get_admin_stats(
    current_admin: Any = Depends(deps.get_current_active_admin)
) -> Any:
    """
    Get summary statistics for the admin dashboard.
    """
    total_sales_cursor = db.db.orders.aggregate([
        {"$match": {"status": {"$ne": "Cancelled"}}},
        {"$group": {"_id": None, "total": {"$sum": "$total"}, "count": {"$sum": 1}}}
    ])
    sales_stats = await total_sales_cursor.to_list(length=1)
    
    pending_orders_count = await db.db.orders.count_documents({"status": "Order Received"})
    total_products_count = await db.db.products.count_documents({})
    low_stock_products_count = await db.db.products.count_documents({"stock": {"$lt": 5}})

    return {
        "total_revenue": sales_stats[0]["total"] if sales_stats else 0,
        "total_orders": sales_stats[0]["count"] if sales_stats else 0,
        "pending_orders": pending_orders_count,
        "total_products": total_products_count,
        "low_stock_alerts": low_stock_products_count
    }
