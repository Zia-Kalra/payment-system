## Rollback procedures

### Backend rollback (Render)

#### Option A: Rollback via Render UI (recommended)

1. Render → your backend service → **Deploys**
2. Find a previously successful deploy
3. Click **Rollback**
4. Verify:
   - `GET /health` returns 200
   - Critical flows work

#### Option B: Rollback by git revert

```bash
git revert <bad_commit_sha>
git push origin main
```

Render will redeploy the reverted commit.

### Frontend rollback (Vercel)

1. Vercel → project → **Deployments**
2. Select the last known good deployment
3. Click **Promote to Production** (or redeploy that commit)

### Database rollback strategy

Databases are hard to rollback safely. Best practice is:

- Use migrations (Alembic) with **up** and **down** steps when possible
- Use backups/snapshots before major schema changes
- For emergencies:
  - Restore backup to a new database
  - Point the backend to the restored DB
  - Verify data integrity

