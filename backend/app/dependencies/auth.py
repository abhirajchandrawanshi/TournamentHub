from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth as firebase_auth
from sqlalchemy.orm import Session
import uuid
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
    if credentials:
        try:
            token = credentials.credentials
            decoded_token = firebase_auth.verify_id_token(token)
            uid = decoded_token["uid"]
            email = decoded_token.get("email", f"{uid[:8]}@chessarena.ai")
            name = decoded_token.get("name", email.split("@")[0] if email else "Player")
            picture = decoded_token.get("picture")

            user = db.query(User).filter(User.id == uid).first()
            if not user:
                base_username = email.split("@")[0] if email else "player"
                username = base_username
                existing_uname = db.query(User).filter(User.username == username).first()
                if existing_uname:
                    username = f"{base_username}_{uuid.uuid4().hex[:4]}"

                user = User(
                    id=uid,
                    email=email,
                    name=name,
                    avatar=picture,
                    username=username
                )
                try:
                    db.add(user)
                    db.commit()
                    db.refresh(user)
                except Exception:
                    db.rollback()
                    user = db.query(User).filter(User.id == uid).first()

            if user:
                return user
        except Exception as e:
            db.rollback()
            print(f"Auth verification note: {e}")

    # Fallback to distinct guest user
    db.rollback()
    guest_id = f"guest-{uuid.uuid4().hex[:8]}"
    guest = User(
        id=guest_id,
        name=f"Guest_{guest_id[-4:]}",
        email=f"{guest_id}@chessarena.ai",
        username=guest_id,
        rating=1200
    )
    try:
        db.add(guest)
        db.commit()
        db.refresh(guest)
        return guest
    except Exception:
        db.rollback()

    existing = db.query(User).filter(User.id == "guest-player").first()
    if not existing:
        existing = User(
            id="guest-player",
            name="Guest Player",
            email="guest-player-sys@chessarena.ai",
            username="guest_player_sys",
            rating=1200
        )
        try:
            db.add(existing)
            db.commit()
            db.refresh(existing)
        except Exception:
            db.rollback()
            existing = db.query(User).filter(User.id == "guest-player").first()

    if existing:
        return existing

    return User(id="guest-fallback", name="Guest", email="guest@chessarena.ai", username="guest", rating=1200)