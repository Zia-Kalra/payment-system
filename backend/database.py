from __future__ import annotations

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker


class Base(DeclarativeBase):
    pass


def _sqlite_url(db_path: str) -> str:
    # Ensure relative path works from repo root or backend folder.
    return f"sqlite:///{db_path}"


SQLALCHEMY_DATABASE_URL = _sqlite_url("backend/database.db")

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()