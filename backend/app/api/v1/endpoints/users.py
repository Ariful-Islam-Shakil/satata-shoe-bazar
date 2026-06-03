from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from app.db.mongodb import db
from app.schemas.user import User, UserUpdate
from app.api import deps
from bson import ObjectId
import os
import uuid
from datetime import datetime
import cloudinary
import cloudinary.uploader
from app.core.config import settings

cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True
)

def extract_public_id(url: str) -> Optional[str]:
    """
    Extract the public ID from a Cloudinary URL.
    """
    if "res.cloudinary.com" not in url:
        return None
    try:
        parts = url.split("image/upload/")
        if len(parts) < 2:
            return None
        path = parts[1]
        path_segments = path.split("/")
        # Skip the version segment (e.g. v1780467853)
        if path_segments[0].startswith("v") and any(char.isdigit() for char in path_segments[0]):
            path_segments = path_segments[1:]
        public_id_with_ext = "/".join(path_segments)
        public_id = public_id_with_ext.rsplit(".", 1)[0]
        return public_id
    except Exception as e:
        print(f"Error extracting public_id: {e}")
        return None

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
        if current_user.image:
            public_id = extract_public_id(current_user.image)
            if public_id:
                try:
                    cloudinary.uploader.destroy(public_id)
                except Exception as e:
                    print(f"Failed to delete old photo from Cloudinary: {e}")
            elif current_user.image.startswith("/user_photos/"):
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
    # Validate file type
    extension = file.filename.split(".")[-1].lower()
    if extension not in ["jpg", "jpeg", "png", "gif", "webp"]:
        raise HTTPException(status_code=400, detail="Invalid image format")
    
    try:
        result = cloudinary.uploader.upload(
            file.file,
            folder="satata-shoe-bazar/users"
        )
        return {"url": result["secure_url"]}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload user photo to Cloudinary: {str(e)}"
        )
