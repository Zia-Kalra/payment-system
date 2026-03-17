from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from backend.database import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), index=True, nullable=False)

    amount: Mapped[float] = mapped_column(Float, nullable=False)
    payment_method: Mapped[str] = mapped_column(String, nullable=False)
    device_type: Mapped[str] = mapped_column(String, nullable=False)
    location: Mapped[str] = mapped_column(String, nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime, nullable=False)

    fraud_score: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    fraud_status: Mapped[str] = mapped_column(String, default="Safe", nullable=False)

    transaction_hash: Mapped[str | None] = mapped_column(String, nullable=True)
    blockchain_tx_id: Mapped[str | None] = mapped_column(String, nullable=True)
