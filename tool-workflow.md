# Tool Workflow

**Candidate:** Naveen | **Role:** Software Engineer  
**Primary AI Tool:** Cursor (Agent mode)  
**Project:** Support Ticket Management System  
**Submission:** 2026-07-22

How AI (Cursor) was used across the full assessment lifecycle.

---

## Part A: AI Workflow Foundation

### 1. Primary AI tool used

**Cursor** (Agent mode) — used for planning, design, implementation, testing, debugging, code review, and documentation.

### 2. How I provide project context

- Persistent spec: `tool-specific/cursor-workflow/spec.md`
- Assessment docs in prompts: `requirements-analysis.md`, `acceptance-criteria.md`
- Scoped prompts with explicit stack and scope boundaries (Core vs Stretch)
- Append-only prompt history in `ai-prompts/`

### 3. How I use AI for requirement analysis

AI acted as senior BA to produce `requirements-analysis.md`. I reviewed assumptions and approved defaults before implementation.

### 4. How I use AI for planning and design

AI drafted data model, API contract, UI flow, and design notes. I validated state machine rules and endpoint separation before coding.

### 5. How I use AI for code generation

Incremental prompts per layer (schema → API → tests → UI → auth). Explicit scope per prompt; reviewed every diff.

### 6. How I validate AI-generated code

- `npm test` after every backend change (44 tests)
- `npm run build` for TypeScript/Next.js errors
- Manual UI smoke tests (login, ticket lifecycle, comments)
- Cross-check against AC-01 through AC-12
- Reject suggestions that fail tests or violate scope

### 7. How I use AI for testing

AI scaffolded integration and unit tests. I verified against real SQLite. Fixed Jest flakiness with AI diagnosis.

### 8. How I use AI for debugging

AI helped with Prisma 7 adapter, native module issues, auth redirects, and cookie restrictions. Documented in `debugging-notes.md`.

### 9. How I use AI for code review

AI-assisted self-review of state machine, auth security, and stretch regressions. Findings in `code-review-notes.md`.

### 10. What information I avoid sharing with AI

- Production API keys, passwords, JWT secrets
- Real customer data or PII
- Internal company credentials
- `.env` file contents (only variable names/requirements)

### 11. How I would reuse this workflow in a real project

Repo structure + spec first → plan → design → implement in layers → test after each change → log prompts → self-review → CI on every push.

---

## Tool Selection

**Primary tool:** Cursor (Agent mode)  
**Workflow folder:** [`tool-specific/cursor-workflow/`](tool-specific/cursor-workflow/)

Cursor was chosen for its ability to work across the full repository — planning docs, application code, tests, prompt history, and submission artifacts — in a single context-aware session. Agent mode enabled multi-file edits, terminal commands, and iterative debugging without switching tools.

---

## Workflow Phases

### 1. Planning

- Set repository structure per assessment spec (placeholder files, folder layout)
- AI acted as senior business analyst for Core requirements analysis
- Produced `requirements-analysis.md`, `acceptance-criteria.md`, and Cursor `spec.md`
- Human reviewed and approved assumptions before implementation
- Created phased implementation plan (design → DB → domain → API → tests → UI)

**Outcome:** Clear scope boundaries, stable requirement IDs (FR-*, NFR-*, AC-*), agreed defaults for unresolved PO questions.

### 2. Design

- AI drafted `data-model.md`, `api-contract.md`, `ui-flow.md`, `design-notes.md`, `implementation-plan.md`
- Human validated state machine rules, entity relationships, and API separation (status vs field update)
- Later design passes covered stretch API (pagination, filters), JWT auth, and signup flow

**Outcome:** Layered architecture blueprint used for all implementation phases.

### 3. Implementation (incremental)

Each layer was implemented in a separate prompt to keep scope reviewable:

| Step | Scope |
|------|-------|
| 1 | Prisma schema + migration + seed (users only) |
| 2 | Ticket CRUD API (no status/comments) |
| 3 | Status transitions + state machine + integration tests |
| 4 | Comments API + comment integration tests |
| 5 | UI (list, create, detail, acting user picker) |
| 6 | UI readability polish |
| 7 | Reopen closed tickets (`Closed` → `Open`) |
| 8 | Stretch: list filters, pagination, user CRUD, OpenAPI, Docker, CI |
| 9 | JWT authentication (replaced acting-user picker) |
| 10 | Signup page + auth redirect fixes |

