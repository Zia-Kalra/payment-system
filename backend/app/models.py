from __future__ import annotations

import datetime as dt

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


def utcnow() -> dt.datetime:
    return dt.datetime.now(dt.timezone.utc)


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(200))
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    role: Mapped[str] = mapped_column(String(20), default="user")  # user/admin
    status: Mapped[str] = mapped_column(String(20), default="active")  # active/restricted/suspended
    password_hash: Mapped[str] = mapped_column(Text)
    created_at: Mapped[dt.datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    transactions: Mapped[list["Transaction"]] = relationship(back_populates="user")


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(64), ForeignKey("users.id"), index=True)

    created_at: Mapped[dt.datetime] = mapped_column(DateTime(timezone=True), default=utcnow, index=True)
    amount: Mapped[float] = mapped_column(Float)
    method: Mapped[str] = mapped_column(String(20))  # Card/UPI/Wallet
    device: Mapped[str] = mapped_column(String(20))  # Mobile/Laptop
    location: Mapped[str] = mapped_column(String(255), default="Unknown")

    status: Mapped[str] = mapped_column(String(20), default="success")  # success/failed/pending
    fraud_score: Mapped[int] = mapped_column(Integer, default=0)
    fraud_signals: Mapped[str] = mapped_column(Text, default="")  # comma-separated

    local_hash: Mapped[str] = mapped_column(String(128))
    blockchain_hash: Mapped[str] = mapped_column(String(128))
    blockchain_verified: Mapped[bool] = mapped_column(Boolean, default=True)
    blockchain_timestamp: Mapped[dt.datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    user: Mapped["User"] = relationship(back_populates="transactions")


class FraudAlert(Base):
    __tablename__ = "fraud_alerts"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(64), ForeignKey("users.id"), index=True)
    transaction_id: Mapped[str] = mapped_column(String(64), ForeignKey("transactions.id"), index=True)
    severity: Mapped[str] = mapped_column(String(20))  # low/medium/high
    message: Mapped[str] = mapped_column(Text)
    created_at: Mapped[dt.datetime] = mapped_column(DateTime(timezone=True), default=utcnow, index=True)

