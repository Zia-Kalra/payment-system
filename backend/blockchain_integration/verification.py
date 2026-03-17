from __future__ import annotations

from dataclasses import dataclass

from backend.blockchain_integration.web3_integration import BlockchainService


@dataclass(frozen=True)
class VerificationResult:
    verified: bool
    status: str
    stored_hash: str | None = None
    error: str | None = None


class BlockchainVerification:
    def __init__(self, blockchain: BlockchainService) -> None:
        self.blockchain = blockchain

    def verify_transaction(self, transaction_id: int, current_hash: str) -> VerificationResult:
        record = self.blockchain.get_transaction_hash(transaction_id)
        if not record.get("exists"):
            return VerificationResult(verified=False, status="Not Registered", error=record.get("error"))

        stored_hash = record.get("transaction_hash")
        is_valid = stored_hash == current_hash
        return VerificationResult(
            verified=is_valid,
            status="Valid" if is_valid else "Tampered",
            stored_hash=stored_hash,
        )
