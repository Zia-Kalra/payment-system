## Cost estimation (Render + Vercel)

### Render

- **Free tier**
  - Good for demos and small projects
  - Can sleep on inactivity (slower cold starts)
  - Limited compute
- **Paid tiers**
  - Better reliability and performance
  - Higher limits and scaling options

**When to upgrade**
- You need always-on backend (no sleeping)
- You see timeouts or slow performance under load
- You need stronger Postgres features (larger storage, backups)

### Vercel

- **Free tier**
  - Great for personal projects and demos
  - Preview deployments
- **Paid tiers**
  - Team features
  - Higher limits, advanced analytics, more bandwidth

### Cost optimization tips

- Keep mock mode for development
- Use caching (Redis) before upgrading DB aggressively
- Reduce log verbosity in production
- Turn on compression and CDN caching for static assets

