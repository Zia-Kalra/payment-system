from __future__ import annotations

import logging
import time

import httpx
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from starlette.responses import JSONResponse

from .config import settings
from .database import db_ping
from .database import engine
from .models import Base
from .middleware.https_redirect import ForceHTTPSMiddleware
from .middleware.security_headers import SecurityHeadersMiddleware
from .seed import seed_default_users
from .database import SessionLocal
from .api import router as api_router

app = FastAPI(
    title="Cloud-Based Payment System",
    version="0.1.0"
)


# ---------------------------
# Logging
# ---------------------------
logging.basicConfig(
    level=getattr(logging, settings.log_level.upper(), logging.INFO),
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)
logger = logging.getLogger("payment-system")


# ---------------------------
# Rate limiting (basic)
# ---------------------------
limiter = Limiter(key_func=get_remote_address, default_limits=["200/minute"])
app.state.limiter = limiter


@app.exception_handler(RateLimitExceeded)
def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(status_code=429, content={"detail": "Rate limit exceeded"})


# ---------------------------
# Middleware: CORS + security
# ---------------------------
origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(SecurityHeadersMiddleware)

if settings.environment.lower() == "production":
    app.add_middleware(ForceHTTPSMiddleware)

@app.on_event("startup")
def on_startup():
    # Create tables (for demo/dev). For production, prefer Alembic migrations.
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_default_users(db)
    finally:
        db.close()


@app.middleware("http")
async def request_timing(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    ms = int((time.perf_counter() - start) * 1000)
    response.headers["X-Response-Time-ms"] = str(ms)
    return response


@app.get("/")
def root():
    return {"message": "Payment System Backend is running successfully 🚀"}

app.include_router(api_router)


@app.get("/health")
@limiter.limit("30/minute")
async def health(request: Request):
    """
    Health check for Render + monitoring.
    Checks:
    - API process is alive
    - Database connectivity
    - Optional: Sepolia RPC reachability
    """
    db_ok = db_ping()

    chain_ok = None
    if settings.sepolia_rpc_url:
        try:
            async with httpx.AsyncClient(timeout=6) as client:
                # JSON-RPC ping: eth_chainId
                res = await client.post(
                    settings.sepolia_rpc_url,
                    json={"jsonrpc": "2.0", "id": 1, "method": "eth_chainId", "params": []},
                    headers={"Content-Type": "application/json"},
                )
                chain_ok = res.status_code == 200
        except Exception:
            chain_ok = False

    status = "ok" if db_ok and (chain_ok is not False) else "degraded"
    code = 200 if status == "ok" else 503
    return JSONResponse(
        status_code=code,
        content={
            "status": status,
            "environment": settings.environment,
            "db": {"ok": db_ok},
            "blockchain": {"configured": bool(settings.sepolia_rpc_url), "ok": chain_ok},
        },
    )