from __future__ import annotations

import hashlib
import json
from typing import Any


def generate_transaction_hash(data: dict[str, Any]) -> str:
    """
    Deterministic SHA-256 over transaction fields.
    Sort keys to ensure stable hashing across runs.
    """
    payload = json.dumps(data, sort_keys=True, separators=(",", ":"), ensure_ascii=False)
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()
