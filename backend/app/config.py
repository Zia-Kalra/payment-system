from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Centralized config for dev/staging/prod.
    Render injects env vars; local dev can use backend/.env.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # App
    environment: str = "development"
    log_level: str = "INFO"
    cors_origins: str = "http://localhost:5173"

    # JWT
    jwt_secret_key: str = "change_me"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7

    # DB
    database_url: str = "sqlite:///./payment_system.db"

    # Blockchain
    sepolia_rpc_url: str | None = None
    blockchain_contract_address: str | None = None
    blockchain_contract_abi_path: str | None = None
    wallet_private_key: str | None = None


settings = Settings()

