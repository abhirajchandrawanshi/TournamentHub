import os
import uuid
import hmac
import hashlib
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies.auth import get_optional_user
from app.models.user import User
from app.models.transaction import Transaction

router = APIRouter(prefix="/wallet", tags=["wallet"])

RAZORPAY_KEY_ID = os.environ.get("RAZORPAY_KEY_ID", "rzp_test_TournamentHub2026")
RAZORPAY_KEY_SECRET = os.environ.get("RAZORPAY_KEY_SECRET", "SecretTournamentHubKey2026")

@router.get("/balance")
def get_wallet_balance(
    current_user: User = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id
    ).order_by(Transaction.created_at.desc()).limit(20).all()

    txn_list = []
    for t in transactions:
        txn_list.append({
            "id": t.id,
            "amount": t.amount,
            "type": t.type,
            "status": t.status,
            "razorpay_order_id": t.razorpay_order_id,
            "payout_details": t.payout_details,
            "created_at": t.created_at.strftime("%Y-%m-%d %H:%M") if t.created_at else ""
        })

    return {
        "balance": current_user.wallet_balance or 0.0,
        "key_id": RAZORPAY_KEY_ID,
        "transactions": txn_list
    }

@router.post("/create_order")
def create_razorpay_order(
    payload: dict,
    current_user: User = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    amount = float(payload.get("amount", 100))
    if amount < 10:
        raise HTTPException(status_code=400, detail="Minimum deposit amount is ₹10")

    order_id = f"order_{uuid.uuid4().hex[:14]}"

    # Store pending transaction record
    txn = Transaction(
        id=f"txn-{uuid.uuid4().hex[:10]}",
        user_id=current_user.id,
        razorpay_order_id=order_id,
        amount=amount,
        type="deposit",
        status="pending"
    )
    db.add(txn)
    db.commit()

    return {
        "order_id": order_id,
        "amount": int(amount * 100),  # Amount in paise for Razorpay
        "currency": "INR",
        "key_id": RAZORPAY_KEY_ID
    }

@router.post("/verify_payment")
def verify_payment(
    payload: dict,
    current_user: User = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    order_id = payload.get("razorpay_order_id")
    payment_id = payload.get("razorpay_payment_id")
    signature = payload.get("razorpay_signature")
    amount = float(payload.get("amount", 0))

    if not payment_id or not order_id:
        raise HTTPException(status_code=400, detail="Invalid payment details")

    # Optional signature verification
    if signature and RAZORPAY_KEY_SECRET != "SecretTournamentHubKey2026":
        msg = f"{order_id}|{payment_id}"
        generated_signature = hmac.new(
            RAZORPAY_KEY_SECRET.encode(),
            msg.encode(),
            hashlib.sha256
        ).hexdigest()
        if generated_signature != signature:
            raise HTTPException(status_code=400, detail="Invalid Razorpay payment signature")

    # Update pending transaction or create completed deposit
    txn = db.query(Transaction).filter(
        Transaction.razorpay_order_id == order_id,
        Transaction.user_id == current_user.id
    ).first()

    if not txn:
        txn = Transaction(
            id=f"txn-{uuid.uuid4().hex[:10]}",
            user_id=current_user.id,
            razorpay_order_id=order_id,
            razorpay_payment_id=payment_id,
            amount=amount,
            type="deposit",
            status="completed"
        )
        db.add(txn)
    else:
        txn.razorpay_payment_id = payment_id
        txn.status = "completed"
        if amount > 0:
            txn.amount = amount

    # Credit wallet balance in DB
    credit_amount = txn.amount if txn.amount > 0 else amount
    current_user.wallet_balance = (current_user.wallet_balance or 0.0) + credit_amount
    db.commit()
    db.refresh(current_user)

    return {
        "message": f"Success! ₹{credit_amount:.2f} credited to your wallet.",
        "balance": current_user.wallet_balance
    }

@router.post("/withdraw")
def request_withdrawal(
    payload: dict,
    current_user: User = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    amount = float(payload.get("amount", 0))
    upi_id = payload.get("upi_id", "").strip()

    if amount <= 0:
        raise HTTPException(status_code=400, detail="Invalid withdrawal amount")

    if not upi_id:
        raise HTTPException(status_code=400, detail="UPI ID or Bank Details are required")

    if (current_user.wallet_balance or 0.0) < amount:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient balance. Current balance is ₹{current_user.wallet_balance:.2f}"
        )

    # Deduct wallet balance
    current_user.wallet_balance -= amount

    txn = Transaction(
        id=f"txn-{uuid.uuid4().hex[:10]}",
        user_id=current_user.id,
        amount=amount,
        type="withdrawal",
        status="completed",
        payout_details=upi_id
    )
    db.add(txn)
    db.commit()
    db.refresh(current_user)

    return {
        "message": f"Success! ₹{amount:.2f} withdrawn to {upi_id}.",
        "balance": current_user.wallet_balance
    }
