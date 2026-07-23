from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User

router = APIRouter(prefix="", tags=["leaderboard"])

@router.get("/leaderboard")
def get_leaderboard(db: Session = Depends(get_db)):
    top_users = db.query(User).order_by(User.rating.desc()).limit(10).all()
    
    result = []
    for idx, user in enumerate(top_users):
        result.append({
            "rank": idx + 1,
            "id": user.id,
            "name": user.name,
            "username": user.username,
            "rating": user.rating,
            "avatar": user.avatar,
            "title": "GM" if user.rating >= 2400 else "FM" if user.rating >= 2100 else None
        })
    return result