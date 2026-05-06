from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from app.db.mongodb import db
from app.schemas.user import User, UserUpdate
from app.api import deps
from bson import ObjectId

router = APIRouter()

@router.post("/wishlist/toggle/{product_id}", response_model=User)
async def toggle_wishlist_item(
    product_id: str,
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Toggle a product in the user's wishlist.
    """
    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=400, detail="Invalid product ID")
    
    # Check if product exists
    product = await db.db.products.find_one({"_id": ObjectId(product_id)})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if product_id in current_user.wishlist:
        # Remove from wishlist
        await db.db.users.update_one(
            {"email": current_user.email},
            {"$pull": {"wishlist": product_id}}
        )
    else:
        # Add to wishlist
        await db.db.users.update_one(
            {"email": current_user.email},
            {"$addToSet": {"wishlist": product_id}}
        )
    
    updated_user = await db.db.users.find_one({"email": current_user.email})
    updated_user["_id"] = str(updated_user["_id"])
    return updated_user

@router.get("/wishlist", response_model=List[Any])
async def get_wishlist_items(
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Get all products in the user's wishlist.
    """
    product_ids = [ObjectId(pid) for pid in current_user.wishlist if ObjectId.is_valid(pid)]
    if not product_ids:
        return []
        
    products_cursor = db.db.products.find({"_id": {"$in": product_ids}})
    products = await products_cursor.to_list(length=100)
    
    for p in products:
        p["_id"] = str(p["_id"])
        
    return products
