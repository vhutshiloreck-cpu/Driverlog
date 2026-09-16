# DriverLog deployment

## Database and auth

The production data layer uses PostgreSQL with Drizzle ORM. Authentication uses email/password accounts, bcrypt password hashes, and secure HTTP-only database-backed sessions.

1. Create a PostgreSQL database (Neon, Supabase, or Vercel Postgres).
2. Copy `.env.example` to `.env.local`.
3. Set `DATABASE_URL`.
4. Install dependencies and generate/apply the schema:

```bash
npm install
npm run db:generate
npm run db:migrate
npm run dev
```

Auth endpoints:

- `POST /api/auth/register` with `{ email, password, displayName }`
- `POST /api/auth/login` with `{ email, password }`
- `GET /api/auth/me`
- `DELETE /api/auth/me`

## Vercel

The repo is ready to import into Vercel. In the Vercel project settings, add:

- `DATABASE_URL`
- `NEXT_PUBLIC_APP_URL` set to the deployed URL

Then deploy from the `main` branch. Vercel automatically detects Next.js and runs the build script.

The deployment cannot be completed from this repository integration because Vercel project creation, database provisioning, domain selection, and secret entry require access to your Vercel account.
