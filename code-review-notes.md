# Code Review Notes

AI-assisted self-reviews performed across Core implementation, stretch features, JWT authentication, and final submission readiness.

---

## Featured AI-Assisted Code Review: JWT Authentication Security

This is a real code review session performed after JWT auth replaced the acting-user picker. I asked Cursor to review the auth implementation for security issues before considering the feature complete.

### Review Prompt

> Review JWT authentication implementation. Check for security issues: cookie settings, secret handling, middleware coverage, role enforcement, and removal of client-controlled `createdById`.

### Files Reviewed

| File | What was checked |
|------|------------------|
| `src/lib/auth/config.ts` | Cookie name, JWT secret validation, expiry |
| `src/lib/auth/jwt.ts` | Sign/verify implementation, expiry enforcement |
| `src/lib/auth/password.ts` | Password hashing before storage |
| `src/lib/auth/session.ts` | `getSessionUser`, `requireAuth`, `requireRole` |
| `src/middleware.ts` | Public path whitelist, token verification, redirect behavior |
| `src/app/api/auth/login/route.ts` | Cookie flags on login |
| `src/app/api/auth/signup/route.ts` | Role hardcoding, cookie on register |
| `src/lib/services/ticket.service.ts` | `createdById` sourced from session, not request body |
| `src/lib/services/comment.service.ts` | Same for comment `createdById` |
| `src/app/api/users/route.ts` | Admin-only mutations via `requireRole("Admin")` |

### Findings

| # | Area | Finding | Severity | Action |
|---|------|---------|----------|--------|
| 1 | Cookie security | `httpOnly: true`, `sameSite: "lax"`, `secure` in production | OK | Accepted |
| 2 | JWT secret | `getJwtSecret()` enforces min 32 chars; `.env.example` documents requirement | OK | Accepted |
| 3 | Client spoofing `createdById` | Ticket and comment creation use `requireAuth()` server-side; client cannot set creator | OK | Accepted — acting-user picker fully removed |
| 4 | Signup role escalation | `registerUser()` hardcodes `role: "Requester"`; no client role input | OK | Accepted |
| 5 | Admin routes | `requireRole("Admin")` on user POST/PATCH/DELETE; `/users` page behind app layout | OK | Accepted |
| 6 | Middleware coverage | All non-public paths protected; whitelist includes `/login`, `/signup`, auth APIs | OK | Accepted |
| 7 | Stale JWT after DB reseed | Middleware passes valid signature but user missing from DB → APIs return 401, UI crashes | **High** | **Fixed** — server layout guard + logout on 401 (see bug hunt) |
| 8 | Password hashing | Custom hash implementation; not bcrypt/argon2 | Low | Accepted for assessment; documented |
| 9 | Token refresh | No refresh token rotation | Low | Rejected — unnecessary for internal app |
| 10 | JWT library | Web Crypto HS256 instead of `jose` | Low | Accepted — avoids Jest ESM compatibility issues |

### AI Suggestions: Accepted

1. **Server-side `createdById`** — confirmed ticket and comment services read user ID from `requireAuth()`, not from request body
2. **Admin role gating** — confirmed `requireRole("Admin")` on all user mutation routes
3. **Public path whitelist** — confirmed middleware only skips auth for login, signup, and auth API endpoints
4. **Auth integration tests** — added `tests/integration/auth.test.ts` covering login, invalid password, signup, and duplicate email

### AI Suggestions: Rejected

| Suggestion | Reason |
|------------|--------|
| Store JWT in `localStorage` | httpOnly cookie is more secure against XSS token theft |
| Allow role selection on signup | All new users must be Requesters; admin promotes via `/users` |
| Add refresh token rotation | Out of scope for internal assessment app with 8h sessions |
| Switch to bcrypt dependency | Current hash works; adding dependency not justified for assessment |
| Add rate limiting on login | Valid improvement but not required for submission |

### Changes Made After Review

1. Added auth integration tests (`tests/integration/auth.test.ts`)
2. Fixed stale-session UX issues found during review (server layout guard, defensive API handling)
3. Documented password hashing approach in design notes
4. Updated `README.md` auth section with signup flow and demo accounts

