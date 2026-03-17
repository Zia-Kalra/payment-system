## Scalability plan

### What “scaling” means

- **Vertical scaling**: make a single server bigger (more CPU/RAM).
- **Horizontal scaling**: add more servers and load-balance traffic.

### 1,000 users vs 1,000,000 users (what changes)

#### At ~1,000 users

- One backend instance may be enough
- Postgres on a small plan is typically fine
- Basic monitoring + logs are sufficient

#### At ~1,000,000 users

- You need multiple backend instances (horizontal)
- Database becomes the bottleneck: optimize queries, add indexes, consider read replicas
- Add caching and queues for asynchronous work
- Use CDN aggressively for static assets (Vercel does this)

### Backend scaling (FastAPI on Render)

- **Gunicorn workers**:
  - Start with \(2\) workers for small plans; increase as CPU allows.
  - Typical formula: \(workers \approx (2 \times CPU) + 1\)
- **Horizontal scaling**:
  - Add more instances and place them behind the platform’s load balancing
- **Async**:
  - Keep I/O operations async (HTTP calls to Sepolia, DB pool, etc.)

### Database scaling strategies (PostgreSQL)

- **Indexes**: add indexes for common filters (user_id, created_at, status).
- **Connection pooling**:
  - Use reasonable pool sizes and keep transactions short.
- **Read replicas**:
  - Read-heavy analytics can hit replicas.
- **Partitioning**:
  - Partition large transaction tables by date or user_id for very large datasets.

### Caching recommendations (Redis)

Add Redis when:

- You need faster reads (dashboard summaries)
- You need rate limiting at scale (shared counters across instances)
- You need session/refresh token storage or background job queues

Common caches:

- Recent transactions
- Fraud alert counts
- Admin analytics aggregates (daily volume)

### Load balancing concepts (simple explanation)

- A load balancer routes traffic across multiple backend instances.
- Health checks remove unhealthy instances.
- Sticky sessions are usually not needed if auth is JWT-based.

