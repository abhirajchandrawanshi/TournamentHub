from fastapi import APIRouter, Depends
from app.dependencies.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["auth"])

@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return {
        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email,
            "avatar": current_user.avatar,
            "username": current_user.username,
            "rating": current_user.rating,
            "role": current_user.role
        }
    }