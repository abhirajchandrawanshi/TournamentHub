import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.dependencies.auth import get_current_user, get_optional_user
from app.models.user import User
from app.models.tournament import Tournament, TournamentParticipant
from app.models.transaction import Transaction

router = APIRouter(prefix="/tournaments", tags=["tournaments"])

@router.get("")
def list_tournaments(db: Session = Depends(get_db)):
    tournaments = db.query(Tournament).all()
    result = []
    for t in tournaments:
        result.append({
            "id": t.id,
            "name": t.name,
            "clock": t.clock,
            "type": t.type,
            "status": t.status,
            "entry_fee": t.entry_fee or 0.0,
            "players": len(t.participants),
            "starts": "Playing now" if t.status == "active" else "Upcoming",
            "live": t.status == "active"
        })
    return result

@router.post("", status_code=status.HTTP_201_CREATED)
def create_tournament(
    payload: dict,
    current_user: User = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    name = payload.get("name")
    clock = payload.get("clock", "3+0")
    t_type = payload.get("type", "Arena")
    entry_fee = float(payload.get("entry_fee", 0.0))

    if not name:
        raise HTTPException(status_code=400, detail="Tournament name is required")

    tournament_id = f"{name.lower().replace(' ', '-')}-{uuid.uuid4().hex[:6]}"

    new_tournament = Tournament(
        id=tournament_id,
        name=name,
        clock=clock,
        type=t_type,
        status="created",
        entry_fee=entry_fee,
        creator_id=current_user.id
    )
    db.add(new_tournament)
    
    # Auto-join creator
    participant = TournamentParticipant(
        tournament_id=tournament_id,
        user_id=current_user.id
    )
    db.add(participant)
    
    db.commit()
    db.refresh(new_tournament)

    return {
        "id": new_tournament.id,
        "name": new_tournament.name,
        "entry_fee": new_tournament.entry_fee,
        "status": new_tournament.status
    }

@router.get("/{tournament_id}")
def get_tournament(tournament_id: str, db: Session = Depends(get_db)):
    t = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    participants = []
    for p in t.participants:
        participants.append({
            "id": p.user.id,
            "name": p.user.name,
            "username": p.user.username,
            "rating": p.user.rating,
            "avatar": p.user.avatar
        })

    return {
        "id": t.id,
        "name": t.name,
        "clock": t.clock,
        "type": t.type,
        "status": t.status,
        "entry_fee": t.entry_fee or 0.0,
        "creator_id": t.creator_id,
        "participants": participants
    }

@router.post("/{tournament_id}/join")
def join_tournament(
    tournament_id: str,
    current_user: User = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    t = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    existing = db.query(TournamentParticipant).filter(
        TournamentParticipant.tournament_id == tournament_id,
        TournamentParticipant.user_id == current_user.id
    ).first()
    
    if existing:
        return {"message": "Already joined this tournament", "status": "success"}

    # Deduct entry fee if applicable
    entry_fee = t.entry_fee or 0.0
    if entry_fee > 0:
        user_balance = current_user.wallet_balance or 0.0
        if user_balance < entry_fee:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient balance. Entry fee is ₹{entry_fee:.2f}. Please add funds at /wallet."
            )
        current_user.wallet_balance -= entry_fee
        txn = Transaction(
            id=f"txn-{uuid.uuid4().hex[:10]}",
            user_id=current_user.id,
            amount=entry_fee,
            type="entry_fee",
            status="completed"
        )
        db.add(txn)

    participant = TournamentParticipant(
        tournament_id=tournament_id,
        user_id=current_user.id
    )
    db.add(participant)
    db.commit()

    return {"message": "Successfully joined tournament", "status": "success"}