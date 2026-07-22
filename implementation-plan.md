# Implementation Plan

Phased development plan for Core Support Ticket Management System.

## Overview

Build a full-stack ticket management app with enforced status state machine, SQLite persistence, and mandatory integration tests. Application code lives in `src/`; tests in `tests/`.

## Build Sequence

Design → Database → Domain (state machine) → API → Integration Tests → UI → Verification

## Task Breakdown

| Phase | Deliverable | Status |
|-------|-------------|--------|
| 0 | Design docs (`data-model`, `api-contract`, `ui-flow`, `design-notes`) | Done |
| 1 | Prisma schema, migration, seed, `lib/prisma.ts`, `setup-notes.md` | Done |
| 2 | `ticket-state-machine.ts`, Zod schemas, `api/errors.ts`, services | Done |
| 3 | API route handlers (`/api/users`, `/api/tickets`, status, comments) | Done |
| 4 | UI pages and components (list, create, detail, acting user) | Done |
| 5 | Jest + state-machine and comment integration tests | Done |
| 6 | README, acceptance verification, prompt history, submission docs | Done |

## Milestones

1. **M1 — Data layer:** Schema migrated, users seeded, Prisma client working
2. **M2 — Ticket CRUD API:** Create, list, get, update with validation
3. **M3 — State machine:** Dedicated status endpoint, 409 on invalid transitions, integration tests
4. **M4 — Comments:** POST comments, detail view includes comments
5. **M5 — UI:** All three screens wired to APIs with error states
6. **M6 — Verification:** Build passes, 17 integration tests pass, docs complete

## AI Usage Plan

- **Planning:** Requirements analysis and acceptance criteria with AI as BA partner
- **Design:** Data model, API contract, UI flow drafted with AI, reviewed manually
- **Implementation:** Incremental prompts per layer (schema → API → UI); human review after each
- **Testing:** AI generated integration test scaffolding; human verified against real DB
- **Debugging:** AI assisted with Prisma 7 adapter setup and native module issues
- **Review:** AI-assisted self-review of state machine and validation paths

## Risks

| Risk | Impact |
|------|--------|
| State machine bypass via general PATCH | High — invalid lifecycle |
| In-memory ticket storage | High — fails persistence AC |
| Prisma 7 + SQLite adapter complexity | Medium — setup friction |
| Parallel Jest workers sharing SQLite | Medium — flaky tests |

## Mitigation

- Separate `PATCH /api/tickets/:id/status` endpoint; general PATCH rejects `status`
- Prisma + SQLite file database; migrations and seed scripts
- `@prisma/adapter-better-sqlite3` with documented setup in `database/setup-notes.md`
- Jest `maxWorkers: 1` for serial test execution against shared test DB

## Success Criteria

- All Core acceptance criteria (AC-01–AC-12) pass
- State-machine integration tests pass against real persistence
- Data survives restart; no secrets in repo
- Prompt history documents AI collaboration across lifecycle phases

See [`design-notes.md`](design-notes.md) for detailed architecture decisions.
