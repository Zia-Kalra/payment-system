from __future__ import annotations

import logging

from fastapi import FastAPI

from backend.database import Base, engine
from backend.routes.auth import router as auth_router
from backend.routes.payment import router as payment_router
from backend.routes.verification import router as verification_router

logging.basicConfig(level=logging.INFO)

app = FastAPI(title="Cloud-Based Payment System", version="0.1.0")

Base.metadata.create_all(bind=engine)

app.include_router(auth_router)
app.include_router(payment_router)
app.include_router(verification_router)


@app.get("/")
def root():
    return {"message": "Payment System Backend is running successfully"}