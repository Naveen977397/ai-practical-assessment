# spec

Core specification for the Support Ticket Management System. Derived from [`requirements-analysis.md`](../../requirements-analysis.md). Stretch features are excluded.

---

## Business Context

Internal support ticket app. Users create, update, comment on, search, and progress tickets through a strict status lifecycle. Users are **seeded only** — no user-management UI. **No authentication in Core.**

**Stack:** Next.js App Router + Prisma + SQLite (code in `src/`).

---

## Entities

### User (seeded only)

| Field | Type | Notes |
|-------|------|-------|
| id | string/int | Primary key |
| name | string | Display name |
| email | string | Unique |
| role | string | Informational only in Core; no auth |

### Ticket

| Field | Type | Notes |
|-------|------|-------|
| id | string/int | Primary key |
| title | string | Required; max 200 chars |
| description | string | Required; max 5000 chars |
| priority | enum | `Low`, `Medium`, `High` |
| status | enum | `Open`, `In Progress`, `Resolved`, `Closed`, `Cancelled` |
| assignedTo | User? | Optional; FK to User |
| createdBy | User | Required; FK to User |
| createdAt | datetime | System-set |
| updatedAt | datetime | System-maintained |

### Comment

| Field | Type | Notes |
|-------|------|-------|
| id | string/int | Primary key |
| ticketId | Ticket | Required; FK |
| message | string | Required; max 2000 chars |
| createdBy | User | Required; FK |
| createdAt | datetime | System-set |

---

## Status State Machine

```
Open         → In Progress
In Progress  → Resolved
Resolved     → Closed
Open         → Cancelled
In Progress  → Cancelled
Closed       → Open (Reopen — post-Core enhancement)
```

- `Cancelled` is **terminal** — no further transitions.
- `Closed` may be reopened to `Open` for mistaken closures.
- Backend enforces all rules; invalid transitions return error (use 409).
- Frontend shows only valid next-status actions.
- Status changes are separate from field updates.
- Any user may change status; assignee not required.

---

## Core Features

1. **Create ticket** — title, description, priority required; defaults to `Open`; acting user via UI picker.
2. **List tickets** — from database; newest first; keyword search (title + description, case-insensitive) + status filter (combinable).
3. **View ticket detail** — all fields, comments (chronological), timestamps.
4. **Update fields** — title, description, priority, assignee; allowed in any status.
5. **Change status** — via state machine only.
6. **Add comments** — allowed in any status; append-only.
7. **Validate on backend** — reject invalid input; show errors in UI.
8. **Persist data** — survives restart.

---

## Acting User (No Auth)

UI provides a user picker (dropdown) from seeded users. Selected user is `createdBy` for creates/comments. No login required in Core.

---

## Seeding

- Minimum 3 seeded users with varied roles (informational).
- Optional sample tickets for development.
- Seed scripts live under `database/seed-data/`.

---

## Testing (Mandatory)

Integration tests against real DB proving:
- All valid transitions succeed (including `Closed` → `Open` reopen).
- Representative invalid transitions are rejected.
- Comment creation on tickets (including closed).
- Tests live in `tests/`; 17 integration tests total.

---

## Out of Scope (Core)

- User CRUD, auth, protected routes
- Filter by priority/assignee, pagination, custom sorting
- Ticket/comment delete
- Unit tests, OpenAPI, Docker, CI (Stretch)

---

## Requirement IDs

See [`requirements-analysis.md`](../../requirements-analysis.md) for full FR-*, NFR-*, and assumption traceability.

See [`acceptance-criteria.md`](../../acceptance-criteria.md) for Given/When/Then test criteria.
