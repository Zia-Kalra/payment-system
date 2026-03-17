## Cloud architecture (Render + Vercel + Sepolia)

### Mermaid diagram

```mermaid
flowchart LR
  U[User Browser] -->|HTTPS| V[Vercel: React (Vite) Frontend]
  V -->|HTTPS + JWT| R[Render: FastAPI Backend]
  R -->|SQL over TLS| P[(Render PostgreSQL)]
  R -->|JSON-RPC HTTPS| S[Sepolia Ethereum RPC]
  R -->|Tx / Events| B[(Sepolia Testnet)]

  subgraph Observability
    RL[Render Logs]
    VL[Vercel Logs/Analytics]
  end

  R --> RL
  V --> VL
```

### Components explained (beginner-friendly)

- **Frontend (Vercel)**:
  - **What it is**: Static files (HTML/CSS/JS) served from a CDN.
  - **Why Vercel**: Excellent for React/Vite, global CDN, automatic HTTPS, easy env vars, preview deployments per PR.
  - **What it does**: UI + routing + calls backend APIs.

- **Backend (Render)**:
  - **What it is**: Python FastAPI web service running behind Render’s proxy.
  - **Why Render**: Simple deployment from GitHub, built-in HTTPS, easy environment variables, supports managed Postgres.
  - **What it does**: Auth (JWT), fraud scoring, blockchain verification, database APIs.

- **Database (PostgreSQL on Render)**:
  - **What it is**: Managed database for production durability.
  - **Why**: SQLite is a single-file DB (good for dev), but Postgres is built for concurrent production traffic.

- **Blockchain (Sepolia)**:
  - **What it is**: Ethereum test network.
  - **How used**: backend stores or verifies hashes/transaction proofs via JSON-RPC provider (Infura/Alchemy/etc).

### How everything connects

- Browser loads the frontend from **Vercel** (HTTPS)
- Frontend calls FastAPI on **Render** (HTTPS)
- Backend:
  - validates JWT
  - reads/writes to **Postgres**
  - calls **Sepolia RPC** to store/verify hashes (tamper detection)

