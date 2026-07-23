from app.database import Base, engine
from app.models import User, Tournament, TournamentParticipant, Game

def init_db():
    print("Connecting to database and creating tables...")
    try:
        Base.metadata.create_all(bind=engine)
        print("Success: All tables (users, tournaments, tournament_participants, games) created successfully!")
    except Exception as e:
        print(f"Error creating tables: {e}")

if __name__ == "__main__":
    init_db()
