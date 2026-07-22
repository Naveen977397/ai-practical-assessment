# Final AI Usage Summary

**Candidate:** Naveen | **Role:** Software Engineer | **Tool:** Cursor (Agent mode) | **Submission:** 2026-07-22

---

## Overview

Cursor was the primary AI tool for the entire Support Ticket Management System assessment — from repository setup through Core implementation, stretch features, JWT authentication, signup flow, debugging, code review, and submission documentation.

---

## Usage by Phase

| Phase | Prompts | Key Outcomes |
|-------|---------|-------------|
| Planning | 3 | Repo structure, requirements analysis, acceptance criteria, implementation plan |
| Design | 4 | Data model, API contract, UI flow, stretch design, JWT auth, signup flow |
| Implementation | 8+ | Schema, seed, CRUD API, state machine, comments, UI, polish, reopen, stretch, auth, signup |
| Testing | 6 | State machine, comments, list API, users, auth, unit tests (44 total) |
| Debugging | 8 | Prisma 7 adapter, native module, Jest flakiness, login 500, auth redirects, cookie errors |
| Code Review | 5 | Core review, stretch review, auth security, UX edge cases, submission audit |
| Documentation | 4+ | Prompt history, submission artifacts, compliance updates |

Full prompt history: [`ai-prompts/`](ai-prompts/)

---

## What Was Accepted from AI

- Repository structure matching assessment spec
- Layered backend architecture (middleware → routes → services → Prisma)
- Pure state machine module with dedicated status endpoint
- Zod validation schemas for all write endpoints
- Prisma 7 schema with explicit `onDelete` actions and indexes
- JWT auth with httpOnly cookies and Web Crypto HS256 (no `jose` dependency)
- Integration tests against real SQLite persistence
- Shared CSS component classes for consistent light theme
- Stretch features: pagination, filters, user CRUD, OpenAPI, Docker, CI
- Signup flow with password confirmation and Requester role default
- Server-side auth guard in app layout

---

## What Was Modified

- Seed script uses upsert (safe re-runs) instead of wipe-and-recreate
- Prisma 7 seed config in `prisma.config.ts` (not only `package.json`)
- Backend reorganized into `lib/services/`, `lib/api/`, `lib/validations/`, `lib/auth/`
- Jest `maxWorkers: 1` added for reliable test execution
- Back navigation uses SVG icon with flex alignment (not Unicode arrow)
- `Closed` → `Open` reopen added as post-Core enhancement
- Acting-user picker replaced by JWT auth + signup (user-requested)
- Middleware login redirect logic moved to page-level session checks (stale cookie fix)
- `postinstall: npm rebuild better-sqlite3` added to `package.json`
- List API changed from flat array to paginated response for stretch

---

## What Was Rejected

| Suggestion | Reason |
|------------|--------|
| Prisma Accelerate | Unnecessary for local SQLite |
| Mocking Prisma in integration tests | Core requires real persistence |
| JWT in localStorage | httpOnly cookie is more secure |
| Role selection on signup | All new users are Requesters |
| OAuth / social login | Out of scope |
| Email verification | Out of scope |
| GraphQL API | REST sufficient |
| Ticket/comment delete | Not in requirements |
| E2E Playwright tests | Out of assessment scope |
| Cookie deletion in Server Component layout | Not permitted by Next.js |
| Per-worker test DB files | Over-engineering for assessment |

---

## Responsible AI Practices

1. **Context setting** — Provided assessment spec, stack constraints, and scope boundaries in every major prompt
2. **Incremental iteration** — One layer per prompt; reviewed diffs and ran tests before proceeding
3. **Validation** — Never accepted code without running `npm test` and `npm run build`
4. **Prompt history** — Logged major interactions with Accepted/Modified/Rejected rationale in `ai-prompts/`
5. **No secrets** — Never shared or committed credentials; `.env` gitignored; `JWT_SECRET` in `.env.example` only
6. **Judgment calls** — Added reopen and auth based on user need; rejected scope expansion until explicitly requested
7. **Human review of security** — Verified server-side `createdById`, admin role gating, cookie settings

---

## Effectiveness Assessment

| Area | Rating | Notes |
|------|--------|-------|
| Speed | High | Full Core + stretch + auth in focused sessions |
| Accuracy | Medium-High | Required review for Prisma 7, auth edge cases, Next.js cookie restrictions |
| Architecture | High | Clean separation; state machine and auth modules are testable in isolation |
| Documentation | High | Assessment artifacts generated efficiently with human accuracy review |
| Testing | High | 44 tests; needed manual fix for Jest parallelism and native module rebuild |
| Debugging | Medium-High | AI diagnosed most issues quickly; stale JWT loop required multiple iterations |

---

## Prompt Volume by File

| File | Entries | Coverage |
|------|---------|----------|
| `planning.md` | 3 | Repo setup, requirements, implementation plan |
| `design.md` | 4 | Core design, stretch, auth, signup |
| `implementation.md` | 8 | Schema through compliance audit |
| `testing.md` | 6 | Integration, unit, auth, stretch tests |
| `debugging.md` | 8 | Prisma, native module, auth, UI issues |
| `code-review.md` | 5 | Core, stretch, auth, UX, submission |
| `documentation.md` | 1 | Prompt history workflow |

---

## Key Takeaway

AI accelerated scaffolding, architecture decisions, and documentation significantly. The highest-value human contributions were:

- **Scope control** — Keeping Core clean before adding stretch and auth
- **Validation** — Running real persistence tests after every change
- **Security judgment** — Reviewing auth implementation for cookie handling, role gating, and server-side identity
- **Debugging persistence** — Native module rebuilds, Jest config, and Next.js cookie restrictions required hands-on verification
- **Enhancement decisions** — Reopen, auth, and signup added based on explicit user requests, not AI suggestions alone

The state machine remains the signature engineering piece: a pure module enforced at the API layer, mirrored in the UI, and proven by automated tests — a pattern directly applicable to any lifecycle-managed domain.
