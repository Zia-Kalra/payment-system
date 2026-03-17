from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.core.hashing import hash_password, verify_password
from backend.core.security import create_access_token, get_current_user
from backend.database import get_db
from backend.models.user import User
from backend.schemas.user import TokenResponse, UserCreate, UserLogin, UserPublic

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserPublic)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    try:
        hashed = hash_password(payload.password)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    user = User(
        name=payload.name,
        email=payload.email,
        hashed_password=hashed,
        role="user",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(subject=str(user.id))
    return TokenResponse(access_token=token, user=user)


@router.get("/me", response_model=UserPublic)
def me(user=Depends(get_current_user)):
    return user
