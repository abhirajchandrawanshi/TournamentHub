import uuid
import random
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.game import Game

router = APIRouter(prefix="/games", tags=["games"])

@router.post("")
def create_game(
    payload: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    opponent_id = payload.get("opponent_id")
    clock_control = payload.get("clock_control", "10+0")
    tournament_id = payload.get("tournament_id")
    
    if not opponent_id:
        opponent_id = "ai-opponent"
        opponent = db.query(User).filter(User.id == opponent_id).first()
        if not opponent:
            opponent = User(
                id="ai-opponent",
                name="GM_Arjun_Mehta (AI)",
                email="arjun@chessarena.ai",
                username="GM_Arjun_Mehta",
                rating=2400
            )
            db.add(opponent)
            db.commit()
            db.refresh(opponent)

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
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
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
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Find waiting game
    waiting_game = db.query(Game).filter(
        Game.status == "waiting",
        Game.white_player_id != current_user.id
    ).first()

    if waiting_game:
        waiting_game.black_player_id = current_user.id
        waiting_game.status = "active"
        db.commit()
        db.refresh(waiting_game)
        return {"id": waiting_game.id, "status": "active", "color": "b"}

    # Otherwise create waiting game
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
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    game = db.query(Game).filter(Game.id == game_id).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    if game.white_player_id == current_user.id:
        return {"id": game.id, "color": "w", "status": game.status}
    elif game.black_player_id == current_user.id:
        return {"id": game.id, "color": "b", "status": game.status}
    elif game.black_player_id == "waiting-opponent":
        game.black_player_id = current_user.id
        game.status = "active"
        db.commit()
        return {"id": game.id, "color": "b", "status": "active"}
    
    return {"id": game.id, "color": "spectator", "status": game.status}

@router.get("/{game_id}")
def get_game(game_id: str, db: Session = Depends(get_db)):
    game = db.query(Game).filter(Game.id == game_id).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

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