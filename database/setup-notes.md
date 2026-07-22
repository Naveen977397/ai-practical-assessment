# setup-notes

## Prerequisites

- Node.js 20+
- npm
- **Linux:** `build-essential` (provides `make`, `g++`) — required to compile `better-sqlite3`

On Ubuntu/Debian, install build tools first:

```bash
sudo apt-get update
sudo apt-get install -y build-essential python3
```

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
| JWT_SECRET | min 32 characters | Required for authentication |

Use `.env.example` as template. `.env` is gitignored.

## Troubleshooting

### `npm rebuild better-sqlite3` fails with `not found: make`

Install native build tools, then reinstall:

```bash
sudo apt-get update
sudo apt-get install -y build-essential python3
cd src
rm -rf node_modules
npm install
```

### Login returns 500 / `Module did not self-register`

The SQLite native module was built for a different Node version. After installing build tools:

```bash
cd src
npm rebuild better-sqlite3
# Stop the dev server (Ctrl+C), then:
npm run dev
```

### Login returns "Invalid email or password"

Use a seeded account (password `Password123!`):

- `alice.admin@support.local` (Admin)
- `bob.agent@support.local` (Agent)
- `carol.requester@support.local` (Requester)

Or log in as Admin and create your user under **Users**.

## Tests

```bash
cd src
npm test
```

Integration tests use a separate SQLite file and reset data between tests.
