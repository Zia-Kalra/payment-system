from __future__ import annotations

from sqlalchemy.orm import Session

from .auth import hash_password
from .models import User


def seed_default_users(db: Session):
    """
    Seed demo credentials (matches frontend demo).
    - admin@payments.local / Admin@1234
    - user@payments.local / User@1234
    """
    existing = db.query(User).count()
    if existing:
        return

    admin = User(
        id="u_admin",
        name="Admin",
        email="admin@payments.local",
        role="admin",
        status="active",
        password_hash=hash_password("Admin@1234"),
    )
    user = User(
        id="u_demo",
        name="Demo User",
        email="user@payments.local",
        role="user",
        status="active",
        password_hash=hash_password("User@1234"),
    )
    db.add_all([admin, user])
    db.commit()

