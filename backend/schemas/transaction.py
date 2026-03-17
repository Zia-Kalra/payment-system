from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class PaymentCreate(BaseModel):
    amount: float = Field(gt=0)
    payment_method: str = Field(min_length=2, max_length=30)  # Card / UPI / Wallet
    device_type: str = Field(min_length=2, max_length=30)  # Mobile / Laptop
    location: str = Field(min_length=2, max_length=80)


class TransactionPublic(BaseModel):
    id: int
    user_id: int
    amount: float
    payment_method: str
    device_type: str
    location: str
    timestamp: datetime
    fraud_score: int
    fraud_status: str
    transaction_hash: str | None
    blockchain_tx_id: str | None

    model_config = {"from_attributes": True}


class PaymentResponse(BaseModel):
    success: bool
    transaction: TransactionPublic
    blockchain_status: str
