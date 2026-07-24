from sqlalchemy import Column, String, DateTime, ForeignKey, func, Text
from sqlalchemy.orm import relationship
from app.database import Base

class Game(Base):
    __tablename__ = "games"

    id = Column(String(128), primary_key=True)  # UUID or custom ID
    tournament_id = Column(String(128), ForeignKey("tournaments.id"), nullable=True)
    white_player_id = Column(String(128), ForeignKey("users.id"), nullable=False)
    black_player_id = Column(String(128), ForeignKey("users.id"), nullable=False)
    clock_control = Column(String(50), nullable=False)  # e.g., "5+3"
    fen = Column(String(255), default="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
    moves = Column(Text, default="")  # Comma-separated list of moves (e.g. "e4,e5")
    status = Column(String(50), default="active")  # "active", "white_won", "black_won", "draw"
    chat = Column(Text, default="")  # JSON or text formatted chat messages
    created_at = Column(DateTime, default=func.now())

    # Relationships
    tournament = relationship("Tournament")
    white_player = relationship("User", foreign_keys=[white_player_id])
    black_player = relationship("User", foreign_keys=[black_player_id])