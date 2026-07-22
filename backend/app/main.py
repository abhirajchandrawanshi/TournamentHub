import firebase_admin
from firebase_admin import credentials
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import auth

# Initialize Firebase Admin
import json

try:
    try:
        # Try parsing as a raw JSON string first (ideal for Vercel Environment Variables)
        cert_dict = json.loads(settings.FIREBASE_SERVICE_ACCOUNT_JSON)
        cred = credentials.Certificate(cert_dict)
    except json.JSONDecodeError:
        # Fallback to treating it as a file path (for local development)
        cred = credentials.Certificate(settings.FIREBASE_SERVICE_ACCOUNT_JSON)
        
    firebase_admin.initialize_app(cred)
except Exception as e:
    print(f"Warning: Firebase Admin initialization failed: {e}")

app = FastAPI(title="ChessArena API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
