from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.game import Game

router = APIRouter(tags=["auth"])

@router.get("/auth/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return {
        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email,
            "avatar": current_user.avatar,
            "username": current_user.username,
            "rating": current_user.rating,
            "role": current_user.role,
            "created_at": current_user.created_at
        }
    }

@router.put("/auth/me")
async def update_me(
    payload: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    name = payload.get("name")
    username = payload.get("username")
    avatar = payload.get("avatar")

    if username and username != current_user.username:
        existing = db.query(User).filter(User.username == username, User.id != current_user.id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Username is already taken")
        current_user.username = username

    if name:
        current_user.name = name
    if avatar is not None:
        current_user.avatar = avatar

    db.commit()
    db.refresh(current_user)

    return {
        "message": "Profile updated successfully",
        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email,
            "avatar": current_user.avatar,
            "username": current_user.username,
            "rating": current_user.rating,
            "role": current_user.role,
            "created_at": current_user.created_at
        }
    }

@router.get("/users/{username}")
async def get_user_profile(username: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        or_(User.username == username, User.name == username, User.id == username)
    ).first()

    if not user:
        # Fallback profile response
        return {
            "id": "guest",
            "name": username,
            "username": username,
            "rating": 1200,
            "avatar": None,
            "created_at": None,
            "recent_games": []
        }

    # Fetch recent games
    games = db.query(Game).filter(
        or_(Game.white_player_id == user.id, Game.black_player_id == user.id)
    ).order_by(Game.created_at.desc()).limit(10).all()

    recent_games = []
    for g in games:
        is_white = g.white_player_id == user.id
        opponent = g.black_player.name if is_white and g.black_player else (g.white_player.name if g.white_player else "Opponent")
        
        result = "Draw"
        if g.status == "white_won":
            result = "Won" if is_white else "Lost"
        elif g.status == "black_won":
            result = "Lost" if is_white else "Won"

        move_count = len(g.moves.split(",")) if g.moves else 0

        recent_games.append({
            "id": g.id,
            "opponent": opponent,
            "result": result,
            "mode": f"Blitz {g.clock_control}",
            "moves": move_count,
            "created_at": g.created_at
        })

    return {
        "id": user.id,
        "name": user.name,
        "username": user.username or user.name,
        "rating": user.rating,
        "avatar": user.avatar,
        "created_at": user.created_at,
        "recent_games": recent_games
    }