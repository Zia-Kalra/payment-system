## Security setup (production-ready baseline)

### 1) Backend security (FastAPI on Render)

#### Rate limiting

Implemented in `backend/app/main.py` using **SlowAPI**:

- Default: `200/minute`
- `/health`: `30/minute`

For higher scale, migrate rate limit storage to Redis so limits are shared across instances.

#### CORS configuration

Configured in `backend/app/main.py`:

- Controlled by `CORS_ORIGINS` env var (comma-separated)
- In production, set this to your Vercel domain(s) only:
  - `https://your-frontend.vercel.app`

#### Security headers

Implemented with `SecurityHeadersMiddleware`:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: no-referrer`
- `Permissions-Policy: ...`
- `Strict-Transport-Security` (HSTS) for production

#### Production logging

Configured in `backend/app/main.py` via `logging.basicConfig(...)`.

Best practices:

- Use `LOG_LEVEL=INFO` in production
- Avoid logging secrets (JWTs, private keys, passwords)
- Prefer structured logging later (e.g., JSON logs) for better querying

### 2) HTTPS configuration

#### Vercel

- HTTPS is automatic for `*.vercel.app` and custom domains.
- TLS certificates are managed by Vercel.

#### Render

- HTTPS is automatic for `*.onrender.com` and custom domains.
- Render terminates TLS at the edge and forwards traffic to your service.

#### Force HTTPS redirects

In `backend/app/main.py`, `ForceHTTPSMiddleware` redirects when:

- `ENVIRONMENT=production`
- `X-Forwarded-Proto` is `http`

### 3) JWT security (recommended production settings)

#### Expiration times

Recommended:

- **Access token**: 10–15 minutes (`ACCESS_TOKEN_EXPIRE_MINUTES=15`)
- **Refresh token**: 7–30 days (`REFRESH_TOKEN_EXPIRE_DAYS=7`)

Why:

- Short access tokens reduce risk if stolen
- Refresh tokens reduce user friction

#### Refresh token mechanism (implementation guidance)

Production-ready pattern:

1. On login, issue:
   - access token (JWT)
   - refresh token (JWT or opaque random string)
2. Store refresh token server-side (DB or Redis) with:
   - user_id
   - expiry
   - revoked flag
3. On `/auth/refresh`:
   - validate refresh token
   - rotate refresh token (invalidate old, issue new)
4. On logout:
   - revoke refresh token

#### Secure storage recommendations (frontend)

Best practice is **HttpOnly cookies** for refresh tokens.

In our current frontend:

- JWT is stored in `localStorage` (simple demo)
- For high-security production, move to:
  - access token in memory
  - refresh token in HttpOnly secure cookie

### 4) Secret key protection

- Never commit `.env`
- Use Render/Vercel env var storage
- Rotate secrets if leaked
- Restrict access to env var views in dashboards

