## Presentation-ready content (3–5 slides)

### Slide 1 — What we built

- Payment system web app with fraud detection and blockchain verification
- React (Vite) frontend with dashboards and transaction flows
- FastAPI backend for APIs, auth, fraud scoring, and blockchain verification
- Postgres for production persistence (migrated from SQLite)

### Slide 2 — Cloud architecture

- Frontend hosted on **Vercel** (CDN, HTTPS, fast deploys)
- Backend hosted on **Render** (FastAPI service + managed Postgres)
- Blockchain verification via **Ethereum Sepolia** (JSON-RPC provider)
- Secure environment variables stored in platform dashboards

### Slide 3 — Why Render + Vercel

- Render:
  - Simple GitHub deploys
  - Managed Postgres
  - Automatic HTTPS
- Vercel:
  - Best-in-class React/Vite hosting
  - Preview deployments
  - Global CDN and automatic HTTPS

### Slide 4 — Security measures

- HTTPS everywhere (Render + Vercel)
- CORS restricted to known frontend domains
- JWT secrets stored in Render env vars (not committed)
- Rate limiting on backend
- Security headers (HSTS, nosniff, frame deny, etc.)

### Slide 5 — Scalability plan

- Horizontal scale backend instances as traffic increases
- Postgres optimization: indexes, pooling, replicas
- Add Redis for caching + shared rate limiting
- Queue background jobs for heavy blockchain operations

