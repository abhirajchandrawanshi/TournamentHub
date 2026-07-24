from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth as firebase_auth
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User

security = HTTPBearer()
security_optional = HTTPBearer(auto_error=False)

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials
    try:
        # Decode and verify token using Firebase
        decoded_token = firebase_auth.verify_id_token(token)
        uid = decoded_token["uid"]
        email = decoded_token.get("email")
        name = decoded_token.get("name", "User")
        picture = decoded_token.get("picture")

        # Check if user exists in database, else register/sync
        user = db.query(User).filter(User.id == uid).first()
        if not user:
            user = User(
                id=uid,
                email=email,
                name=name,
                avatar=picture,
                username=email.split("@")[0] if email else None
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        return user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_optional_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_optional),
    db: Session = Depends(get_db)
):
    if not credentials:
        guest_id = "guest-player"
        guest = db.query(User).filter(User.id == guest_id).first()
        if not guest:
            guest = User(
                id=guest_id,
                name="Guest Player",
                email="guest@chessarena.ai",
                username="guest_player",
                rating=1200
            )
            db.add(guest)
            db.commit()
            db.refresh(guest)
        return guest

    try:
        token = credentials.credentials
        decoded_token = firebase_auth.verify_id_token(token)
        uid = decoded_token["uid"]
        email = decoded_token.get("email", "player@chessarena.ai")
        name = decoded_token.get("name", email.split("@")[0] if email else "Player")
        picture = decoded_token.get("picture")

        user = db.query(User).filter(User.id == uid).first()
        if not user:
            user = User(
                id=uid,
                email=email,
                name=name,
                avatar=picture,
                username=email.split("@")[0] if email else "player"
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        return user
    except Exception:
        guest_id = "guest-player"
        guest = db.query(User).filter(User.id == guest_id).first()
        if not guest:
            guest = User(
                id=guest_id,
                name="Guest Player",
                email="guest@chessarena.ai",
                username="guest_player",
                rating=1200
            )
            db.add(guest)
            db.commit()
            db.refresh(guest)
        return guest