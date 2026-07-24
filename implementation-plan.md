# Implementation Plan

Phased development plan for the Support Ticket Management System (Core + Stretch + Auth).

## Overview

Build a full-stack ticket management app with enforced status state machine, SQLite persistence, JWT authentication, and comprehensive tests. Application code lives in `src/`; tests in `tests/`.

## Build Sequence

Design → Database → Domain (state machine) → API → Integration Tests → UI → Stretch → Auth → Verification

## Task Breakdown

| Phase | Deliverable | Status |
|-------|-------------|--------|
| 0 | Design docs (`data-model`, `api-contract`, `ui-flow`, `design-notes`) | Done |
| 1 | Prisma schema, migration, seed, `lib/prisma.ts`, `setup-notes.md` | Done |
| 2 | `ticket-state-machine.ts`, Zod schemas, `api/errors.ts`, services | Done |
| 3 | API route handlers (`/api/users`, `/api/tickets`, status, comments) | Done |
| 4 | UI pages and components (list, create, detail) | Done |
| 5 | Jest + state-machine and comment integration tests | Done |
| 6 | UI polish, reopen, stretch (filters, pagination, user CRUD, OpenAPI, Docker, CI) | Done |
| 7 | JWT auth, login/signup, middleware, protected routes | Done |
| 8 | Auth tests, documentation alignment, CI fixes | Done |

## Milestones

1. **M1 — Data layer:** Schema migrated, users seeded, Prisma client working
2. **M2 — Ticket CRUD API:** Create, list, get, update with validation
3. **M3 — State machine:** Dedicated status endpoint, 409 on invalid transitions, integration tests
4. **M4 — Comments:** POST comments, detail view includes comments
5. **M5 — UI:** All screens wired to APIs with error states
6. **M6 — Stretch:** Pagination, filters, user CRUD, OpenAPI, Docker, CI, unit tests
7. **M7 — Auth:** JWT login/signup, protected routes, server-side identity
8. **M8 — Verification:** Build passes, 44 tests pass, CI green, docs complete

## AI Usage Plan

- **Planning:** Requirements analysis and acceptance criteria with AI as BA partner
- **Design:** Data model, API contract, UI flow drafted with AI, reviewed manually
- **Implementation:** Incremental prompts per layer (schema → API → UI → auth); human review after each
- **Testing:** AI generated test scaffolding; human verified against real DB
- **Debugging:** AI assisted with Prisma 7 adapter, native module, and auth redirect issues
- **Review:** AI-assisted self-review of state machine, auth security, and stretch regressions

## Risks

| Risk | Impact |
|------|--------|
| State machine bypass via general PATCH | High — invalid lifecycle |
| In-memory ticket storage | High — fails persistence AC |
| Prisma 7 + SQLite adapter complexity | Medium — setup friction |
| Parallel Jest workers sharing SQLite | Medium — flaky tests |
| Stale JWT after DB reseed | Medium — blank page / redirect loop |

## Mitigation

- Separate `PATCH /api/tickets/:id/status` endpoint; general PATCH rejects `status`
- Prisma + SQLite file database; migrations and seed scripts
- `@prisma/adapter-better-sqlite3` with documented setup in `database/setup-notes.md`
- Jest `maxWorkers: 1` for serial test execution against shared test DB
- Server-side auth guard in app layout; logout API for stale cookie cleanup

## Success Criteria

- All Core acceptance criteria (AC-01–AC-12) pass
- Stretch features implemented and tested
- 44 automated tests pass; CI green on GitHub Actions
- Data survives restart; no secrets in repo
- Prompt history documents AI collaboration across lifecycle phases

See [`design-notes.md`](design-notes.md) for detailed architecture decisions.
