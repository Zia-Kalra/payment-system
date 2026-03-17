from __future__ import annotations

from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.blockchain_integration.hashing import generate_transaction_hash
from backend.blockchain_integration.web3_integration import BlockchainService
from backend.core.security import get_current_user
from backend.database import get_db
from backend.models.transaction import Transaction
from backend.schemas.transaction import PaymentCreate, PaymentResponse
from backend.services.fraud_service import evaluate_fraud

router = APIRouter(prefix="/payment", tags=["payment"])

blockchain = BlockchainService()


@router.post("", response_model=PaymentResponse)
def process_payment(
    payload: PaymentCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    # simple "recent transactions in 1 minute" counter for rule-based fraud
    one_min_ago = datetime.utcnow() - timedelta(minutes=1)
    recent_count = (
        db.query(Transaction)
        .filter(Transaction.user_id == user.id, Transaction.timestamp >= one_min_ago)
        .count()
    )
    decision = evaluate_fraud(
        amount=payload.amount,
        device_type=payload.device_type,
        location=payload.location,
        recent_tx_count_1m=recent_count,
    )

    tx = Transaction(
        user_id=user.id,
        amount=payload.amount,
        payment_method=payload.payment_method,
        device_type=payload.device_type,
        location=payload.location,
        timestamp=datetime.utcnow(),
        fraud_score=decision.fraud_score,
        fraud_status=decision.fraud_status,
    )
    db.add(tx)
    db.commit()
    db.refresh(tx)

    hash_data = {
        "transaction_id": tx.id,
        "user_id": tx.user_id,
        "amount": tx.amount,
        "payment_method": tx.payment_method,
        "device_type": tx.device_type,
        "location": tx.location,
        "timestamp": tx.timestamp.isoformat(),
    }
    tx_hash = generate_transaction_hash(hash_data)
    tx.transaction_hash = tx_hash

    bc = blockchain.store_transaction_hash(tx.id, tx_hash)
    if bc.success:
        tx.blockchain_tx_id = bc.blockchain_tx_id
        blockchain_status = "verified"
    else:
        blockchain_status = "pending"

    db.commit()
    db.refresh(tx)

    return PaymentResponse(success=True, transaction=tx, blockchain_status=blockchain_status)
