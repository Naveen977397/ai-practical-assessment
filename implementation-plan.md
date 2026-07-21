# implementation-plan

Phased development plan for Core Support Ticket Management System.

## Build Sequence

Design → Database → Domain (state machine) → API → Integration Tests → UI → Verification

## Phases

| Phase | Deliverable | Status |
|-------|-------------|--------|
| 0 | Design docs (`data-model`, `api-contract`, `ui-flow`, `design-notes`) | Done |
| 1 | Prisma schema, migration, seed, `lib/prisma.ts`, `setup-notes.md` | In progress |
| 2 | `ticket-state-machine.ts`, Zod schemas, `api-errors.ts`, `ticket-service.ts` | Pending |
| 3 | API route handlers (`/api/users`, `/api/tickets`, status, comments) | Pending |
| 4 | UI pages and components | Pending |
| 5 | Jest + state-machine integration tests in `tests/` | Pending |
| 6 | README, acceptance verification, prompt history | Pending |

## Architecture

UI → API Routes → Ticket Service → State Machine + Validation → Prisma → SQLite

## Critical Rule

Status changes only via `PATCH /api/tickets/:id/status` using the enforced state machine. General PATCH must reject `status` field.

## Success Criteria

- All Core acceptance criteria (AC-01–AC-12) pass
- State-machine integration tests pass against real persistence
- Data survives restart; no secrets in repo

See [`design-notes.md`](design-notes.md) for detailed decisions.
