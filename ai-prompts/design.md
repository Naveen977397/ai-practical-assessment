# design

## Prompt #1

### Prompt
Create design documentation for the Support Ticket Management System: data model, API contract, UI flow, design notes, and implementation plan. Core scope only. State machine is the signature judgment piece.

### AI Response Summary
Produced `data-model.md` (entities, enums, relationships, indexes), `api-contract.md` (7 REST endpoints with request/response schemas and error codes), `ui-flow.md` (3 screens + acting user picker + status action table), `design-notes.md` (layered architecture, separate status endpoint, validation strategy), and `implementation-plan.md` (phased build sequence).

### Accepted
- Layered architecture: UI → API routes → services → state machine + validation → Prisma
- Separate `PATCH /api/tickets/:id/status` endpoint
- Pure state machine module with no Prisma dependency
- Acting user picker without authentication

### Modified
- Service layer path updated during implementation to `lib/services/` (plan referenced `ticket-service.ts`)

### Rejected
- Auth middleware design (Stretch, not Core)
- Pagination/filter API design (Stretch)

### Reason
User approved design before implementation began. Design docs served as blueprint for all subsequent phases.

---

## Prompt #2

### Prompt
Design stretch enhancements: priority/assignee filters, sorting, pagination on the list API; user CRUD API and admin UI; OpenAPI spec; Docker and CI pipeline. Keep existing Core architecture intact.

### AI Response Summary
Extended `api-contract.md` with query parameters (`priority`, `assignedToId`, `sortBy`, `sortOrder`, `page`, `limit`) and paginated list response shape `{ items, page, limit, total, totalPages }`. Designed user CRUD endpoints (`GET/POST /api/users`, `PATCH/DELETE /api/users/:id`) with admin-only access. Planned OpenAPI YAML served at `/api/openapi` with `/api-docs` UI page. Designed `Dockerfile` (multi-stage Node build) and `docker-compose.yml` (app + volume for SQLite). Designed GitHub Actions CI workflow: install, migrate, test, build.

### Accepted
- Paginated list API with backward-compatible filter extensions
- User CRUD behind admin role check (stretch auth prerequisite)
- OpenAPI as static YAML + JSON route
- Docker and CI as deployment/quality gates

### Modified
- List API changed from flat array to paginated response (UI updated accordingly)
- User management UI placed at `/users` (admin only)

### Rejected
- GraphQL alternative for list API (REST sufficient)
- Separate microservices for users vs tickets (monolith appropriate for assessment)

### Reason
User requested all stretch features after Core completion; design extended existing layered architecture without rewrite.

---

## Prompt #3

### Prompt
Design JWT authentication to replace the acting-user picker. Protect all routes and APIs. Login page with email/password. Session via httpOnly cookie. Admin-only user management.

### AI Response Summary
Designed auth module under `lib/auth/`: `config.ts` (cookie name, JWT secret, expiry), `password.ts` (hash/verify), `jwt.ts` (Web Crypto HS256 sign/verify — no `jose` dependency), `session.ts` (`getSessionUser`, `requireAuth`, `requireRole`). Designed routes: `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`. Designed `middleware.ts` to protect all paths except `/login` and auth login API. Designed `AuthProvider` + `UserMenu` replacing `ActingUserProvider`/`ActingUserPicker`. Added `passwordHash` field to User model with migration. Seed users get default password `Password123!`. `createdById` set server-side from JWT, not client.

### Accepted
- JWT in httpOnly cookie (`auth_token`, 8h expiry)
- Middleware-based route protection
- Server-side session resolution for API routes
- Web Crypto JWT (no extra dependency)
- Admin role gates `/users` page and user mutation APIs

### Modified
- Route groups: `(public)` for login, `(app)` for protected pages
- Ticket/comment creation uses authenticated user automatically

### Rejected
- Refresh tokens / token rotation (unnecessary for internal assessment app)
- OAuth / social login (out of scope)
- bcrypt dependency (used simpler hash for assessment; documented in design notes)

### Reason
User requested full JWT auth after stretch features; acting-user picker removed for real session management.

---

## Prompt #4

### Prompt
Design public signup flow: signup page, registration API, default Requester role, auto-login after signup, links between login and signup pages.

### AI Response Summary
Designed `signupSchema` (name, email, password, confirmPassword with match refinement) in `lib/validations/auth.schema.ts`. Designed `POST /api/auth/signup` route mirroring login cookie behavior. Designed `registerUser()` in `auth.service.ts` calling existing `createUser()` with `role: "Requester"`. Designed `SignupForm.tsx` and `/signup` page with password visibility toggles. Updated middleware public paths to include `/signup` and `/api/auth/signup`. Login form gets "Don't have an account? Sign up" link; signup form gets reverse link.

### Accepted
- Public signup with Requester role default
- Auto-login via JWT cookie on successful registration
- Password confirmation validation
- Signup/login cross-links

### Modified
- Middleware no longer auto-redirects login→tickets on valid JWT alone (prevents stale-cookie loops); login/signup pages do server-side session check instead

### Rejected
- Email verification flow (out of scope)
- Role selection on signup (all new users are Requesters; admin promotes via `/users`)

### Reason
User requested signup page after auth was implemented; design reuses existing user service and auth cookie pattern.
