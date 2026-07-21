# setup-notes

## Prerequisites

- Node.js 20+
- npm

## Setup

```bash
cd src
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — redirects to `/tickets`.

## Database

- **Provider:** SQLite
- **Dev database:** `src/dev.db` (gitignored)
- **Test database:** `src/test.db` (gitignored, used by integration tests)
- **Schema:** [`src/prisma/schema.prisma`](../src/prisma/schema.prisma)
- **Migrations:** `src/prisma/migrations/` (copy referenced in `database/schema-or-migrations/`)

## Seed Data

The seed script creates **3 users only** (no tickets or comments):

| Name | Email | Role |
|------|-------|------|
| Alice Admin | alice.admin@support.local | Admin |
| Bob Agent | bob.agent@support.local | Agent |
| Carol Requester | carol.requester@support.local | Requester |

Reference copy: [`database/seed-data/users.json`](seed-data/users.json)

Re-run seed: `npx prisma db seed` (from `src/`) — uses upsert by email, safe to re-run.

## Environment Variables

| Variable | Example | Notes |
|----------|---------|-------|
| DATABASE_URL | `file:./dev.db` | Required; never commit real secrets |

Use `.env.example` as template. `.env` is gitignored.

## Tests

```bash
cd src
npm test
```

Integration tests use a separate SQLite file and reset data between tests.
