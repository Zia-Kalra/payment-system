## Cloud storage benefits (and how we use it)

### What “cloud storage” means in this project

We use multiple “storage” types:

- **Database storage (Render Postgres)**: persistent storage for users, transactions, fraud alerts, hashes.
- **Object storage (optional)**: for receipts, CSV exports, audit attachments (S3-like storage).
- **Blockchain storage (Sepolia)**: tamper-evident record of hashes (not for large files).

### Benefits for our payment system

- **Durability**: managed databases replicate data and reduce risk of local disk loss.
- **Availability**: storage survives app restarts/deploys.
- **Backups**: providers offer snapshots and point-in-time restore (depending on plan).
- **Scalability**: easier upgrades and scaling options vs SQLite local file.

### Data persistence strategy

- **Source of truth**: Postgres
- **Tamper evidence**: store hash (or hash of transaction payload) on Sepolia
- **Performance**: cache computed aggregates (e.g. daily volume) in Redis (recommended for scale)

### Backup and recovery (high-level)

- Schedule automated DB backups (daily)
- Test restore process monthly
- Verify backups by restoring to a staging DB and running health checks

