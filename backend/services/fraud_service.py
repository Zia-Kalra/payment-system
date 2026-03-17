from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class FraudDecision:
    fraud_score: int
    fraud_status: str  # Safe / Medium / Suspicious


def evaluate_fraud(*, amount: float, device_type: str, location: str, recent_tx_count_1m: int) -> FraudDecision:
    """
    Rule-based fraud scoring (simple MVP from PDF).
    """
    score = 0

    # Rule 1: High amount
    if amount > 50_000:
        score += 60
    elif amount > 10_000:
        score += 25

    # Rule 2: Too many transactions quickly
    if recent_tx_count_1m >= 3:
        score += 30

    # Rule 3: Very rough device/location heuristics (MVP)
    if device_type.lower() not in {"mobile", "laptop"}:
        score += 10
    if len(location.strip()) < 3:
        score += 10

    if score >= 70:
        status = "Suspicious"
    elif score >= 30:
        status = "Medium"
    else:
        status = "Safe"

    return FraudDecision(fraud_score=score, fraud_status=status)
