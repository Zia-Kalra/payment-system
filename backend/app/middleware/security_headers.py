from __future__ import annotations

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Adds baseline security headers.
    Adjust CSP to your needs if you later serve HTML from the backend.
    """

    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)

        response.headers.setdefault("X-Content-Type-Options", "nosniff")
        response.headers.setdefault("X-Frame-Options", "DENY")
        response.headers.setdefault("Referrer-Policy", "no-referrer")
        response.headers.setdefault("Permissions-Policy", "geolocation=(), microphone=(), camera=()")

        # HSTS should only be enabled when you are sure HTTPS is always used.
        # Render terminates TLS at the edge, so this is safe in production.
        # 31536000s = 1 year.
        response.headers.setdefault("Strict-Transport-Security", "max-age=31536000; includeSubDomains")

        return response