**Practice:** Ran `npm test` and `npm run build` after every backend change.

### 4. Testing

- AI generated integration test scaffolding for state machine, comments, list API, users, and auth
- Added unit tests on pure state machine module (stretch)
- Human ran tests against real SQLite persistence
- Fixed Jest parallel-worker flakiness (`maxWorkers: 1`)
- Final suite: **44 tests, 6 suites, all passing**

### 5. Debugging

AI assisted with diagnosis; human validated every fix:

| Issue | Resolution |
|-------|------------|
| Prisma 7 adapter required | `@prisma/adapter-better-sqlite3` + client factory |
| better-sqlite3 ABI mismatch | `npm rebuild better-sqlite3` + `postinstall` script |
| Missing `make` on Linux | Install `build-essential` |
| Jest parallel DB contention | `maxWorkers: 1` |
| Login 500 error | Native module rebuild + dev server restart |
| `users.map is not a function` | Defensive API response handling |
| Blank page on `/tickets` | Server-side auth guard in layout |
| Cookie modification in layout | Redirect only; clear via logout API |

Full details: [`debugging-notes.md`](debugging-notes.md)

### 6. Code Review

- AI-assisted self-review after Core, stretch, auth, and final submission
- Documented strengths, findings, and rejected suggestions
- Tracked post-review fixes in `review-fixes.md` and `code-review-notes.md`

### 7. Documentation

- Prompt history maintained in `ai-prompts/` after each major task (append-only)
- Submission artifacts completed: candidate-info, reflection, PR description, test results, AI usage summary
- Updated acceptance criteria and README as features were added

---

## Cursor-Specific Practices

| Practice | Detail |
|----------|--------|
| Context files | `tool-specific/cursor-workflow/spec.md` as persistent project context |
| Scoped prompts | One feature layer per prompt (schema, API, UI, auth) |
| Review before accept | Verified AI output against acceptance criteria; ran tests |
| Rejection discipline | Declined scope expansion until explicitly requested |
| Branch safety | Work on feature branches (`cursor/<ticket>-<summary>`), not `main` |
| Agent mode | Multi-file edits, terminal runs, iterative debugging in single session |
| Prompt logging | Accepted/Modified/Rejected recorded in `ai-prompts/` per phase |

---

## Prompt History

Full prompt history in [`ai-prompts/`](ai-prompts/):

| File | Phase | Entries |
|------|-------|---------|
| `planning.md` | Repo setup, requirements analysis, implementation plan | 3 |
| `design.md` | Architecture, stretch, auth, signup design | 4 |
| `implementation.md` | Schema, API, UI, stretch, auth, compliance | 8 |
| `testing.md` | Integration, unit, auth, stretch tests | 6 |
| `debugging.md` | Prisma, native module, auth, UI issues | 8 |
| `code-review.md` | Core, stretch, auth, submission reviews | 5 |
| `documentation.md` | Prompt history workflow | 1 |

---

## What Worked Well

- **Incremental prompts** with explicit scope boundaries prevented over-engineering
- **Pure state machine module** made testing straightforward and prevented bypass
- **Cursor spec file** provided consistent context across sessions
- **Append-only prompt history** created an auditable record of AI collaboration
- **Defense-in-depth auth** (middleware + server layout + client refresh) handled edge cases after iteration

## What Required Human Judgment

- Approving requirements assumptions before implementation
- Validating integration test results against real DB (not mocked)
- Deciding to add reopen, auth, and signup based on explicit user requests
- Rejecting premature stretch features during Core phase
- Diagnosing environment-specific issues (build tools, native module ABI)
- Fixing Next.js-specific restrictions (cookie writes in layouts)
- Filling candidate details and reviewing submission artifacts for accuracy

## Reusable Workflow for Future Projects

1. Set up repo structure and spec file first
2. Plan → design → implement in layers with one prompt per layer
3. Run tests after every backend change
4. Log prompts with Accepted/Modified/Rejected
5. Self-review before submission
6. Keep a debugging notes file for environment issues
