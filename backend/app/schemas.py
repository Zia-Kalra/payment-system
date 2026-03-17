from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, EmailStr, Field


Role = Literal["user", "admin"]
AccountStatus = Literal["active", "restricted", "suspended"]


class UserOut(BaseModel):
    id: str
    name: str
    email: EmailStr
    role: Role
    status: AccountStatus


class LoginIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    remember: bool = True


class RegisterIn(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    email: EmailStr
    password: str = Field(min_length=8)
    role: Optional[Role] = None


class AuthOut(BaseModel):
    token: str
    user: UserOut


PaymentMethod = Literal["Card", "UPI", "Wallet"]
DeviceType = Literal["Mobile", "Laptop"]
TransactionStatus = Literal["success", "failed", "pending"]


class CreatePaymentIn(BaseModel):
    userId: str
    amount: float = Field(gt=0)
    method: PaymentMethod
    device: DeviceType
    location: str = ""


class TransactionOut(BaseModel):
    id: str
    userId: str
    createdAt: str
    amount: float
    method: PaymentMethod
    device: DeviceType
    location: str
    status: TransactionStatus
    fraudScore: int = Field(ge=0, le=100)
    fraudSignals: list[str] = []
    localHash: str
    blockchainHash: str
    blockchainVerified: bool
    blockchainTimestamp: str


class ListTransactionsOut(BaseModel):
    items: list[TransactionOut]
    total: int
    page: int
    pageSize: int


class FraudAlertOut(BaseModel):
    id: str
    transactionId: str
    severity: Literal["low", "medium", "high"]
    message: str
    createdAt: str


class VerifyIn(BaseModel):
    transactionId: str


class VerifyOut(BaseModel):
    transactionId: str
    localHash: str
    blockchainHash: str
    valid: bool
    timestamp: str


class AdminSummary(BaseModel):
    totalTransactions: int
    totalFraudCases: int
    fraudPercentage: float
    averageAmount: float


class DailyVolumeItem(BaseModel):
    date: str
    count: int
    amount: float


class FraudStats(BaseModel):
    low: int
    medium: int
    high: int


class AdminAnalyticsOut(BaseModel):
    summary: AdminSummary
    dailyVolume: list[DailyVolumeItem]
    highRiskTransactions: list[TransactionOut]
    fraudStats: FraudStats
    realTimeAlerts: list[FraudAlertOut]


class UpdateUserStatusIn(BaseModel):
    status: AccountStatus

