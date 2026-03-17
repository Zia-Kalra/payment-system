## Render deployment (FastAPI backend)

This guide deploys the FastAPI backend to **Render** using the included `render.yaml`.

### Prerequisites

- A GitHub repo containing this project
- A Render account

### What’s already prepared in this repo

- **Backend runtime**: `backend/runtime.txt`
- **Dependencies**: `backend/requirements.txt`
- **Render IaC**: `render.yaml` (service + Postgres)
- **Health endpoint**: `GET /health` in `backend/app/main.py`
- **CORS + security headers + rate limiting**: `backend/app/main.py` + middleware

### Step-by-step: Deploy to Render

#### 1) Push to GitHub

```bash
git add .
git commit -m "chore: prepare backend for Render"
git push origin HEAD
```

#### 2) Create the Render services from `render.yaml`

1. In Render, go to **Dashboard → New + → Blueprint**
2. Connect your GitHub account (if not already connected)
3. Select your repo and choose the branch you want to deploy
4. Render will detect `render.yaml` and propose:
   - `payment-system-backend` (web service)
   - `payment-system-postgres` (Postgres)
5. Click **Apply**

#### 3) Set environment variables (Render dashboard)

In Render, open the backend service → **Environment**.

Set these variables (copy/paste from `backend/.env.example`):

- **CORS_ORIGINS**: your Vercel domain(s)
  - Example: `https://your-frontend.vercel.app`
- **JWT_SECRET_KEY**: set a long random secret (or keep `generateValue: true` in `render.yaml`)
- **DATABASE_URL**:
  - If you attached the Render Postgres from the blueprint, map `DATABASE_URL` to the database connection string.
- **SEPOLIA_RPC_URL**: optional (only if you want health to check Sepolia RPC)

Then click **Save Changes**. Render will redeploy automatically.

#### 4) Get your backend URL

In your backend service page, you’ll see a URL like:

- `https://payment-system-backend.onrender.com`

Copy it; you will use it in the Vercel frontend as `VITE_API_BASE_URL`.

#### 5) Verify deployment

Open these in your browser:

- `GET /` → should return a JSON message
- `GET /health` → should return `200` (or `503` if DB/chain checks are failing)

Example:

- `https://payment-system-backend.onrender.com/health`

### Common Render issues

- **Build fails**: check **Logs → Build logs**. Most common cause is missing dependencies or Python version mismatch.
- **CORS errors**: ensure `CORS_ORIGINS` includes your Vercel domain exactly (no trailing slash).
- **503 on /health**:
  - DB is unreachable or `DATABASE_URL` is wrong
  - Sepolia RPC is configured but unreachable

