import urllib.parse
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

def fix_database_url(url: str) -> str:
    try:
        if "://" in url:
            scheme, rest = url.split("://", 1)
            if "/" in rest:
                user_pass_host, dbname = rest.rsplit("/", 1)
            else:
                user_pass_host, dbname = rest, ""
            
            if "@" in user_pass_host:
                user_pass, host_port = user_pass_host.rsplit("@", 1)
                if ":" in user_pass:
                    user, password = user_pass.split(":", 1)
                    # Unquote first to avoid double encoding if already %40, then quote_plus
                    unquoted_password = urllib.parse.unquote(password)
                    quoted_password = urllib.parse.quote_plus(unquoted_password)
                    return f"{scheme}://{user}:{quoted_password}@{host_port}/{dbname}"
    except Exception:
        pass
    return url

fixed_url = fix_database_url(settings.DATABASE_URL)
engine = create_engine(fixed_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()