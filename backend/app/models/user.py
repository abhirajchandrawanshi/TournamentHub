from sqlalchemy import Column, String, Integer, Boolean, DateTime, func
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String(128), primary_key=True)  # Firebase UID (string representation)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(50), unique=True, nullable=True, index=True)
    avatar = Column(String(500), nullable=True)
    rating = Column(Integer, default=1200)       # ELO rating (default 1200)
    role = Column(String(20), default="player")  # 'player', 'organizer', 'admin'
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
