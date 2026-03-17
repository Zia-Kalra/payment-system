## Vercel deployment (React + Vite frontend)

This guide deploys the `frontend/` React app to **Vercel**.

### Prerequisites

- A GitHub repo containing this project
- A Vercel account
- Your backend deployed on Render (recommended) so you have a backend URL

### What’s already prepared in this repo

- `frontend/vercel.json` for SPA routing
- Vite env templates:
  - `frontend/.env.development.example`
  - `frontend/.env.production.example`
- API base URL configuration in `frontend/src/services/env.ts`

### Step-by-step: Deploy to Vercel

#### 1) Push to GitHub

```bash
git add .
git commit -m "chore: prepare frontend for Vercel"
git push origin HEAD
```

#### 2) Import project into Vercel

1. Go to Vercel → **Add New… → Project**
2. Import your GitHub repo
3. **Root Directory**: set to `frontend`
4. Framework preset: **Vite**
5. Build command: `npm run build`
6. Output directory: `dist`
7. Click **Deploy**

#### 3) Configure environment variables in Vercel

In Vercel → Project → **Settings → Environment Variables** add:

- `VITE_API_MOCK` = `false`
- `VITE_API_BASE_URL` = your Render backend URL
  - Example: `https://payment-system-backend.onrender.com`

Redeploy after saving env vars:

- Deployments → pick latest → **Redeploy**

#### 4) Verify frontend-backend connectivity

1. Open the deployed frontend URL (e.g. `https://your-app.vercel.app`)
2. Login/register
3. If you disabled mock mode, the frontend will call:
   - `VITE_API_BASE_URL/auth/login`
   - `VITE_API_BASE_URL/transactions`
   - etc.

If your backend doesn’t have these endpoints yet, keep `VITE_API_MOCK=true` until backend routes exist.

### Fixing common issues

- **404 on refresh**: make sure `frontend/vercel.json` exists (SPA rewrite).
- **CORS error**: set backend `CORS_ORIGINS` to include your Vercel URL.
- **Env vars not taking effect**: Vercel env vars require a redeploy.

