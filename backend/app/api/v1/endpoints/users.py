from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from app.db.mongodb import db
from app.schemas.user import User, UserUpdate
from app.api import deps
from bson import ObjectId
import os
import uuid
from datetime import datetime

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
    
    # Check if product is already in wishlist
    user_with_product = await db.db.users.find_one({
        "email": current_user.email,
        "wishlist": product_id
    })
    
    if user_with_product:
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
    
    # Get the final updated user
    updated_user_doc = await db.db.users.find_one({"email": current_user.email})
    updated_user_doc["_id"] = str(updated_user_doc["_id"])
    return updated_user_doc

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

@router.put("/me", response_model=User)
async def update_user_me(
    *,
    user_in: UserUpdate,
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Update own profile.
    """
    update_data = {k: v for k, v in user_in.model_dump().items() if v is not None}
    
    if "password" in update_data:
        from app.core import security
        update_data["password"] = security.get_password_hash(update_data["password"])
    
    # Clean up old photo if it's being replaced and was a custom upload
    if "image" in update_data and update_data["image"] != current_user.image:
        if current_user.image and current_user.image.startswith("/user_photos/"):
            old_path = os.path.join("../frontend/public", current_user.image.lstrip("/"))
            if os.path.exists(old_path):
                try:
                    os.remove(old_path)
                except Exception as e:
                    print(f"Failed to delete old photo: {e}")

    await db.db.users.update_one(
        {"email": current_user.email},
        {"$set": update_data}
    )
    
    updated_user = await db.db.users.find_one({"email": current_user.email})
    updated_user["_id"] = str(updated_user["_id"])
    return updated_user

@router.post("/upload-photo")
async def upload_user_photo(
    file: UploadFile = File(...),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Upload profile photo.
    """
    # Create directory if it doesn't exist
    upload_dir = "../frontend/public/user_photos"
    if not os.path.exists(upload_dir):
        os.makedirs(upload_dir)
    
    # Validate file type
    extension = file.filename.split(".")[-1].lower()
    if extension not in ["jpg", "jpeg", "png", "gif"]:
        raise HTTPException(status_code=400, detail="Invalid image format")
    
    # Generate unique filename
    filename = f"{uuid.uuid4()}.{extension}"
    file_path = os.path.join(upload_dir, filename)
    
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    # Return the relative URL
    return {"url": f"/user_photos/{filename}"}
