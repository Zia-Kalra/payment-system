## Post-deployment verification checklist

### Backend (Render)

- [ ] Backend API accessible at `https://your-backend.onrender.com`
- [ ] `GET /` returns 200 with JSON
- [ ] `GET /health` returns 200
- [ ] Render logs show no startup errors
- [ ] CORS configured (frontend domain allowed)
- [ ] JWT secret is set (not default)
- [ ] Database URL is set to Postgres (production)

### Frontend (Vercel)

- [ ] Frontend loads at `https://your-frontend.vercel.app`
- [ ] Refreshing a deep link (e.g. `/dashboard`) does not 404 (SPA rewrites)
- [ ] Environment variables are set in Vercel
- [ ] Frontend points to backend URL (`VITE_API_BASE_URL`)

### End-to-end functional checks

- [ ] Login works from the frontend
- [ ] Registration works
- [ ] Payment submission works
- [ ] Fraud detection returns a score
- [ ] Blockchain verification shows a badge
- [ ] Transaction history loads (search/filter/sort/paginate)
- [ ] Admin dashboard loads analytics and alerts

### Security checks

- [ ] HTTPS enforced (no mixed content)
- [ ] CORS is restricted to known domains
- [ ] Security headers present on backend responses
- [ ] Rate limiting returns 429 when spammed

