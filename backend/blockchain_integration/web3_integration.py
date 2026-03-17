from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Any

from web3 import Web3

from backend.core.config import settings


@dataclass(frozen=True)
class BlockchainResult:
    success: bool
    blockchain_tx_id: str | None = None
    error: str | None = None


class BlockchainService:
    """
    Minimal Web3 service for:
    - storeTransactionHash(transactionId, txHash)
    - getTransactionHash(transactionId) -> (hash, timestamp)

    If blockchain config is missing, methods fail gracefully (success=False).
    """

    def __init__(self) -> None:
        self._w3 = None
        self._contract = None
        self._account = None

        if not (settings.web3_rpc_url and settings.web3_private_key and settings.contract_address and settings.contract_abi_json):
            return

        w3 = Web3(Web3.HTTPProvider(settings.web3_rpc_url))
        if not w3.is_connected():
            return

        abi = json.loads(settings.contract_abi_json)
        contract = w3.eth.contract(address=Web3.to_checksum_address(settings.contract_address), abi=abi)
        acct = w3.eth.account.from_key(settings.web3_private_key)

        self._w3 = w3
        self._contract = contract
        self._account = acct

    def configured(self) -> bool:
        return self._w3 is not None and self._contract is not None and self._account is not None

    def store_transaction_hash(self, transaction_id: int, tx_hash: str) -> BlockchainResult:
        if not self.configured():
            return BlockchainResult(success=False, error="Blockchain not configured")
        try:
            w3: Web3 = self._w3  # type: ignore[assignment]
            contract = self._contract
            acct = self._account

            nonce = w3.eth.get_transaction_count(acct.address)
            txn = contract.functions.storeTransactionHash(str(transaction_id), tx_hash).build_transaction(
                {
                    "from": acct.address,
                    "nonce": nonce,
                    "gas": 250000,
                    "maxFeePerGas": w3.to_wei("30", "gwei"),
                    "maxPriorityFeePerGas": w3.to_wei("2", "gwei"),
                }
            )
            signed = acct.sign_transaction(txn)
            txid = w3.eth.send_raw_transaction(signed.rawTransaction)
            return BlockchainResult(success=True, blockchain_tx_id=txid.hex())
        except Exception as e:  # noqa: BLE001
            return BlockchainResult(success=False, error=str(e))

    def get_transaction_hash(self, transaction_id: int) -> dict[str, Any]:
        if not self.configured():
            return {"exists": False, "error": "Blockchain not configured"}
        try:
            contract = self._contract
            stored_hash, ts = contract.functions.getTransactionHash(str(transaction_id)).call()
            if not stored_hash:
                return {"exists": False}
            return {"exists": True, "transaction_hash": stored_hash, "timestamp": ts}
        except Exception as e:  # noqa: BLE001
            return {"exists": False, "error": str(e)}
