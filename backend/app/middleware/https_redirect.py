from __future__ import annotations

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import RedirectResponse, Response


class ForceHTTPSMiddleware(BaseHTTPMiddleware):
    """
    Forces HTTPS by redirecting http -> https.

    Render sits behind a proxy and sets X-Forwarded-Proto.
    We only enable this in production.
    """

    async def dispatch(self, request: Request, call_next):
        proto = request.headers.get("x-forwarded-proto")
        if proto == "http":
            url = request.url.replace(scheme="https")
            return RedirectResponse(url=str(url), status_code=308)
        response: Response = await call_next(request)
        return response

