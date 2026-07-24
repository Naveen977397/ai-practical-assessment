# project-context

Cursor workflow copy — synced with [`../../requirements-analysis.md`](../../requirements-analysis.md) and [`../../candidate-info.md`](../../candidate-info.md).

Persistent project context for Cursor Agent sessions on the Support Ticket Management System.

---

## Candidate & Project

| Field | Value |
|-------|-------|
| **Candidate** | Naveen |
| **Role** | Software Engineer |
| **Project** | Support Ticket Management System (Core + Stretch + Auth) |
| **Primary AI Tool** | Cursor (Agent mode) |
| **Stack** | Next.js 16 App Router, Prisma 7, SQLite, TypeScript, Zod, Jest |
| **App code** | [`../../src/`](../../src/) |
| **Tests** | [`../../tests/`](../../tests/) |

---

## Business Context

An internal Support Ticket Management System for creating, updating, commenting on, searching, and progressing support tickets through a defined lifecycle.

**Final implementation** includes JWT authentication, signup, admin user management, stretch features (pagination, filters, OpenAPI, Docker, CI), and 44 automated tests. Core acceptance criteria (AC-01 through AC-12) remain satisfied.

**Technology stack:** Next.js App Router, Prisma, SQLite — application code lives in [`../../src/`](../../src/).

---

## Scope Summary

### Core (mandatory)

- Ticket CRUD via UI and API
- Enforced status state machine (separate status endpoint)
- Comments (append-only)
- Keyword search + status filter
- Backend validation (Zod + services)
- SQLite persistence
- State-machine integration tests against real DB

### Stretch (implemented)

- Priority/assignee filters, sorting, pagination
- User CRUD API + `/users` admin UI
- Unit tests on state machine module
- OpenAPI spec + `/api-docs`
- Docker + GitHub Actions CI

### Auth (user-requested)

- JWT login/signup/logout (httpOnly cookie)
- Middleware + server layout auth guard
- `createdById` from session (not client input)
- Admin role for user mutations

---

## Entities

| Entity | Key fields | Notes |
|--------|------------|-------|
| **User** | `id`, `name`, `email`, `role`, `passwordHash` | Roles: Admin, Agent, Requester |
| **Ticket** | `id`, `title`, `description`, `priority`, `status`, `assignedTo`, `createdBy`, timestamps | Status via state machine only |
| **Comment** | `id`, `ticketId`, `message`, `createdBy`, `createdAt` | Append-only |

---

## Status State Machine

```
Open         → In Progress
In Progress  → Resolved
Resolved     → Closed
Open         → Cancelled
In Progress  → Cancelled
Closed       → Open (Reopen)
```

- `Cancelled` is **terminal** — no further transitions.
- Backend enforces rules; invalid transitions return HTTP 409.
- Frontend shows only valid next-status actions.
- Status changes use `PATCH /api/tickets/:id/status` — not general PATCH.

---

## Key Functional Requirements (FR IDs)

| Area | IDs | Summary |
|------|-----|---------|
| Data model | FR-DM-01–04 | Users, Tickets, Comments in SQLite via Prisma |
| Ticket creation | FR-TC-01–05 | title, description, priority; default `Open` |
| Ticket listing | FR-TL-01–05 | DB-backed list, search, status filter, newest first |
| Ticket detail | FR-TD-01–02 | Full fields + chronological comments |
| Field updates | FR-TU-01–05 | title, description, priority, assignee; not status |
| State machine | FR-SM-01–07 | Enforced transitions; UI mirrors backend |
| Comments | FR-CM-01–05 | Any status; append-only |
| Search/filter | FR-SF-01–04 | Case-insensitive partial match on title + description |
| Validation | FR-VE-01–03 | Backend is source of truth |
| Testing | FR-TS-01–02 | Integration tests on real persistence |

---

## Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR-01 | Data survives application restart |
| NFR-02 | Referential integrity (Ticket ↔ User, Comment ↔ Ticket) |
| NFR-03 | Server-side validation on all writes |
| NFR-04 | Meaningful error states in UI |
| NFR-05 | No secrets in repository |
| NFR-06 | State-machine integration tests must pass |
| NFR-07 | Clear separation: UI → API → validation → persistence |

---

## Agreed Assumptions (with final overrides)

| ID | Assumption | Final implementation |
|----|------------|----------------------|
| A-01 | New tickets start `Open` | Set on create |
| A-02 | Acting user via UI picker | **Superseded:** JWT session sets `createdBy` |
| A-03 | Priority enum: Low/Medium/High | Validated on backend |
| A-08 | Terminal states | `Cancelled` terminal; `Closed` reopenable |
| A-11 | Stack: Next.js + Prisma + SQLite | Code in `src/` |
| A-14 | No delete for tickets/comments | Out of scope |

See [`../../requirements-analysis.md`](../../requirements-analysis.md) §3–§4 for full assumptions and deferred PO questions.

---

## Edge Cases to Respect

- Invalid/skip-ahead state transitions → 409
- Empty/whitespace validation on title, description, comment
- Stale JWT after DB reseed → redirect to login (not blank page)
- Defensive API response handling (`response.ok` + `Array.isArray`)
- Jest `maxWorkers: 1` for SQLite test isolation
- `better-sqlite3` native rebuild after Node version change

---

## Related Docs

| Doc | Purpose |
|-----|---------|
| [`spec.md`](spec.md) | Condensed Cursor spec (entities, features, testing) |
| [`acceptance-criteria.md`](acceptance-criteria.md) | Given/When/Then test criteria |
| [`tasks.md`](tasks.md) | Implementation task checklist |
| [`../../requirements-analysis.md`](../../requirements-analysis.md) | Full FR/NFR analysis |
| [`../../acceptance-criteria.md`](../../acceptance-criteria.md) | Canonical acceptance criteria |
| [`../../api-contract.md`](../../api-contract.md) | REST API contract |
| [`../../design-notes.md`](../../design-notes.md) | Architecture decisions |
| [`../../data-model.md`](../../data-model.md) | Entity definitions |

---

## Setup (quick reference)

```bash
cd src
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
npm run dev    # http://localhost:3000
npm test       # 44 tests
npm run build
```

**Demo login:** `alice.admin@support.local` / `Password123!`
