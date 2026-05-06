from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from app.core import security
from app.core.config import settings
from app.db.mongodb import db
from app.schemas.user import User, UserCreate, Token
from app.api import deps

router = APIRouter()

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user = await db.db.users.find_one({"email": form_data.username})
    if not user or not security.verify_password(form_data.password, user["password"]):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user["email"], role=user["role"], expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

@router.post("/register", response_model=User)
async def register(user_in: UserCreate) -> Any:
    """
    Create new user.
    """
    user = await db.db.users.find_one({"email": user_in.email})
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    
    user_dict = user_in.model_dump()
    user_dict["password"] = security.get_password_hash(user_in.password)
    
    new_user = await db.db.users.insert_one(user_dict)
    created_user = await db.db.users.find_one({"_id": new_user.inserted_id})
    created_user["_id"] = str(created_user["_id"])
    return created_user

@router.get("/me", response_model=User)
async def read_user_me(current_user: User = Depends(deps.get_current_user)) -> Any:
    """
    Get current user.
    """
    return current_user
