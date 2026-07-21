import firebase_admin
from firebase_admin import credentials
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import auth

# Initialize Firebase Admin
try:
    cred = credentials.Certificate(settings.FIREBASE_SERVICE_ACCOUNT_JSON)
    firebase_admin.initialize_app(cred)
except Exception as e:
    print(f"Warning: Firebase Admin initialization failed: {e}")

app = FastAPI(title="ChessArena API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
