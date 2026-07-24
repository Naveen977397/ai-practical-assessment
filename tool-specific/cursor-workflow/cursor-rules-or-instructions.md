# cursor-rules-or-instructions

Cursor workflow copy — synced with [`../../tool-workflow.md`](../../tool-workflow.md).

Rules and instructions for using Cursor Agent on this project.

---

## Primary Tool

**Cursor** (Agent mode) — planning, design, implementation, testing, debugging, code review, and documentation.

**Candidate:** Naveen | **Role:** Software Engineer | **Submission:** 2026-07-22

---

## Context Files (read first)

| File | Use |
|------|-----|
| [`spec.md`](spec.md) | Condensed project spec — entities, state machine, features |
| [`project-context.md`](project-context.md) | Business context, FR/NFR IDs, scope, edge cases |
| [`acceptance-criteria.md`](acceptance-criteria.md) | Given/When/Then criteria (AC-01–AC-12) |
| [`tasks.md`](tasks.md) | Implementation checklist and status |
| [`../../requirements-analysis.md`](../../requirements-analysis.md) | Full requirements traceability |
| [`../../api-contract.md`](../../api-contract.md) | REST endpoint contract |

---

## Scope Rules

1. **Core first** — satisfy AC-01 through AC-12 before adding stretch features unless explicitly requested.
2. **One layer per prompt** — schema → API → tests → UI → auth. Do not combine unrelated layers in a single change.
3. **Reject scope expansion** — do not add auth, pagination, OpenAPI, Docker, or delete endpoints unless the user asks.
4. **State machine is sacred** — all status changes go through `lib/ticket-state-machine.ts` and `PATCH /api/tickets/:id/status`. General PATCH must reject `status` in body.
5. **Real persistence in tests** — integration tests use real SQLite (`test.db`); do not mock Prisma for state-machine tests.

---

## Code Conventions

- **App code** lives in [`../../src/`](../../src/)
- **Layered architecture:** middleware → API routes → services → state machine + Zod → Prisma
- **Services:** `src/lib/services/` (ticket, comment, user, auth)
- **Validation:** `src/lib/validations/` (Zod schemas)
- **Auth:** `src/lib/auth/` (JWT Web Crypto HS256, httpOnly cookie, session helpers)
- **Follow existing patterns** — naming, folder structure, error handling. No new frameworks without justification.
- **Minimal diffs** — smallest change that solves the request; no unrelated refactors.

---

## Security Rules

- Never commit secrets — `.env` is gitignored; use `.env.example` for variable names only.
- Never log or paste JWT secrets, passwords, or API keys.
- `createdById` must come from `requireAuth()` / session — never from client request body.
- Admin mutations require `requireRole("Admin")`.
- JWT in httpOnly cookie — not localStorage.
- Do not use `eval`, unsafe deserialization, or permissive CORS.

---

## Validation Rules

After every backend change:

```bash
cd src
npm test        # 44 tests must pass
npm run build   # production build must pass
```

- Cross-check changes against AC-01 through AC-12.
- Reject AI suggestions that fail tests or violate scope.
- Manual smoke test for auth flows: login → tickets → create → status → comment → logout.

---

## Testing Rules

- Integration tests: real SQLite via Prisma adapter (`tests/helpers/test-db.ts`)
- Jest `maxWorkers: 1` — required for serial SQLite access
- State machine: both integration tests (persistence) and unit tests (pure module)
- Do not mock the state machine in integration tests

---

## Debugging Practices

Document issues in [`../../debugging-notes.md`](../../debugging-notes.md). Known patterns:

| Issue | Fix |
|-------|-----|
| Prisma 7 adapter error | `@prisma/adapter-better-sqlite3` + `lib/create-prisma.ts` |
| `NODE_MODULE_VERSION` mismatch | `npm rebuild better-sqlite3` + restart dev server |
| Jest flaky failures | `maxWorkers: 1` in `jest.config.js` |
| Blank `/tickets` page | Server-side `getSessionUser()` guard in `(app)/layout.tsx` |
| Cookie error in layout | No `cookies().delete()` in Server Components — use logout API |
| `users.map is not a function` | Check `response.ok` and `Array.isArray` before `setUsers` |

---

## Prompt History Rules

- Log major interactions in [`../../ai-prompts/`](../../ai-prompts/) — **append only**, never overwrite.
- Use format: `## Prompt #N` with Prompt, AI Response Summary, Accepted, Modified, Rejected, Reason.
- Phase files: `planning`, `design`, `implementation`, `testing`, `debugging`, `code-review`, `documentation`.

---

## Git & Branch Rules

- Work on feature branches: `cursor/<ticket>-<summary>`
- Never push directly to `main` or release branches
- Do not commit `.env`, `dev.db`, or `test.db`
- Only create commits when explicitly requested by the user

---

## What NOT to Share with AI

- Production API keys, passwords, JWT secrets
- Real customer data or PII
- Internal company credentials
- Contents of `.env` files

---

## Cursor Agent Workflow

1. Read `spec.md` + `project-context.md` for context
2. Plan → design → implement in layers (one prompt per layer)
3. Run `npm test` and `npm run build` after backend changes
4. Log prompt in appropriate `ai-prompts/` file
5. Self-review against acceptance criteria before marking done
6. Document bugs in `debugging-notes.md`; review findings in `code-review-notes.md`

---

## Reusable Patterns (keep these)

- Pure state machine module (`lib/ticket-state-machine.ts`) — no DB dependency
- Separate status endpoint — prevents bypass via general PATCH
- Server-side auth guard in layout + middleware + client refresh (defense in depth)
- Defensive API response handling in client components
- Zod validation on all write endpoints
- Integration tests against real SQLite persistence

---

## Related Docs

| Doc | Purpose |
|-----|---------|
| [`../../tool-workflow.md`](../../tool-workflow.md) | Full AI workflow across all phases |
| [`../../final-ai-usage-summary.md`](../../final-ai-usage-summary.md) | Accepted/modified/rejected AI output summary |
| [`../../reflection.md`](../../reflection.md) | What AI helped with and what it got wrong |
| [`../../debugging-notes.md`](../../debugging-notes.md) | Bug hunt documentation |
| [`../../code-review-notes.md`](../../code-review-notes.md) | AI-assisted code review findings |
