# PR Description

## Summary

Implements the Support Ticket Management System with full Core acceptance criteria, stretch features, JWT authentication, and public signup. Tickets progress through an enforced status state machine with comments, search/filter, SQLite persistence, and 44 automated tests.

**Candidate:** Naveen | **Role:** Software Engineer

---

## Features Implemented

### Core

- Create, list, view, and update support tickets via UI
- Enforced status state machine with dedicated status endpoint
- Comments on tickets (any status, including closed and cancelled)
- Keyword search (title + description) and status filter
- Meaningful error states in UI (validation errors, 409 invalid transitions)
- Reopen closed tickets (`Closed` → `Open`) for mistaken closures
- Backend validation on all write operations (Zod + service layer)

### Stretch

- Priority and assignee filters, custom sorting, paginated list API
- User CRUD API and `/users` admin management UI
- Unit tests on pure state machine module
- OpenAPI spec at `/api/openapi` and `/api-docs` page
- Docker (`Dockerfile`, `docker-compose.yml`) and GitHub Actions CI

### Auth (user-requested enhancement)

- JWT authentication with httpOnly cookie session
- Login page with password visibility toggle
- Public signup page (`/signup`) — new users get **Requester** role
- Server-side session guard; unauthenticated users redirected to login
- Admin-only access to user management

---

## Technical Changes

### Backend (`src/`)

- Prisma 7 schema with User (`passwordHash`), Ticket, Comment entities
- Layered architecture: middleware → API routes → services → state machine + Zod → Prisma
- Auth module: `lib/auth/` (JWT Web Crypto HS256, password hash, session helpers)
- REST endpoints: auth (login, signup, logout, me), users CRUD, tickets CRUD, status, comments, OpenAPI
- Pure `ticket-state-machine.ts` as single source of truth
- HTTP 409 for invalid status transitions; 401/403 for auth failures

### Frontend

- Route groups: `(public)` for login/signup, `(app)` for protected pages
- Screens: login, signup, ticket list (filters + pagination), create form, detail, user management, API docs
- `AuthProvider` + `UserMenu` (replaced acting-user picker)
- Shared UI component classes (`.app-card`, `.app-input`, `.app-btn-primary`, etc.)
- Status action buttons driven by `getValidTransitions()`

### Tests (`tests/`)

- **44 tests** across 6 suites:
  - State machine integration (13)
  - Comments integration (4)
  - List API integration (stretch)
  - Users CRUD integration (stretch)
  - Auth integration (login + signup)
  - State machine unit tests (stretch)
- Real SQLite persistence via Prisma adapter
- Jest `maxWorkers: 1` for reliable serial execution

### Infrastructure

- `Dockerfile` (multi-stage Node build)
- `docker-compose.yml` (app + SQLite volume)
- `.github/workflows/ci.yml` (install → migrate → test → build)

---

## Database Changes

- Initial migration: `20260721181709_init`
- Auth migration: `20260722180000_add_user_password` (`passwordHash` on User)
- Seed: 3 users (Admin, Agent, Requester) with password `Password123!`
- SQLite: `dev.db` (development), `test.db` (tests)

---

## Testing Done

- [x] 44/44 automated tests pass
- [x] Production build passes
- [x] Manual UI verification: signup, login, ticket CRUD, comments, status transitions, search/filter, logout
- [x] Invalid transition rejection verified (UI + API)
- [x] Auth redirect verified (unauthenticated → login, no blank page)
- [x] Admin user management verified

---

## AI Usage Summary

Cursor used across planning, design, implementation, testing, debugging, code review, and documentation. Incremental scoped prompts per layer. Full prompt history in [`ai-prompts/`](ai-prompts/). See [`tool-workflow.md`](tool-workflow.md) and [`final-ai-usage-summary.md`](final-ai-usage-summary.md).

---

## Screenshots / Demo Notes

1. **Login** — email/password with show/hide toggle; link to signup
2. **Signup** — name, email, password, confirm password; link to login
3. **Ticket list** — search, status/priority/assignee filters, sort, pagination
4. **Create ticket** — title, description, priority, optional assignee
5. **Ticket detail** — status actions, edit form, comments, reopen on closed tickets
6. **Users (admin)** — create, edit, delete users
7. **API docs** — OpenAPI spec browser

```bash
cd src && npm run dev
# Visit http://localhost:3000
# Demo: alice.admin@support.local / Password123!
```

---

## Known Limitations

- No ticket or comment delete operations
- Cancelled tickets cannot be reopened (terminal state)
- No email verification or password reset flow
- No optimistic locking on concurrent edits (last write wins)
- SQLite only (not production-grade for high concurrency)
- Middleware deprecation warning in Next.js 16 (migrate to `proxy` convention)

---

## Files Changed (key)

| Area | Files |
|------|-------|
| Schema | `src/prisma/schema.prisma`, migrations |
| Auth | `src/lib/auth/*`, `src/middleware.ts`, `src/app/api/auth/*` |
| API | `src/app/api/tickets/*`, `src/app/api/users/*` |
| Services | `src/lib/services/ticket.service.ts`, `auth.service.ts`, `user.service.ts` |
| UI | `src/components/TicketListPanel.tsx`, `LoginForm.tsx`, `SignupForm.tsx`, `AuthProvider.tsx` |
| Tests | `tests/integration/*`, `tests/unit/state-machine.test.ts` |
| Infra | `Dockerfile`, `docker-compose.yml`, `.github/workflows/ci.yml` |
| Docs | `acceptance-criteria.md`, `ai-prompts/*`, submission artifacts |
