from __future__ import annotations

from datetime import datetime, timedelta, timezone
import logging
import uuid
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.core.config import settings
from backend.database import get_db
from backend.models.user import User

bearer_scheme = HTTPBearer()
logger = logging.getLogger("backend.security")


class TokenData(BaseModel):
    user_id: int | None = None


def create_access_token(*, subject: str, expires_delta: timedelta | None = None) -> str:
    if expires_delta is None:
        expires_delta = timedelta(minutes=settings.jwt_access_token_minutes)
    expire = datetime.now(timezone.utc) + expires_delta
    # Use numeric timestamps for maximum compatibility across JWT libraries.
    now_ts = int(datetime.now(timezone.utc).timestamp())
    to_encode = {
        "sub": subject,
        "exp": int(expire.timestamp()),
        "iat": now_ts,
        "jti": uuid.uuid4().hex,  # ensures token differs on every login
    }
    return jwt.encode(to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def _get_user_from_token(db: Session, token: str) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
        subject: str | None = payload.get("sub")
        if subject is None:
            logger.warning("JWT missing sub claim")
            raise credentials_exception
        token_data = TokenData(user_id=int(subject))
    except (JWTError, ValueError):
        logger.warning("JWT decode failed", exc_info=True)
        raise credentials_exception

    user = db.query(User).filter(User.id == token_data.user_id).first()
    if user is None:
        logger.warning("User not found for id=%s", token_data.user_id)
        raise credentials_exception
    return user


def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(bearer_scheme)],
    db: Annotated[Session, Depends(get_db)],
) -> User:
    return _get_user_from_token(db, credentials.credentials)


def require_role(*roles: str):
    def _dep(user: Annotated[User, Depends(get_current_user)]) -> User:
        if user.role not in roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return user

    return _dep
