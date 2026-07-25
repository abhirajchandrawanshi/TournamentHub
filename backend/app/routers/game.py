import uuid
import random
import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies.auth import get_current_user, get_optional_user
from app.models.user import User
from app.models.game import Game

router = APIRouter(prefix="/games", tags=["games"])

def ensure_system_users(db: Session):
    system_users = [
        ("waiting-opponent", "Searching for Opponent...", "waiting@chessarena.ai", "waiting_opponent", 1500),
        ("ai-opponent", "GM_Arjun_Mehta (AI)", "arjun@chessarena.ai", "GM_Arjun_Mehta", 2400)
    ]
    for sys_id, sys_name, sys_email, sys_username, sys_rating in system_users:
        u = db.query(User).filter(User.id == sys_id).first()
        if not u:
            try:
                u = User(
                    id=sys_id,
                    name=sys_name,
                    email=sys_email,
                    username=sys_username,
                    rating=sys_rating
                )
                db.add(u)
                db.commit()
            except Exception:
                db.rollback()

@router.post("")
def create_game(
    payload: dict,
    current_user: User = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    ensure_system_users(db)
    opponent_id = payload.get("opponent_id") or "ai-opponent"
    clock_control = payload.get("clock_control", "10+0")
    tournament_id = payload.get("tournament_id")

    game_id = f"game-{uuid.uuid4().hex[:12]}"
    
    if random.choice([True, False]):
        white_id = current_user.id
        black_id = opponent_id
    else:
        white_id = opponent_id
        black_id = current_user.id

    new_game = Game(
        id=game_id,
        tournament_id=tournament_id,
        white_player_id=white_id,
        black_player_id=black_id,
        clock_control=clock_control,
        fen="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        moves="",
        status="active"
    )
    db.add(new_game)
    db.commit()
    db.refresh(new_game)

    return {
        "id": new_game.id,
        "white_player_id": new_game.white_player_id,
        "black_player_id": new_game.black_player_id,
        "status": new_game.status
    }

@router.post("/invite")
def create_invite_game(
    current_user: User = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    ensure_system_users(db)
    game_id = f"invite-{uuid.uuid4().hex[:12]}"
    new_game = Game(
        id=game_id,
        white_player_id=current_user.id,
        black_player_id="waiting-opponent",
        clock_control="5+0",
        fen="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        moves="",
        status="waiting"
    )
    db.add(new_game)
    db.commit()
    return {"id": new_game.id, "status": "waiting", "color": "w"}

@router.post("/matchmake")
def matchmake_game(
    current_user: User = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    ensure_system_users(db)

    # 1. Check if current user already has an active or waiting game
    existing_my_waiting = db.query(Game).filter(
        Game.status == "waiting",
        Game.white_player_id == current_user.id
    ).first()
    if existing_my_waiting:
        return {"id": existing_my_waiting.id, "status": "waiting", "color": "w"}

    # 2. Find any waiting game created by another player
    waiting_game = db.query(Game).filter(
        Game.status == "waiting",
        Game.white_player_id != current_user.id
    ).order_by(Game.created_at.asc()).first()

    if waiting_game:
        waiting_game.black_player_id = current_user.id
        waiting_game.status = "active"
        db.commit()
        db.refresh(waiting_game)
        return {"id": waiting_game.id, "status": "active", "color": "b"}

    # 3. Otherwise create a new waiting game
    game_id = f"game-{uuid.uuid4().hex[:12]}"
    new_game = Game(
        id=game_id,
        white_player_id=current_user.id,
        black_player_id="waiting-opponent",
        clock_control="5+0",
        fen="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        moves="",
        status="waiting"
    )
    db.add(new_game)
    db.commit()
    return {"id": new_game.id, "status": "waiting", "color": "w"}

@router.post("/{game_id}/join")
def join_existing_game(
    game_id: str,
    current_user: User = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    ensure_system_users(db)
    game = db.query(Game).filter(Game.id == game_id).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    if game.white_player_id == current_user.id:
        return {"id": game.id, "color": "w", "status": game.status}
    elif game.black_player_id == current_user.id:
        return {"id": game.id, "color": "b", "status": game.status}
    elif game.black_player_id == "waiting-opponent" and game.white_player_id != current_user.id:
        game.black_player_id = current_user.id
        game.status = "active"
        db.commit()
        return {"id": game.id, "color": "b", "status": "active"}
    
    return {"id": game.id, "color": "spectator", "status": game.status}

@router.get("/user/history")
def get_user_game_history(
    current_user: User = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    if not current_user:
        return []

    games = db.query(Game).filter(
        (Game.white_player_id == current_user.id) | (Game.black_player_id == current_user.id)
    ).order_by(Game.created_at.desc()).limit(20).all()

    history = []
    for g in games:
        is_white = g.white_player_id == current_user.id
        opponent = g.black_player if is_white else g.white_player
        opp_name = opponent.name if opponent else ("GM_Arjun_Mehta (AI)" if (g.black_player_id == "ai-opponent" or g.white_player_id == "ai-opponent") else "Opponent")

        result = "Draw"
        if g.status == "white_won":
            result = "Victory" if is_white else "Defeat"
        elif g.status == "black_won":
            result = "Defeat" if is_white else "Victory"
        elif g.status == "active":
            result = "In Progress"

        moves_arr = g.moves.split(",") if g.moves else []

        history.append({
            "id": g.id,
            "opponent": opp_name,
            "color": "White" if is_white else "Black",
            "result": result,
            "status": g.status,
            "clock": g.clock_control,
            "moves_count": len(moves_arr),
            "created_at": g.created_at.strftime("%Y-%m-%d %H:%M") if g.created_at else "Recently"
        })

    return history

@router.get("/{game_id}")
def get_game(game_id: str, db: Session = Depends(get_db)):
    game = db.query(Game).filter(Game.id == game_id).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    chat_messages = []
    if game.chat:
        try:
            chat_messages = json.loads(game.chat)
        except Exception:
            chat_messages = []

    return {
        "id": game.id,
        "tournament_id": game.tournament_id,
        "white": {
            "id": game.white_player.id if game.white_player else "white-player",
            "name": game.white_player.name if game.white_player else "White Player",
            "rating": game.white_player.rating if game.white_player else 1500,
            "avatar": game.white_player.avatar if game.white_player else None
        },
        "black": {
            "id": game.black_player.id if game.black_player else "waiting-opponent",
            "name": game.black_player.name if game.black_player else "Waiting for Opponent...",
            "rating": game.black_player.rating if game.black_player else 1500,
            "avatar": game.black_player.avatar if game.black_player else None
        },
        "clock_control": game.clock_control,
        "fen": game.fen,
        "moves": game.moves.split(",") if game.moves else [],
        "status": game.status,
        "chat": chat_messages,
        "created_at": game.created_at
    }

@router.post("/{game_id}/move")
def play_move(
    game_id: str,
    payload: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    game = db.query(Game).filter(Game.id == game_id).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    if game.status != "active":
        raise HTTPException(status_code=400, detail="Game is already finished")

    if current_user.id not in [game.white_player_id, game.black_player_id]:
        raise HTTPException(status_code=403, detail="You are not a player in this game")

    fen = payload.get("fen")
    move = payload.get("move")
    status_update = payload.get("status")

    if not fen or not move:
        raise HTTPException(status_code=400, detail="fen and move are required")

    game.fen = fen
    existing_moves = game.moves.split(",") if game.moves else []
    existing_moves.append(move)
    game.moves = ",".join(existing_moves)

    if status_update:
        game.status = status_update
        # Ratings update
        if status_update == "white_won":
            game.white_player.rating += 15
            game.black_player.rating = max(100, game.black_player.rating - 15)
        elif status_update == "black_won":
            game.black_player.rating += 15
            game.white_player.rating = max(100, game.white_player.rating - 15)

    db.commit()

    return {
        "id": game.id,
        "fen": game.fen,
        "moves": game.moves.split(","),
        "status": game.status
    }

@router.post("/{game_id}/resign")
def resign_game(
    game_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    game = db.query(Game).filter(Game.id == game_id).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    if game.status != "active":
        raise HTTPException(status_code=400, detail="Game is already finished")

    if current_user.id == game.white_player_id:
        game.status = "black_won"
        game.black_player.rating += 15
        game.white_player.rating = max(100, game.white_player.rating - 15)
    elif current_user.id == game.black_player_id:
        game.status = "white_won"
        game.white_player.rating += 15
        game.black_player.rating = max(100, game.black_player.rating - 15)
    else:
        raise HTTPException(status_code=403, detail="You are not a player in this game")

    db.commit()
    return {"id": game.id, "status": game.status}

@router.post("/{game_id}/chat")
def send_game_chat(
    game_id: str,
    payload: dict,
    current_user: User = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    game = db.query(Game).filter(Game.id == game_id).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    text = payload.get("text", "").strip()
    chat_messages = []
    if game.chat:
        try:
            chat_messages = json.loads(game.chat)
        except Exception:
            chat_messages = []

    if not text:
        return {"chat": chat_messages}

    sender = payload.get("sender") or (current_user.name if current_user else "Player")

    new_msg = {
        "id": f"msg-{uuid.uuid4().hex[:8]}",
        "sender": sender,
        "text": text,
        "time": datetime.now().strftime("%I:%M %p")
    }
    chat_messages.append(new_msg)
    game.chat = json.dumps(chat_messages)
    db.commit()

    return {"chat": chat_messages}

@router.post("/{game_id}/timeout")
def game_timeout(
    game_id: str,
    payload: dict,
    current_user: User = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    game = db.query(Game).filter(Game.id == game_id).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    if game.status != "active":
        return {"id": game.id, "status": game.status}

    loser_color = payload.get("loser_color", "w")
    if loser_color == "w":
        game.status = "black_won"
        if game.black_player and game.white_player:
            game.black_player.rating += 15
            game.white_player.rating = max(100, game.white_player.rating - 15)
    else:
        game.status = "white_won"
        if game.white_player and game.black_player:
            game.white_player.rating += 15
            game.black_player.rating = max(100, game.black_player.rating - 15)

    db.commit()
    return {"id": game.id, "status": game.status}
