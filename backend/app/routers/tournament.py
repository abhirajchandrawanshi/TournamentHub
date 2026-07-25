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

@router.post("/{tournament_id}/start")
def start_tournament(
    tournament_id: str,
    current_user: User = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    from app.models.game import Game
    t = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Tournament not found")

    t.status = "active"
    participants = t.participants

    # Generate initial round matches
    if len(participants) >= 2:
        for i in range(0, len(participants) - 1, 2):
            w_player = participants[i].user
            b_player = participants[i + 1].user
            game_id = f"tmatch-{t.id[:10]}-r1-{i//2 + 1}"
            
            existing_g = db.query(Game).filter(Game.id == game_id).first()
            if not existing_g:
                g = Game(
                    id=game_id,
                    tournament_id=t.id,
                    white_player_id=w_player.id,
                    black_player_id=b_player.id,
                    clock_control=t.clock,
                    fen="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
                    moves="",
                    status="active"
                )
                db.add(g)

    db.commit()
    return {"message": "Tournament started successfully", "status": "active"}

@router.get("/{tournament_id}/brackets")
def get_tournament_brackets(tournament_id: str, db: Session = Depends(get_db)):
    from app.models.game import Game
    t = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Tournament not found")

    games = db.query(Game).filter(Game.tournament_id == tournament_id).all()
    matches = []
    
    for g in games:
        w_name = g.white_player.name if g.white_player else "TBD"
        b_name = g.black_player.name if g.black_player else "TBD"
        winner = None
        if g.status == "white_won":
            winner = w_name
        elif g.status == "black_won":
            winner = b_name

        matches.append({
            "game_id": g.id,
            "white": w_name,
            "black": b_name,
            "white_id": g.white_player_id,
            "black_id": g.black_player_id,
            "status": g.status,
            "winner": winner,
            "moves_count": len(g.moves.split(",")) if g.moves else 0
        })

    # Generate standings table
    standings = []
    player_stats = {}
    for p in t.participants:
        player_stats[p.user.id] = {
            "id": p.user.id,
            "name": p.user.name,
            "rating": p.user.rating,
            "wins": 0,
            "losses": 0,
            "points": 0
        }

    for g in games:
        if g.status == "white_won" and g.white_player_id in player_stats:
            player_stats[g.white_player_id]["wins"] += 1
            player_stats[g.white_player_id]["points"] += 1
            if g.black_player_id in player_stats:
                player_stats[g.black_player_id]["losses"] += 1
        elif g.status == "black_won" and g.black_player_id in player_stats:
            player_stats[g.black_player_id]["wins"] += 1
            player_stats[g.black_player_id]["points"] += 1
            if g.white_player_id in player_stats:
                player_stats[g.white_player_id]["losses"] += 1

    sorted_standings = sorted(list(player_stats.values()), key=lambda x: x["points"], reverse=True)

    return {
        "tournament_id": t.id,
        "name": t.name,
        "status": t.status,
        "matches": matches,
        "standings": sorted_standings
    }

@router.post("/{tournament_id}/finish")
def finish_tournament(
    tournament_id: str,
    current_user: User = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    t = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Tournament not found")

    t.status = "completed"
    db.commit()
    return {"message": "Tournament marked as completed", "status": "completed"}