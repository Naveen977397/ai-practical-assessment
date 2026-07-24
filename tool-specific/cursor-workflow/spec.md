# spec

Specification for the Support Ticket Management System. Derived from [`requirements-analysis.md`](../../requirements-analysis.md). Updated to reflect final implementation (Core + Stretch + Auth).

---

## Business Context

Internal support ticket app. Users sign in, create, update, comment on, search, and progress tickets through a strict status lifecycle. JWT authentication protects all routes. Admins manage users via `/users`.

**Stack:** Next.js 16 App Router + Prisma 7 + SQLite (code in `src/`).

---

## Entities

### User

| Field | Type | Notes |
|-------|------|-------|
| id | string | Primary key (cuid) |
| name | string | Display name |
| email | string | Unique |
| role | string | `Admin`, `Agent`, `Requester` — enforced for authorization |
| passwordHash | string | Hashed password (not exposed in API) |

### Ticket

| Field | Type | Notes |
|-------|------|-------|
| id | string | Primary key |
| title | string | Required; max 200 chars |
| description | string | Required; max 5000 chars |
| priority | enum | `Low`, `Medium`, `High` |
| status | enum | `Open`, `In Progress`, `Resolved`, `Closed`, `Cancelled` |
| assignedTo | User? | Optional; FK to User |
| createdBy | User | Required; FK to User (from JWT session) |
| createdAt | datetime | System-set |
| updatedAt | datetime | System-maintained |

### Comment

| Field | Type | Notes |
|-------|------|-------|
| id | string | Primary key |
| ticketId | Ticket | Required; FK |
| message | string | Required; max 2000 chars |
| createdBy | User | Required; FK (from JWT session) |
| createdAt | datetime | System-set |

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
- Backend enforces all rules; invalid transitions return HTTP 409.
- Frontend shows only valid next-status actions.
- Status changes are separate from field updates.

---

## Features

1. **Authentication** — login, signup, logout; JWT in httpOnly cookie; protected routes
2. **Create ticket** — title, description, priority required; defaults to `Open`; `createdBy` from session
3. **List tickets** — paginated; keyword search + status/priority/assignee filters + sorting
4. **View ticket detail** — all fields, comments (chronological), timestamps
5. **Update fields** — title, description, priority, assignee; allowed in any status
6. **Change status** — via state machine only
7. **Add comments** — allowed in any status; append-only
8. **User management** — admin CRUD at `/users`
9. **Validate on backend** — reject invalid input; show errors in UI
10. **Persist data** — survives restart

---

## Authentication

- JWT (Web Crypto HS256) in httpOnly cookie, 8h expiry
- Middleware protects all routes except `/login`, `/signup`, auth APIs
- Server layout guard via `getSessionUser()`
- Admin role required for user mutations and `/users` page
- Signup creates users with `Requester` role

---

## Seeding

- 3 seeded users: Admin, Agent, Requester (password: `Password123!`)
- Seed script: `src/prisma/seed.mjs`
- Reference data: `database/seed-data/users.json`

---

## Testing

**44 tests** across 6 suites:

- State machine integration (13)
- Comments integration (4)
- List API integration (6)
- Users CRUD integration (5)
- Auth integration (4)
- State machine unit (12)

All run against real SQLite persistence.

---

## Infrastructure

- OpenAPI spec at `/api/openapi` and `/api-docs`
- Docker: `Dockerfile`, `docker-compose.yml`
- CI: `.github/workflows/ci.yml` (test + build)

---

## Requirement IDs

See [`requirements-analysis.md`](../../requirements-analysis.md) for full FR-*, NFR-*, and assumption traceability.

See [`acceptance-criteria.md`](../../acceptance-criteria.md) for Given/When/Then test criteria.
