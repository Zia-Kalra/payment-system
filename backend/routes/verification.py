from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.blockchain_integration.hashing import generate_transaction_hash
from backend.blockchain_integration.verification import BlockchainVerification
from backend.blockchain_integration.web3_integration import BlockchainService
from backend.core.security import get_current_user
from backend.database import get_db
from backend.models.transaction import Transaction

router = APIRouter(prefix="/verify", tags=["verification"])

blockchain = BlockchainService()
verifier = BlockchainVerification(blockchain)


@router.get("/transaction/{transaction_id}")
def verify_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    _user=Depends(get_current_user),
):
    tx = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    current_data = {
        "transaction_id": tx.id,
        "user_id": tx.user_id,
        "amount": tx.amount,
        "payment_method": tx.payment_method,
        "device_type": tx.device_type,
        "location": tx.location,
        "timestamp": tx.timestamp.isoformat(),
    }
    current_hash = generate_transaction_hash(current_data)
    result = verifier.verify_transaction(tx.id, current_hash)

    return {
        "transaction_id": tx.id,
        "verified": result.verified,
        "status": result.status,
        "database_hash": tx.transaction_hash,
        "current_hash": current_hash,
        "blockchain_hash": result.stored_hash,
        "error": result.error,
    }
