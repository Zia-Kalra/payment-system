## Environment variables management (dev / staging / prod)

### Where env vars live

- **Local development**
  - Backend: `backend/.env` (copy from `backend/.env.example`)
  - Frontend: `frontend/.env` or `.env.development` (copy from `frontend/.env.development.example`)
- **Production**
  - Backend: Render → Service → **Environment**
  - Frontend: Vercel → Project → **Settings → Environment Variables**

### Dev vs Staging vs Prod (recommended)

- **Development**
  - Local machine
  - Mock mode allowed
  - Debug logging
- **Staging**
  - Same as production architecture but smaller
  - Used for final testing
  - Safe to use Sepolia
- **Production**
  - Real user traffic
  - Strong secrets
  - Strict CORS
  - Postgres only

### Best practices (secrets)

- Never commit `.env`
- Use unique secrets per environment (dev/staging/prod)
- Use long random JWT secret keys (64+ bytes)
- Restrict who can view env vars in Render/Vercel

### Key rotation (if compromised)

#### JWT secret rotation plan

1. Generate a new secret
2. Deploy backend with support for “current” and “previous” secrets (grace period)
3. Rotate secrets in Render env vars
4. Force users to re-login if needed

#### Blockchain private key rotation

1. Create a new wallet
2. Update `WALLET_PRIVATE_KEY` in Render
3. Move any required funds from old wallet to new wallet
4. Revoke old key access

### Validation checklist

- Backend `/health` is 200
- Frontend loads and can call backend
- CORS allows only expected origins
- Secrets are set (not defaults)

