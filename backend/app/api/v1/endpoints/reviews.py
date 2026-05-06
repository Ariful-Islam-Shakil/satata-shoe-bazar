from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from app.db.mongodb import db
from app.schemas.review import Review, ReviewCreate, ReviewReply
from app.api import deps
from bson import ObjectId
from datetime import datetime

router = APIRouter()

@router.post("/", response_model=Review, status_code=status.HTTP_201_CREATED)
async def create_review(
    *,
    review_in: ReviewCreate,
    current_user: Any = Depends(deps.get_current_user)
) -> Any:
    """
    Submit a product review. Only allowed for users who have completed an order for the product.
    """
    # 1. Check if user has a completed order for this product
    order = await db.db.orders.find_one({
        "user_email": current_user.email,
        "status": "Completed",
        "items.product_id": review_in.product_id
    })
    
    if not order:
        raise HTTPException(
            status_code=403, 
            detail="You can only review products you have successfully purchased and received."
        )
    
    # 2. Check if user already reviewed this product
    existing_review = await db.db.reviews.find_one({
        "user_email": current_user.email,
        "product_id": review_in.product_id
    })
    if existing_review:
        raise HTTPException(status_code=400, detail="You have already reviewed this product.")

    # 3. Create review
    review_dict = review_in.model_dump()
    review_dict["user_email"] = current_user.email
    review_dict["user_name"] = current_user.full_name or "Verified Buyer"
    review_dict["created_at"] = datetime.utcnow()
    review_dict["updated_at"] = datetime.utcnow()
    
    new_review = await db.db.reviews.insert_one(review_dict)
    created_review = await db.db.reviews.find_one({"_id": new_review.inserted_id})
    created_review["_id"] = str(created_review["_id"])
    return created_review

@router.get("/product/{product_id}", response_model=List[Review])
async def get_product_reviews(product_id: str) -> Any:
    """
    Get all reviews for a specific product.
    """
    reviews_cursor = db.db.reviews.find({"product_id": product_id}).sort("created_at", -1)
    reviews = await reviews_cursor.to_list(length=100)
    for r in reviews:
        r["_id"] = str(r["_id"])
    return reviews

@router.get("/all", response_model=List[Review])
async def get_all_reviews(
    current_admin: Any = Depends(deps.get_current_active_admin)
) -> Any:
    """
    Get all reviews (Admin only).
    """
    reviews_cursor = db.db.reviews.find().sort("created_at", -1)
    reviews = await reviews_cursor.to_list(length=1000)
    for r in reviews:
        r["_id"] = str(r["_id"])
    return reviews

@router.post("/{id}/reply", response_model=Review)
async def reply_to_review(
    *,
    id: str,
    reply_in: ReviewReply,
    current_admin: Any = Depends(deps.get_current_active_admin)
) -> Any:
    """
    Admin reply to a review.
    """
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid review ID")
        
    updated_review = await db.db.reviews.find_one_and_update(
        {"_id": ObjectId(id)},
        {"$set": {"admin_reply": reply_in.reply_text, "updated_at": datetime.utcnow()}},
        return_document=True
    )
    
    if not updated_review:
        raise HTTPException(status_code=404, detail="Review not found")
        
    updated_review["_id"] = str(updated_review["_id"])
    return updated_review
