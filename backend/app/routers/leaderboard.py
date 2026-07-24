from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User

router = APIRouter(prefix="", tags=["leaderboard"])

@router.get("/leaderboard")
def get_leaderboard(db: Session = Depends(get_db)):
    count = db.query(User).count()
    if count < 4:
        # Seed standard leaderboard players into DB
        seed_users = [
            User(id="gm-arjun", name="GM Arjun Mehta", email="arjun@chessarena.ai", username="GM_Arjun_Mehta", rating=2891, role="player"),
            User(id="rook-runner", name="Rook Runner", email="rook@chessarena.ai", username="rook_runner", rating=2810, role="player"),
            User(id="queenside-pawn", name="Queenside Pawn", email="pawn@chessarena.ai", username="queenside_pawn", rating=2764, role="player"),
            User(id="im-kavya", name="IM Kavya Singh", email="kavya@chessarena.ai", username="IM_Kavya92", rating=2701, role="player"),
        ]
        for u in seed_users:
            if not db.query(User).filter(User.id == u.id).first():
                db.add(u)
        db.commit()

    top_users = db.query(User).order_by(User.rating.desc()).limit(15).all()
    
    result = []
    for idx, user in enumerate(top_users):
        result.append({
            "rank": idx + 1,
            "id": user.id,
            "name": user.name,
            "username": user.username or user.name,
            "rating": user.rating,
            "avatar": user.avatar,
            "title": "GM" if user.rating >= 2800 else "IM" if user.rating >= 2500 else "FM" if user.rating >= 2300 else None
        })
    return result