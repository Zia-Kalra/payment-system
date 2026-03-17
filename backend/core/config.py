from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file="backend/.env", env_file_encoding="utf-8")

    app_name: str = "Cloud-Based Payment System"
    jwt_secret_key: str = "CHANGE_ME"
    jwt_algorithm: str = "HS256"
    jwt_access_token_minutes: int = 60 * 24

    # Blockchain (optional; verification/write will be "pending" if missing)
    web3_rpc_url: str | None = None
    web3_private_key: str | None = None
    contract_address: str | None = None
    contract_abi_json: str | None = None  # ABI JSON string (paste from Remix)


settings = Settings()
