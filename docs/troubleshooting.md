## Troubleshooting guide (common issues)

### Backend not responding (Render)

**Symptoms**
- Render shows “Deploy succeeded” but requests time out

**Fix**
- Check Render logs (service → Logs)
- Ensure start command is correct:
  - `gunicorn -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:$PORT`
- Confirm `healthCheckPath` is `/health`

### CORS errors

**Symptoms**
- Browser console: “CORS policy blocked…”

**Fix**
- On Render, set `CORS_ORIGINS` to include your Vercel domain exactly:
  - `https://your-frontend.vercel.app`
- Redeploy backend after changing env vars

### Database connection failed

**Symptoms**
- `/health` returns 503 and `db.ok=false`

**Fix**
- Ensure `DATABASE_URL` is set to the Render Postgres connection string
- Make sure your backend can reach the database (same Render region recommended)

### Environment variables not loading

**Render**
- Env vars are in service → Environment → Save Changes triggers deploy

**Vercel**
- Env vars require a redeploy:
  - Deployments → Redeploy

### Blockchain connection failed

**Symptoms**
- `/health` shows blockchain configured but `ok=false`

**Fix**
- Verify `SEPOLIA_RPC_URL` is correct
- Test it locally:
  - `curl -X POST "$SEPOLIA_RPC_URL" -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":1,"method":"eth_chainId","params":[]}'`

### JWT token invalid / session expired

**Fix**
- Ensure Render `JWT_SECRET_KEY` is set and consistent across deploys
- Ensure frontend is using the correct backend URL and auth endpoints

### Build failing on Render/Vercel

**Render**
- Confirm `backend/requirements.txt` has only required dependencies
- Confirm `backend/runtime.txt` uses supported Python

**Vercel**
- Root directory must be `frontend`
- Output directory must be `dist`
- `vercel.json` must contain SPA rewrites

