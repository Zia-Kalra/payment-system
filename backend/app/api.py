from __future__ import annotations

import datetime as dt
from collections import defaultdict

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import desc, func
from sqlalchemy.orm import Session

from . import schemas
from .auth import (
    create_access_token,
    get_current_user,
    hash_password,
    new_id,
    require_role,
    sha256_hex,
    verify_password,
)
from .database import get_db
from .models import FraudAlert, Transaction, User

router = APIRouter()


def _iso(d: dt.datetime) -> str:
    if d.tzinfo is None:
        d = d.replace(tzinfo=dt.timezone.utc)
    return d.isoformat().replace("+00:00", "Z")


def _tx_out(t: Transaction) -> schemas.TransactionOut:
    signals = [s for s in (t.fraud_signals or "").split(",") if s]
    return schemas.TransactionOut(
        id=t.id,
        userId=t.user_id,
        createdAt=_iso(t.created_at),
        amount=float(t.amount),
        method=t.method,  # type: ignore[arg-type]
        device=t.device,  # type: ignore[arg-type]
        location=t.location,
        status=t.status,  # type: ignore[arg-type]
        fraudScore=int(t.fraud_score),
        fraudSignals=signals,
        localHash=t.local_hash,
        blockchainHash=t.blockchain_hash,
        blockchainVerified=bool(t.blockchain_verified),
        blockchainTimestamp=_iso(t.blockchain_timestamp),
    )


def fraud_from_inputs(amount: float, method: str, device: str, location: str):
    score = 18
    signals: list[str] = []

    if amount > 5000:
        score += 35
        signals.append("anomaly:high_amount")
    elif amount > 1500:
        score += 18
        signals.append("amount:moderate")

    if method == "Wallet":
        score += 8
        signals.append("method:wallet")

    if device == "Laptop":
        score += 6
        signals.append("device:laptop")

    if not location.strip():
        score += 10
        signals.append("missing:location")
    elif "vpn" in location.lower() or "unknown" in location.lower():
        score += 22
        signals.append("location:high_risk")

    # small deterministic-ish jitter (based on inputs) to avoid identical scores
    score += int(sha256_hex({"a": amount, "m": method, "d": device, "l": location})[:2], 16) % 20

    score = max(0, min(100, score))
    return score, signals


