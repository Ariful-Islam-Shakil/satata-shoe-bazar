from pydantic import BaseModel, Field, conint
from typing import Optional, List
from datetime import datetime

class ReviewBase(BaseModel):
    product_id: str
    rating: conint(ge=1, le=5)
    comment: str

class ReviewCreate(ReviewBase):
    pass

class ReviewReply(BaseModel):
    reply_text: str

class Review(ReviewBase):
    id: str = Field(alias="_id")
    user_email: str
    user_name: str
    admin_reply: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
