# README

Support Ticket Management System — AI Capability Assessment (Core).

## Quick Start

```bash
cd src
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

## Scripts (from `src/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run integration tests |

## Documentation

| Document | Purpose |
|----------|---------|
| [`requirements-analysis.md`](requirements-analysis.md) | Functional and non-functional requirements |
| [`acceptance-criteria.md`](acceptance-criteria.md) | Testable acceptance criteria |
| [`implementation-plan.md`](implementation-plan.md) | Development phases |
| [`data-model.md`](data-model.md) | Entity definitions |
| [`api-contract.md`](api-contract.md) | REST API specification |
| [`ui-flow.md`](ui-flow.md) | Screen flows |
| [`database/setup-notes.md`](database/setup-notes.md) | Database setup |

## Core Features

- Create, list, view, and update support tickets
- Enforced status state machine (backend + UI)
- Comments on tickets
- Keyword search and status filter
- SQLite persistence via Prisma
- Mandatory state-machine integration tests

## Acting User

No authentication in Core. Select your acting user from the header dropdown when creating tickets or adding comments.

## Environment

Copy `src/.env.example` to `src/.env`. Never commit `.env` or secrets.
