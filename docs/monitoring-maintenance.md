## Monitoring & maintenance

### Health checks

Backend exposes:

- `GET /health`

It checks:

- Database connectivity
- Optional Sepolia RPC connectivity (if `SEPOLIA_RPC_URL` is set)

Render uses `/health` as a health check path (see `render.yaml`).

### Logging

#### Where logs are stored

- **Render**: Service → Logs (runtime + deploy logs)
- **Vercel**: Project → Deployments → Logs

#### What to watch

- 5xx spikes (backend errors)
- 401 spikes (auth/session issues)
- timeouts to Sepolia RPC
- slow response times (see `X-Response-Time-ms`)

### Metrics & alerts (recommended thresholds)

- **Error rate**: alert if > 1% 5xx over 5 minutes
- **Latency**: alert if p95 > 1–2s for API routes
- **DB failures**: alert if `/health` returns 503
- **RPC failures**: alert if blockchain checks fail consistently

### Backup strategy (Postgres)

Minimum viable plan:

- Daily backups / snapshots (provider feature or manual)
- Monthly restore drill (restore to staging DB)
- Verify restore by running `/health` and basic flows

### Maintenance tasks (weekly/monthly)

Weekly:

- Review logs for errors
- Check deploys for regressions

Monthly:

- Rotate secrets (or validate rotation plan)
- Restore drill (backup verification)
- Dependency update review

