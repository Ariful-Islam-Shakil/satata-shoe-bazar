from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status, File, UploadFile, Form
from app.db.mongodb import db
from app.schemas.product import Product, ProductCreate, ProductUpdate
from app.api import deps
from bson import ObjectId
from datetime import datetime
import os
import uuid
import json
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

@router.get("/", response_model=List[Product])
async def get_products(
    skip: int = 0,
    limit: int = 100,
    brand: Optional[str] = None,
    category: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    search: Optional[str] = None
) -> Any:
    """
    Retrieve products with filters.
    """
    query = {}
    if brand:
        query["brand"] = brand
    if category:
        query["category"] = category
    if min_price is not None or max_price is not None:
        query["price"] = {}
        if min_price is not None:
            query["price"]["$gte"] = min_price
        if max_price is not None:
            query["price"]["$lte"] = max_price
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"brand": {"$regex": search, "$options": "i"}}
        ]

    products_cursor = db.db.products.find(query).skip(skip).limit(limit)
    products = await products_cursor.to_list(length=limit)
    
    for p in products:
        p["_id"] = str(p["_id"])
    
    return products

@router.get("/{id}", response_model=Product)
async def get_product(id: str) -> Any:
    """
    Get product by ID.
    """
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid product ID")
        
    product = await db.db.products.find_one({"_id": ObjectId(id)})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product["_id"] = str(product["_id"])
    return product

@router.post("/", response_model=Product, status_code=status.HTTP_201_CREATED)
async def create_product(
    *,
    name: str = Form(...),
    description: str = Form(...),
    price: float = Form(...),
    brand: str = Form(...),
    category: str = Form(...),
    sizes: str = Form(...), # Comma separated
    colors: str = Form(...), # Comma separated
    stock: int = Form(...),
    files: List[UploadFile] = File(...),
    current_admin: Any = Depends(deps.get_current_active_admin)
) -> Any:
    """
    Create new product (Admin only).
    """
    # Save images to Cloudinary
    image_urls = []
    for file in files:
        extension = file.filename.split(".")[-1].lower()
        if extension not in ["jpg", "jpeg", "png", "gif", "webp"]:
            continue
        
        try:
            result = cloudinary.uploader.upload(
                file.file,
                folder="satata-shoe-bazar/products"
            )
            image_urls.append(result["secure_url"])
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to upload image {file.filename} to Cloudinary: {str(e)}"
            )

    product_dict = {
        "name": name,
        "description": description,
        "price": price,
        "brand": brand,
        "category": category,
        "sizes": [int(s.strip()) for s in sizes.split(",") if s.strip()],
        "colors": [c.strip() for c in colors.split(",") if c.strip()],
        "stock": stock,
        "images": image_urls,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    new_product = await db.db.products.insert_one(product_dict)
    created_product = await db.db.products.find_one({"_id": new_product.inserted_id})
    created_product["_id"] = str(created_product["_id"])
    return created_product

@router.put("/{id}", response_model=Product)
async def update_product(
    *,
    id: str,
    product_in: ProductUpdate,
    current_admin: Any = Depends(deps.get_current_active_admin)
) -> Any:
    """
    Update a product (Admin only).
    """
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid product ID")
        
    update_data = {k: v for k, v in product_in.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    updated_product = await db.db.products.find_one_and_update(
        {"_id": ObjectId(id)},
        {"$set": update_data},
        return_document=True
    )
    
    if not updated_product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    updated_product["_id"] = str(updated_product["_id"])
    return updated_product

@router.delete("/{id}", response_model=Product)
async def delete_product(
    *,
    id: str,
    current_admin: Any = Depends(deps.get_current_active_admin)
) -> Any:
    """
    Delete a product (Admin only).
    """
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid product ID")
        
    deleted_product = await db.db.products.find_one_and_delete({"_id": ObjectId(id)})
    
    if not deleted_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Delete images from Cloudinary or filesystem
    if "images" in deleted_product:
        for img_url in deleted_product["images"]:
            public_id = extract_public_id(img_url)
            if public_id:
                try:
                    cloudinary.uploader.destroy(public_id)
                except Exception as e:
                    print(f"Failed to delete photo {img_url} from Cloudinary: {e}")
            elif img_url.startswith("/photos/"):
                file_path = os.path.join("../frontend/public", img_url.lstrip("/"))
                if os.path.exists(file_path):
                    try:
                        os.remove(file_path)
                    except Exception as e:
                        print(f"Failed to delete local photo {file_path}: {e}")
        
    deleted_product["_id"] = str(deleted_product["_id"])
    return deleted_product
