## SQLite → PostgreSQL migration guide (Render)

### Why migrate?

- SQLite is a single file and not designed for high concurrency in production.
- PostgreSQL supports concurrent writes, better indexing, backups, and scaling.

### Step-by-step migration plan

#### 1) Add Postgres in Render

Use the included `render.yaml` which defines:

- `payment-system-postgres`

After applying the blueprint, Render will create a Postgres instance and provide a connection string.

#### 2) Configure `DATABASE_URL`

In Render → Backend service → Environment:

- Set `DATABASE_URL` to the Postgres connection string.

Recommended SQLAlchemy URL format:

- `postgresql+psycopg://USER:PASSWORD@HOST:PORT/DBNAME`

#### 3) Create migrations (recommended)

Use Alembic (already included in `backend/requirements.txt`).

Typical steps (once models exist):

```bash
cd backend
alembic init alembic
# edit alembic.ini and env.py to point to DATABASE_URL
alembic revision --autogenerate -m "init"
alembic upgrade head
```

#### 4) Export data from SQLite (if needed)

If you have real data in SQLite, export it:

```bash
sqlite3 backend/payment_system.db .dump > /tmp/sqlite_dump.sql
```

Then import carefully to Postgres. For non-trivial schemas, prefer:

- `pgloader` (best for sqlite→postgres)
- custom ETL script (Python)

Example pgloader:

```bash
pgloader backend/payment_system.db "$DATABASE_URL"
```

#### 5) Verify schema and data

- Confirm tables exist in Postgres
- Run backend `/health` and any critical API flows
- Verify indexes for common queries

### Rollback strategy

- Take a backup of Postgres before major imports
- If import fails, restore backup and retry

