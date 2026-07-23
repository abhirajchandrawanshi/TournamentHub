from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database import Base

class Tournament(Base):
    __tablename__ = "tournaments"

    id = Column(String(128), primary_key=True)  # slug or UUID
    name = Column(String(200), nullable=False)
    clock = Column(String(50), nullable=False)   # e.g. "3+0", "10+0"
    type = Column(String(50), nullable=False)    # "Arena" or "Swiss"
    status = Column(String(50), default="created")  # "created", "active", "completed"
    creator_id = Column(String(128), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=func.now())

    # Relationships
    creator = relationship("User", foreign_keys=[creator_id])
    participants = relationship("TournamentParticipant", back_populates="tournament", cascade="all, delete-orphan")

class TournamentParticipant(Base):
    __tablename__ = "tournament_participants"

    id = Column(Integer, primary_key=True, autoincrement=True)
    tournament_id = Column(String(128), ForeignKey("tournaments.id"), nullable=False)
    user_id = Column(String(128), ForeignKey("users.id"), nullable=False)
    joined_at = Column(DateTime, default=func.now())

    # Relationships
    tournament = relationship("Tournament", back_populates="participants")
    user = relationship("User", foreign_keys=[user_id])