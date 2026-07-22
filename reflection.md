# Reflection

**Candidate:** Naveen | **Role:** Software Engineer | **Submission:** 2026-07-22

---

## What I Built

A full-stack Support Ticket Management System using Next.js 16, Prisma 7, and SQLite. The application covers the complete ticket lifecycle: sign up / sign in, create tickets, search and filter the list, view and update details, change status through an enforced state machine, and add comments. All data persists in SQLite and survives application restarts.

Beyond Core requirements, I implemented stretch features: priority/assignee filters, sorting, pagination, user CRUD with an admin UI, unit tests on the state machine, OpenAPI documentation, Docker, and GitHub Actions CI. JWT authentication replaced the original acting-user picker, with a public signup flow for new Requester accounts.

The hardest and most important piece is the **status state machine** — a pure transition map enforced by the backend (HTTP 409 on invalid transitions), mirrored in the UI (only valid next actions shown), and proven by 44 automated tests against real database persistence.

---

## How I Used AI (across the lifecycle)

| Phase | AI Role | My Role |
|-------|---------|---------|
| Planning | Drafted requirements analysis, acceptance criteria, and repo structure | Reviewed assumptions, approved Core scope boundaries |
| Design | Proposed data model, API contract, UI flows, auth architecture | Validated state machine rules, endpoint separation, security defaults |
| Implementation | Generated schema, services, routes, UI, auth, stretch features | Scoped each prompt, reviewed diffs, ran build/tests after every change |
| Testing | Scaffolded integration and unit tests | Verified against real DB, fixed flaky Jest config, added auth/signup tests |
| Debugging | Diagnosed Prisma 7 adapter, native module, auth redirect, and cookie errors | Validated fixes with rebuild, test runs, and manual smoke tests |
| Code Review | Self-review of state machine, auth security, stretch regressions | Accepted/rejected suggestions, documented findings |
| Documentation | Drafted submission artifacts and prompt history | Reviewed for accuracy against actual implementation |

---

## What AI Helped With Most

1. **Rapid scaffolding** — Prisma schema, layered API structure, UI components, and auth module generated quickly with correct TypeScript types
2. **State machine architecture** — Pure transition map + dedicated status endpoint proved clean, testable, and impossible to bypass via general PATCH
3. **Prisma 7 setup** — Adapter configuration, seed script, and migration for the new Prisma client engine
4. **Stretch feature extension** — Paginated list API, user CRUD, OpenAPI, Docker, and CI added without rewriting Core architecture
5. **Auth implementation** — JWT with httpOnly cookies, middleware protection, and signup flow integrated into existing user service
6. **Documentation** — Consistent formatting across assessment artifacts and append-only prompt history

---

## What AI Got Wrong

1. **Initial terminal-state assumption** — Docs stated `Closed` was fully terminal; corrected when reopen was requested (`Closed` → `Open`)
2. **Test parallelism** — Default Jest parallel workers caused SQLite race conditions; required `maxWorkers: 1`
3. **UI alignment** — Unicode arrow in "Back to tickets" link was misaligned; replaced with flex-aligned SVG component
4. **Cookie deletion in layout** — Attempted `cookies().delete()` in a Server Component layout; Next.js only allows cookie writes in Route Handlers and Server Actions
5. **Auth redirect loop** — Middleware auto-redirected `/login` → `/tickets` on valid JWT even when user was missing from DB after reseed; fixed with server-side session guard
6. **Unhandled 401 responses** — `TicketListPanel` set error objects as user arrays, causing `users.map is not a function` crash
7. **Over-scoping tendency** — Early suggestions included features before they were requested; managed by explicit scope in each prompt

---

## How I Validated AI Output

- Ran `npm test` after every backend change (44 tests across 6 suites)
- Ran `npm run build` to catch TypeScript and Next.js compilation errors
- Manually tested UI flows: signup → login → create → list → detail → status change → comment → logout
- Verified invalid transitions return 409 and show error banner
- Verified unauthenticated access redirects to `/login` (no blank page)
- Confirmed `.env` is gitignored and no secrets in tracked files
- Cross-checked implementation against acceptance criteria AC-01 through AC-12
- Reviewed auth: `createdById` set server-side from JWT, admin routes gated by role

---

## What I Would Improve Next

1. E2E tests with Playwright for critical UI flows (signup, login, ticket lifecycle)
2. Email verification on signup and password reset flow
3. Optimistic locking on concurrent ticket edits
4. Rate limiting on auth endpoints
5. Migrate from SQLite to PostgreSQL for production deployment
6. Migrate middleware to Next.js 16 `proxy` convention (deprecation warning observed)

---

## Reusable Workflow

Prompts, rules, and patterns worth reusing in future projects:

- **Scoped incremental prompts** — one layer per task (schema → API → tests → UI)
- **Cursor spec file** (`tool-specific/cursor-workflow/spec.md`) as persistent project context
- **Append-only prompt history** in `ai-prompts/` with Accepted/Modified/Rejected sections
- **Pure state machine module** for lifecycle enforcement (no DB dependency)
- **Separate status endpoint** to prevent bypassing transition rules via general update
- **Server-side auth guard** in layout + middleware + client refresh (defense in depth)
- **Integration tests against real DB** for persistence-layer confidence
- **Defensive API response handling** in client components (`response.ok` + type checks)
