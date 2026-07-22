# Test Results

**Date:** 2026-07-22  
**Environment:** Node.js, SQLite (`test.db`), Prisma 7 with better-sqlite3 adapter

---

## Automated Tests

**Command:** `npm test` (from `src/`)  
**Result:** PASS

```
Test Suites: 6 passed, 6 total
Tests:       44 passed, 44 total
Time:        ~12s
```

### State-Machine Integration Tests (`tests/integration/state-machine.test.ts`)

| Category | Tests | Result |
|----------|-------|--------|
| Valid transitions | 6 | PASS |
| Invalid transitions | 7 | PASS |

**Valid transitions tested:**
- Open → In Progress
- In Progress → Resolved
- Resolved → Closed
- Closed → Open (Reopen)
- Open → Cancelled
- In Progress → Cancelled

**Invalid transitions tested (sample):**
- Open → Resolved, Open → Closed
- In Progress → Open, In Progress → Closed
- Resolved → Open, Resolved → Cancelled
- Cancelled → Open

### Comment Integration Tests (`tests/integration/comments.test.ts`)

| Test | Result |
|------|--------|
| Add comment to existing ticket | PASS |
| Reject empty comment | PASS |
| Reject invalid user | PASS |
| Allow comments on closed tickets | PASS |

### List Tickets Integration Tests (`tests/integration/list-tickets.test.ts`)

| Test | Result |
|------|--------|
| Keyword search | PASS |
| Status filter | PASS |
| Priority filter | PASS |
| Assignee filter (including unassigned) | PASS |
| Sorting and pagination | PASS |

### Auth Integration Tests (`tests/integration/auth.test.ts`)

| Test | Result |
|------|--------|
| Authenticate with valid credentials | PASS |
| Reject invalid password | PASS |
| Register new user with Requester role | PASS |
| Reject duplicate email on signup | PASS |

### Users Integration Tests (`tests/integration/users.test.ts`)

| Test | Result |
|------|--------|
| List users | PASS |
| Create user | PASS |
| Update user | PASS |
| Delete user | PASS |
| Reject duplicate email | PASS |

### State-Machine Unit Tests (`tests/unit/state-machine.test.ts`)

| Test | Result |
|------|--------|
| Valid transition checks | PASS |
| Invalid transition checks | PASS |
| Valid next-status actions | PASS |

Tests run against real SQLite persistence via Prisma adapter (not mocked state machine).

---

## Production Build

**Command:** `npm run build` (from `src/`)  
**Result:** PASS

All routes compile successfully, including:
- `/`, `/login`, `/signup`, `/tickets`, `/tickets/new`, `/tickets/[id]`, `/users`, `/api-docs`
- `/api/auth/login`, `/api/auth/signup`, `/api/auth/logout`, `/api/auth/me`
- `/api/users`, `/api/tickets`, `/api/tickets/[id]`, `/api/tickets/[id]/status`, `/api/tickets/[id]/comments`, `/api/openapi`

---

## Lint

**Command:** `npm run lint` (from `src/`)  
**Result:** Recommended before final submission

---

## Manual Verification Checklist

| AC | Verified |
|----|----------|
| AC-01 Create ticket via UI | Manual |
| AC-02 View all tickets | Manual |
| AC-03 Ticket detail view | Manual |
| AC-04 Update fields and reassign | Manual |
| AC-05 Add comments | Manual + integration test |
| AC-06–07 State machine | Integration test + manual UI |
| AC-08 Search and filter | Manual + integration test |
| AC-09 Backend validation | Integration test + manual |
| AC-10 Data persistence | Manual (restart verified) |
| AC-11 No secrets in repo | `.env` gitignored, `.env.example` provided |
| AC-12 Integration tests pass | Automated (44/44) |
