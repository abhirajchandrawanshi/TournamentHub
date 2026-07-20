import firebase_admin
from firebase_admin import credentials
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import auth

# Initialize Firebase Admin with error-safe handling for development
try:
    cred = credentials.Certificate(settings.FIREBASE_SERVICE_ACCOUNT_JSON)
    firebase_admin.initialize_app(cred)
    print("Firebase Admin successfully initialized!")
except Exception as e:
    print("\n" + "="*80)
    print(f"WARNING: Firebase Admin failed to initialize.")
    print(f"Error: {e}")
    print("Please make sure you put a valid Firebase serviceAccountKey.json at the root of your backend.")
    print("="*80 + "\n")

app = FastAPI(
    title="ChessArena API",
    description="Backend API for ChessArena tournament hosting platform",
    version="1.0.0"
)

# CORS Middleware config
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Auth routers
app.include_router(auth.router, prefix="/api")

# Automatically create database tables on startup
from app.database import engine, Base
import app.models as app_models # Ensure models are loaded

@app.on_event("startup")
def on_startup():
    try:
        Base.metadata.create_all(bind=engine)
        print("Database tables verified/created successfully!")
    except Exception as e:
        print("\n" + "="*80)
        print(f"WARNING: Could not connect to database or create tables.")
        print(f"Error: {e}")
        print("Please check your DATABASE_URL in the .env file.")
        print("="*80 + "\n")

@app.get("/")
async def root():
    return {
        "message": "Welcome to ChessArena API. Visit /docs for API documentation.",
        "status": "online"
    }
