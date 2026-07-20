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
        # Verify the Firebase ID Token
        decoded_token = firebase_auth.verify_id_token(token)
        uid = decoded_token.get("uid")
        if not uid:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload: missing uid",
            )
        
        email = decoded_token.get("email")
        name = decoded_token.get("name", email.split("@")[0] if email else "User")
        picture = decoded_token.get("picture")

        # Query the user in our Supabase DB
        user = db.query(User).filter(User.id == uid).first()
        
        # If user does not exist in local database, sync it!
        if not user:
            # Generate a username candidate from email if possible
            base_username = email.split("@")[0] if email else f"user_{uid[:8]}"
            username = base_username
            
            # Simple check for unique username
            count = 1
            while db.query(User).filter(User.username == username).first() is not None:
                username = f"{base_username}_{count}"
                count += 1
                
            user = User(
                id=uid,
                email=email if email else f"noemail_{uid}@chessarena.com",
                name=name,
                avatar=picture,
                username=username,
                role="player",
                rating=1200,
                is_active=True
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

# Helper dependency to enforce roles
def require_role(allowed_roles: list[str]):
    def dependency(current_user: User = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this resource",
            )
        return current_user
    return dependency
