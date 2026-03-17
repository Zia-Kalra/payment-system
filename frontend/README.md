# Payment System Frontend (React)

React + Vite + Tailwind + React Router + Axios frontend for a payment system UI featuring **fraud detection** and **blockchain verification**.

## Run locally

```bash
cd frontend
npm install
npm run dev
```

## Demo mode (default)

This app runs with an in-browser **mock API** by default (stored in `localStorage`), so you can use it immediately without a backend.

- **User**: `user@payments.local` / `User@1234`
- **Admin**: `admin@payments.local` / `Admin@1234`

## Environment variables

Create `frontend/.env` to connect to a real backend:

```bash
VITE_API_MOCK=false
VITE_API_BASE_URL=http://localhost:8000
```

## Pages

- Login / Registration
- User Dashboard
- Payment Processing (fraud score + blockchain badge)
- Transaction History (search + filter + sort + pagination)
- Admin Dashboard (analytics + chart + high-risk list + user management + alerts)
- Blockchain Verification (hash comparison + copy)

