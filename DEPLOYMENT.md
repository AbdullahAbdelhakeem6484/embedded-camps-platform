# EmbeddedCamps Platform — Deployment Guide

## One-Time Setup (run on your machine after every schema change)

```bash
cd backend

# 1. Install dependencies (already done)
npm install

# 2. Regenerate Prisma client from the new schema
npx prisma generate

# 3. Create and apply the migration (needs DATABASE_URL in .env)
npx prisma migrate dev --name v2_security_hardening

# 4. Verify TypeScript compiles clean (should be 0 errors after generate)
npx tsc --noEmit

# 5. Build for production
npm run build
```

## Railway (Backend)

1. Create a new Railway project → Add PostgreSQL service
2. Add a Node.js service → connect your GitHub repo, root path: `backend/`
3. Copy all variables from `.env.example` → Railway dashboard → Variables
4. Set `DATABASE_URL` from the PostgreSQL service's "Connect" tab
5. Railway will auto-run: `npx prisma migrate deploy && node dist/server.js`
   (defined in `railway.json` → `startCommand`)

**Build command** (set in Railway):
```
npm install && npx prisma generate && npm run build
```

## Vercel (Frontend)

1. Import the repo → set **Root Directory** to `frontend/`
2. Framework preset: **Next.js**
3. Add environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-railway-backend.up.railway.app
   ```
4. Deploy — the Next.js rewrites proxy `/api/*` to the Railway backend,
   keeping cookies same-domain (solves the Vercel+Railway SameSite cookie issue)

## Environment Variables Checklist

Backend (Railway):
- [ ] `DATABASE_URL` — from Railway PostgreSQL
- [ ] `JWT_SECRET` — 64-char random hex
- [ ] `JWT_REFRESH_SECRET` — different 64-char random hex
- [ ] `ALLOWED_ORIGINS` — your Vercel frontend URL
- [ ] `APP_URL` — your Vercel frontend URL
- [ ] `BUNNY_STORAGE_ZONE`, `BUNNY_STORAGE_API_KEY`, `BUNNY_CDN_URL`, `BUNNY_TOKEN_SECRET`
- [ ] `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`
- [ ] `NODE_ENV=production`

Frontend (Vercel):
- [ ] `NEXT_PUBLIC_API_URL` — Railway backend URL (no trailing slash)

## Generate Secrets

```bash
# JWT secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## First Admin User

After deployment, create the first admin via the Railway shell:
```bash
npx ts-node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const db = new PrismaClient();
db.user.create({ data: {
  name: 'Abdullah',
  email: 'admin@embeddedcamps.com',
  password: bcrypt.hashSync('CHANGE_THIS_PASSWORD', 12),
  role: 'ADMIN',
}}).then(u => { console.log('Admin created:', u.email); process.exit(0); });
"
```
