# README

Support Ticket Management System — AI Capability Assessment (Core).

## Quick Start

```bash
cd src
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate deploy
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
| `npm test` | Run all tests (44 tests) |

## Documentation

| Document | Purpose |
|----------|---------|
| [`requirements-analysis.md`](requirements-analysis.md) | Functional and non-functional requirements |
| [`acceptance-criteria.md`](acceptance-criteria.md) | Testable acceptance criteria (AC-01–AC-12) |
| [`implementation-plan.md`](implementation-plan.md) | Development phases and milestones |
| [`design-notes.md`](design-notes.md) | Architecture and key decisions |
| [`data-model.md`](data-model.md) | Entity definitions and state transitions |
| [`api-contract.md`](api-contract.md) | REST API specification |
| [`ui-flow.md`](ui-flow.md) | Screen flows and UI behavior |
| [`test-strategy.md`](test-strategy.md) | Testing approach and coverage |
| [`test-results.md`](test-results.md) | Latest test and build results |
| [`tool-workflow.md`](tool-workflow.md) | AI tool usage workflow |
| [`database/setup-notes.md`](database/setup-notes.md) | Database setup |

## Submission Artifacts

| Document | Purpose |
|----------|---------|
| [`candidate-info.md`](candidate-info.md) | Candidate and project summary |
| [`pr-description.md`](pr-description.md) | PR-style feature summary |
| [`reflection.md`](reflection.md) | Project reflection and AI usage |
| [`final-ai-usage-summary.md`](final-ai-usage-summary.md) | AI usage across lifecycle |
| [`debugging-notes.md`](debugging-notes.md) | Issues encountered and fixes |
| [`code-review-notes.md`](code-review-notes.md) | Self-review observations |
| [`review-fixes.md`](review-fixes.md) | Changes after review |
| [`ai-prompts/`](ai-prompts/) | Prompt history by phase |

## Core Features

- Create, list, view, and update support tickets
- Enforced status state machine (backend + UI)
- Comments on tickets (any status)
- Keyword search and status filter
- SQLite persistence via Prisma
- 44 automated tests (integration + unit)
- Reopen closed tickets (`Closed` → `Open`)

## Stretch Features

- Filter by priority and assignee; custom sorting; pagination
- User CRUD API and `/users` management UI
- Unit tests on state machine module
- OpenAPI spec at `/api/openapi` and `/api-docs`
- Docker (`Dockerfile`, `docker-compose.yml`) and GitHub Actions CI

## Authentication

JWT authentication protects all pages and API routes (except `/login`, `/signup`, and auth API endpoints).

1. Visit `/login` to sign in, or `/signup` to create a new account.
2. Default password for seeded users: `Password123!`
3. New signups receive the **Requester** role.
4. Session is stored in an httpOnly cookie (`auth_token`), valid for 8 hours.
5. **Admin** users can access `/users` for user management.
6. Ticket creation and comments use the authenticated user automatically.

### Demo accounts

| Email | Role |
|-------|------|
| alice.admin@support.local | Admin |
| bob.agent@support.local | Agent |
| carol.requester@support.local | Requester |

## Environment

Copy `src/.env.example` to `src/.env`. Set `JWT_SECRET` (min 32 characters). Never commit `.env` or secrets.

## Assessment Compliance

All Core acceptance criteria (AC-01–AC-12) are implemented and verified. See [`acceptance-criteria.md`](acceptance-criteria.md) summary checklist and [`test-results.md`](test-results.md) for evidence.
