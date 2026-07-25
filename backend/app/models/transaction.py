from sqlalchemy import Column, String, Float, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database import Base

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String(128), primary_key=True)
    user_id = Column(String(128), ForeignKey("users.id"), nullable=False)
    razorpay_order_id = Column(String(128), nullable=True)
    razorpay_payment_id = Column(String(128), nullable=True)
    amount = Column(Float, nullable=False)
    type = Column(String(50), nullable=False)  # "deposit", "withdrawal", "entry_fee", "prize"
    status = Column(String(50), default="completed")  # "created", "completed", "failed", "pending"
    payout_details = Column(String(255), nullable=True)  # UPI ID or Bank account
    created_at = Column(DateTime, default=func.now())

    user = relationship("User")
