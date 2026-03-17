from __future__ import annotations

from collections.abc import Generator

from sqlalchemy import create_engine, text
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from .config import settings


def _connect_args_for(url: str):
    # SQLite needs this for multithreaded servers.
    if url.startswith("sqlite:"):
        return {"check_same_thread": False}
    return {}


engine = create_engine(settings.database_url, pool_pre_ping=True, connect_args=_connect_args_for(settings.database_url))
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def db_ping() -> bool:
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception:
        return False