# ---------------------------
# Auth
# ---------------------------
@router.post("/auth/register", response_model=schemas.AuthOut)
def register(payload: schemas.RegisterIn, db: Session = Depends(get_db)):
    email = payload.email.lower().strip()
    exists = db.query(User).filter(User.email == email).first()
    if exists:
        raise HTTPException(status_code=400, detail="Email already registered")

    role = payload.role or "user"
    user = User(
        id=new_id("u"),
        name=payload.name.strip(),
        email=email,
        role=role,
        status="active",
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    db.commit()

    token = create_access_token(
        subject=user.id,
        email=user.email,
        role=user.role,
        minutes=60,
    )
    return schemas.AuthOut(
        token=token,
        user=schemas.UserOut(
            id=user.id, name=user.name, email=user.email, role=user.role, status=user.status  # type: ignore[arg-type]
        ),
    )


@router.post("/auth/login", response_model=schemas.AuthOut)
def login(payload: schemas.LoginIn, db: Session = Depends(get_db)):
    email = payload.email.lower().strip()
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    minutes = 60 * 24 * 7 if payload.remember else 60
    token = create_access_token(subject=user.id, email=user.email, role=user.role, minutes=minutes)
    return schemas.AuthOut(
        token=token,
        user=schemas.UserOut(
            id=user.id, name=user.name, email=user.email, role=user.role, status=user.status  # type: ignore[arg-type]
        ),
    )


# ---------------------------
# Payments / Transactions
# ---------------------------
@router.post("/payments", response_model=schemas.TransactionOut)
def create_payment(
    payload: schemas.CreatePaymentIn,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    if payload.userId != current.id and current.role != "admin":
        raise HTTPException(status_code=403, detail="Forbidden")

    score, signals = fraud_from_inputs(payload.amount, payload.method, payload.device, payload.location)

    now = dt.datetime.now(dt.timezone.utc)
    local_hash = sha256_hex(
        {
            "userId": payload.userId,
            "amount": payload.amount,
            "method": payload.method,
            "device": payload.device,
            "location": payload.location.strip() or "Unknown",
            "createdAt": _iso(now),
        }
    )
    blockchain_verified = score < 90
    blockchain_hash = local_hash if blockchain_verified else sha256_hex({"tampered": local_hash})
    status = "failed" if score > 95 else "success"

    tx = Transaction(
        id=new_id("tx"),
        user_id=payload.userId,
        created_at=now,
        amount=float(payload.amount),
        method=payload.method,
        device=payload.device,
        location=(payload.location.strip() or "Unknown"),
        status=status,
        fraud_score=int(score),
        fraud_signals=",".join(signals),
        local_hash=local_hash,
        blockchain_hash=blockchain_hash,
        blockchain_verified=bool(blockchain_verified),
        blockchain_timestamp=now,
    )
    db.add(tx)

    if score >= 80:
        severity = "high" if score >= 92 else ("medium" if score >= 86 else "low")
        alert = FraudAlert(
            id=new_id("fa"),
            user_id=payload.userId,
            transaction_id=tx.id,
            severity=severity,
            message="High-risk transaction blocked by policy." if severity == "high" else "Suspicious behavior detected. Manual review recommended.",
            created_at=now,
        )
        db.add(alert)

    db.commit()
    db.refresh(tx)
    return _tx_out(tx)


@router.get("/transactions", response_model=schemas.ListTransactionsOut)
def list_transactions(
    userId: str,
    q: str | None = None,
    from_: str | None = None,  # "from" is reserved in Python; frontend sends "from"
    to: str | None = None,
    sort: str | None = "newest",
    page: int = 1,
    pageSize: int = 10,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    if userId != current.id and current.role != "admin":
        raise HTTPException(status_code=403, detail="Forbidden")

    query = db.query(Transaction).filter(Transaction.user_id == userId)

    if q:
        like = f"%{q.lower()}%"
        query = query.filter(
            func.lower(Transaction.id).like(like)
            | func.lower(Transaction.location).like(like)
            | func.lower(Transaction.method).like(like)
            | func.lower(Transaction.status).like(like)
        )

    # Accept both "from" and "from_" query param keys (FastAPI will bind from_ from "from_";
    # but the frontend sends "from", so we map it in main router include below using alias via params in client.
    if from_:
        try:
            dt_from = dt.datetime.fromisoformat(from_.replace("Z", "+00:00"))
            query = query.filter(Transaction.created_at >= dt_from)
        except Exception:
            pass
    if to:
        try:
            dt_to = dt.datetime.fromisoformat(to.replace("Z", "+00:00"))
            query = query.filter(Transaction.created_at <= dt_to)
        except Exception:
            pass

    if sort == "oldest":
        query = query.order_by(Transaction.created_at.asc())
    elif sort == "amount_asc":
        query = query.order_by(Transaction.amount.asc())
    elif sort == "amount_desc":
        query = query.order_by(Transaction.amount.desc())
    elif sort == "fraud_desc":
        query = query.order_by(Transaction.fraud_score.desc())
    else:
        query = query.order_by(Transaction.created_at.desc())

    total = query.count()
    page = max(1, page)
    pageSize = max(1, min(100, pageSize))
    items = query.offset((page - 1) * pageSize).limit(pageSize).all()

    return schemas.ListTransactionsOut(
        items=[_tx_out(t) for t in items],
        total=total,
        page=page,
        pageSize=pageSize,
    )


@router.get("/users/{user_id}/transactions/recent", response_model=list[schemas.TransactionOut])
def recent_transactions(
    user_id: str,
    take: int = 5,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    if user_id != current.id and current.role != "admin":
        raise HTTPException(status_code=403, detail="Forbidden")
    take = max(1, min(20, take))
    items = (
        db.query(Transaction)
        .filter(Transaction.user_id == user_id)
        .order_by(Transaction.created_at.desc())
        .limit(take)
        .all()
    )
    return [_tx_out(t) for t in items]


@router.get("/users/{user_id}/fraud-alerts", response_model=list[schemas.FraudAlertOut])
def fraud_alerts(
    user_id: str,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    if user_id != current.id and current.role != "admin":
        raise HTTPException(status_code=403, detail="Forbidden")
    alerts = (
        db.query(FraudAlert)
        .filter(FraudAlert.user_id == user_id)
        .order_by(FraudAlert.created_at.desc())
        .limit(8)
        .all()
    )
    return [
        schemas.FraudAlertOut(
            id=a.id,
            transactionId=a.transaction_id,
            severity=a.severity,  # type: ignore[arg-type]
            message=a.message,
            createdAt=_iso(a.created_at),
        )
        for a in alerts
    ]


# ---------------------------
# Blockchain verify
# ---------------------------
@router.post("/blockchain/verify", response_model=schemas.VerifyOut)
def verify_blockchain(
    payload: schemas.VerifyIn,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    tx = db.get(Transaction, payload.transactionId)
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    if tx.user_id != current.id and current.role != "admin":
        raise HTTPException(status_code=403, detail="Forbidden")
    valid = tx.local_hash == tx.blockchain_hash
    return schemas.VerifyOut(
        transactionId=tx.id,
        localHash=tx.local_hash,
        blockchainHash=tx.blockchain_hash,
        valid=bool(valid),
        timestamp=_iso(tx.blockchain_timestamp),
    )


# ---------------------------
# Admin analytics + user management
# ---------------------------
@router.get("/admin/analytics", response_model=schemas.AdminAnalyticsOut)
def admin_analytics(
    db: Session = Depends(get_db),
    _: User = Depends(require_role("admin")),
):
    all_tx = db.query(Transaction).all()
    total = len(all_tx)
    fraud_cases = sum(1 for t in all_tx if t.fraud_score >= 80)
    fraud_pct = round((fraud_cases / total) * 1000, 1) / 10 if total else 0.0
    avg = round(sum(t.amount for t in all_tx) / total, 2) if total else 0.0

    # daily volume (last 14 days)
    by_day: dict[str, dict[str, float | int]] = defaultdict(lambda: {"count": 0, "amount": 0.0})
    for t in all_tx:
        d = _iso(t.created_at)[:10]
        by_day[d]["count"] = int(by_day[d]["count"]) + 1
        by_day[d]["amount"] = float(by_day[d]["amount"]) + float(t.amount)
    daily = [
        schemas.DailyVolumeItem(date=k, count=int(v["count"]), amount=round(float(v["amount"]), 2))
        for k, v in sorted(by_day.items(), key=lambda kv: kv[0])[-14:]
    ]

    high_risk = sorted(all_tx, key=lambda t: t.fraud_score, reverse=True)[:8]

    stats = schemas.FraudStats(
        low=sum(1 for t in all_tx if t.fraud_score < 40),
        medium=sum(1 for t in all_tx if 40 <= t.fraud_score < 80),
        high=sum(1 for t in all_tx if t.fraud_score >= 80),
    )

    alerts = db.query(FraudAlert).order_by(desc(FraudAlert.created_at)).limit(10).all()
    alert_out = [
        schemas.FraudAlertOut(
            id=a.id,
            transactionId=a.transaction_id,
            severity=a.severity,  # type: ignore[arg-type]
            message=a.message,
            createdAt=_iso(a.created_at),
        )
        for a in alerts
    ]

    return schemas.AdminAnalyticsOut(
        summary=schemas.AdminSummary(
            totalTransactions=total,
            totalFraudCases=fraud_cases,
            fraudPercentage=fraud_pct,
            averageAmount=avg,
        ),
        dailyVolume=daily,
        highRiskTransactions=[_tx_out(t) for t in high_risk],
        fraudStats=stats,
        realTimeAlerts=alert_out,
    )


@router.get("/admin/users", response_model=list[schemas.UserOut])
def admin_users(
    db: Session = Depends(get_db),
    _: User = Depends(require_role("admin")),
):
    users = db.query(User).order_by(User.created_at.desc()).all()
    return [
        schemas.UserOut(id=u.id, name=u.name, email=u.email, role=u.role, status=u.status)  # type: ignore[arg-type]
        for u in users
    ]


@router.patch("/admin/users/{user_id}", response_model=schemas.UserOut)
def admin_update_user(
    user_id: str,
    payload: schemas.UpdateUserStatusIn,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("admin")),
):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.status = payload.status
    db.commit()
    db.refresh(user)
    return schemas.UserOut(id=user.id, name=user.name, email=user.email, role=user.role, status=user.status)  # type: ignore[arg-type]