### Review Outcome

**Auth implementation approved** after fixing the stale-session gap (finding #7). All other security checks passed. The review confirmed that replacing the acting-user picker eliminated the primary Core security limitation (client-controlled identity).

### What I Learned

- AI code review is effective for **checklist-style security audits** (cookie flags, role gating, secret handling) when given explicit files and concerns.
- AI review **missed the stale-JWT runtime bug** until I reported the blank-page symptom — review caught static code issues but not the middleware vs session mismatch.
- Combining AI review with **manual smoke testing** (login after DB reseed) is necessary to catch session edge cases.

---

## Review 1: Core Implementation

**Scope:** State machine enforcement, validation completeness, security basics, and test coverage.

**Files reviewed:**
- `lib/ticket-state-machine.ts` — transition map completeness
- `lib/services/ticket.service.ts` — status vs field update separation
- API route handlers — error handling and status codes
- UI components — only valid transitions shown, error display
- Test coverage — valid and invalid transition cases

### Strengths

1. **State machine isolation** — Pure module with no Prisma dependency; single source of truth for transitions
2. **Endpoint separation** — `PATCH /api/tickets/:id/status` is the only path for status changes; general PATCH rejects `status` field
3. **Consistent validation** — Zod schemas on all write endpoints; backend always re-validates
4. **Error mapping** — `InvalidStatusTransitionError` → HTTP 409; `ValidationError` → 400; `NotFoundError` → 404
5. **Test coverage** — Integration tests against real persistence, not mocked state machine
6. **No secrets** — `.env` gitignored; `.env.example` with placeholder only

### Areas Reviewed

| Area | Finding | Severity |
|------|---------|----------|
| State machine bypass | General PATCH rejects `status` in body | OK |
| SQL injection | Prisma parameterized queries | OK |
| XSS in comments | React escapes by default; no `dangerouslySetInnerHTML` | OK |
| Auth bypass | No auth by design in Core; acting user was client-sent | Known limitation (fixed in Review 3) |
| Race conditions | No optimistic locking on status transitions | Low |
| Delete operations | No ticket/comment delete (Core spec) | OK |

### Changes Made After Review

1. Added `maxWorkers: 1` to Jest config for reliable test execution
2. Created shared `BackToTicketsLink` component for consistent navigation
3. Applied shared UI component classes for readability and contrast
4. Added `Closed` → `Open` reopen transition
5. Updated documentation to reflect actual implementation state

---

## Review 2: Stretch Features

**Scope:** Paginated list API, user CRUD, OpenAPI, Docker, CI — verify no Core regressions.

**Files reviewed:**
- `lib/services/ticket.service.ts` — list query with filters, sort, pagination
- `lib/services/user.service.ts` — CRUD with duplicate-email handling
- `src/openapi.yaml` — endpoint accuracy
- `Dockerfile`, `docker-compose.yml`, `.github/workflows/ci.yml`

### Strengths

1. **List API extensions** — Filters (priority, assignee), sort, and pagination added without breaking state machine
2. **Paginated response** — Consistent `{ items, page, limit, total, totalPages }` shape
3. **User service reuse** — Signup and admin CRUD share `createUser()` with validation
4. **CI pipeline** — Install, migrate, test, build on push
5. **OpenAPI** — Documents all endpoints including stretch and auth routes

### Areas Reviewed

| Area | Finding | Severity |
|------|---------|----------|
| Breaking list API change | UI updated for paginated response | OK (intentional stretch) |
| Admin authorization | `requireRole("Admin")` on user mutations | OK |
| Docker SQLite persistence | Volume mount for `dev.db` | OK |
| OpenAPI drift | Spec matches implemented routes | OK |

### Suggestions Rejected

| Suggestion | Reason |
|------------|--------|
| Revert to flat array list response | Stretch requires pagination |
| Delete protection for users with assigned tickets | Not specified in requirements |
| GraphQL for list API | REST sufficient for assessment |

---

## Review 3: JWT Authentication

**Scope:** Security of auth implementation replacing acting-user picker.

**Files reviewed:**
- `lib/auth/` — config, password, jwt, session
- `middleware.ts` — route protection
- `app/api/auth/*` — login, logout, signup, me
- `components/AuthProvider.tsx`, `LoginForm.tsx`, `SignupForm.tsx`

### Strengths

1. **httpOnly cookie** — JWT not exposed to JavaScript (`auth_token`, sameSite=lax, secure in production)
2. **Server-side identity** — `createdById` set from JWT in services, not from client request body
3. **Role enforcement** — Admin-only `/users` page and user mutation APIs via `requireRole("Admin")`
4. **Middleware coverage** — All non-public paths protected; public whitelist for login, signup, and auth APIs
5. **No extra JWT dependency** — Web Crypto HS256 implementation avoids `jose` compatibility issues with Jest

### Areas Reviewed

| Area | Finding | Severity |
|------|---------|----------|
| Client spoofing `createdById` | Removed; server uses session user | OK |
| Password storage | Hashed before persist; not logged | OK |
| JWT secret | Min 32 chars enforced in config; `.env.example` provided | OK |
| Session expiry | 8h expiry in JWT `exp` claim | OK |
| Signup role escalation | Hardcoded `Requester`; no client role input | OK |
| Stale JWT after DB reseed | Server layout guard + logout on 401 | OK (fixed in Review 4) |

### Suggestions Rejected

| Suggestion | Reason |
|------------|--------|
| JWT in localStorage | httpOnly cookie is more secure |
| Role selection on signup | All new users are Requesters; admin promotes via `/users` |
| Refresh token rotation | Unnecessary for internal assessment app |

---

## Review 4: Auth UX and Redirect Edge Cases

**Scope:** Blank page, redirect loops, and error handling after auth was added.

**Files reviewed:**
- `app/(app)/layout.tsx` — server-side session guard
- `middleware.ts` — public paths and token handling
- `components/TicketListPanel.tsx` — defensive API response handling
- `components/AuthProvider.tsx` — session refresh and logout

### Issues Found and Fixed

| Issue | Root Cause | Fix |
|-------|------------|-----|
| Blank page on `/tickets` | Stale JWT passed middleware but session invalid; client returned `null` | Server-side redirect in app layout |
| `users.map is not a function` | 401 error object set as users array | `Array.isArray` guard + redirect on 401 |
| Cookie modification error | `cookies().delete()` in layout (not allowed) | Redirect only; clear via logout API |
| Login↔tickets redirect loop | Middleware redirected valid JWT from login to tickets even when user missing from DB | Page-level session check instead |

### Strengths After Fix

1. **Defense in depth** — Middleware + server layout + client refresh all validate session
2. **Graceful stale session** — Logout API clears cookie; user lands on login page
3. **Signup flow** — Password confirmation, duplicate email rejection, auto-login

---

## Review 5: Final Submission Readiness

**Scope:** All acceptance criteria, documentation, test counts, and submission artifacts.

### Compliance Check

| Item | Status |
|------|--------|
| AC-01 through AC-12 (Core) | All Done |
| Stretch features | Implemented |
| JWT auth + signup | Implemented |
| Integration + unit tests | 44/44 passing |
| Production build | Passes |
| No secrets in repo | `.env` gitignored |
| Prompt history (`ai-prompts/`) | Complete |
| Candidate info | Filled (Naveen, Software Engineer) |

### Remaining Recommendations Before Submit

1. Run `npm run lint` locally
2. Manual smoke test: signup → login → create ticket → comment → status change → search → logout
3. Verify `npm test` and `npm run build` pass on submission machine (may need `build-essential` on Linux)

---

## All Suggestions Rejected (Summary)

| Suggestion | Reason |
|------------|--------|
| Mock Prisma in integration tests | Core requires real persistence layer testing |
| Add optimistic UI updates for status | Adds complexity; refresh-on-success is sufficient |
| Add ticket delete endpoint | Not in requirements |
| Add rate limiting | Not required for internal assessment app |
| Switch to PostgreSQL | SQLite specified and sufficient |
| OAuth / social login | Out of scope |
| Email verification on signup | Out of scope |
| E2E browser tests (Playwright) | Out of assessment scope |
| GraphQL API | REST sufficient |
