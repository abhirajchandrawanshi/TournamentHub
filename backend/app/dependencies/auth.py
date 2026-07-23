from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth as firebase_auth
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User

security = HTTPBearer()

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