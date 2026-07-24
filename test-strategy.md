# Test Strategy

## Test Scope

| Area | Covered | Method |
|------|---------|--------|
| Status state machine (valid transitions) | Yes | Integration + unit tests |
| Status state machine (invalid transitions) | Yes | Integration + unit tests |
| Comment creation | Yes | Integration tests via `comment.service.ts` |
| List API (filters, sort, pagination) | Yes | Integration tests |
| User CRUD | Yes | Integration tests |
| Auth (login, signup) | Yes | Integration tests |
| API route handlers | Indirectly | Tests exercise service layer with real Prisma |
| UI components | No | Manual verification |

---

## Unit Tests

**Location:** `tests/unit/state-machine.test.ts`

Direct tests on `lib/ticket-state-machine.ts` without database I/O:

- `canTransition` for valid and invalid pairs
- `getValidTransitions` per status
- `assertTransition` throws `InvalidStatusTransitionError`

**Count:** 12 unit tests

---

## Component Tests

**Not implemented.** UI forms and status buttons were verified manually. Stretch tier would add React Testing Library tests for form validation and error display.

---

## API / Integration Tests

**Location:** `tests/integration/`  
**Runner:** Jest + ts-jest (from `src/`)  
**Database:** Separate SQLite file (`src/test.db`)  
**Config:** `src/jest.config.js` with `maxWorkers: 1` for serial execution

### State Machine Tests (`state-machine.test.ts`) — 13 tests

| Category | Count | Examples |
|----------|-------|---------|
| Valid transitions | 6 | Open→In Progress, Resolved→Closed, Closed→Open (Reopen) |
| Invalid transitions | 7 | Open→Closed, In Progress→Open, Cancelled→Open |

### Comment Tests (`comments.test.ts`) — 4 tests

| Test | Purpose |
|------|---------|
| Add comment to existing ticket | Basic comment persistence |
| Reject empty comment | Validation |
| Allow comments on closed tickets | Comments allowed in any status |
| Throw when ticket does not exist | Not found handling |

### List API Tests (`list-tickets.test.ts`) — 6 tests

Keyword search, status/priority/assignee filters, pagination.

### User CRUD Tests (`users.test.ts`) — 5 tests

Create, update, delete, duplicate email rejection, delete protection.

### Auth Tests (`auth.test.ts`) — 4 tests

Valid login, invalid password, signup with Requester role, duplicate email rejection.

**Total:** 44 tests across 6 suites

### Test Helpers

- `tests/helpers/jest-setup.ts` — sets `DATABASE_URL` to test DB, runs migrations
- `tests/helpers/test-db.ts` — `resetTestDatabase()`, `seedTestUsers()`, `createTestTicket()`

---

## Edge Case Tests

Covered within integration tests:

- Skip-ahead transitions (Open→Resolved, Open→Closed)
- Reverse transitions (In Progress→Open)
- Terminal state attempts (Cancelled→Open)
- Reopen from Closed (Closed→Open)
- Duplicate email on signup
- Delete user with related tickets blocked

Not covered:

- Concurrent status transitions
- Network failure simulation in UI
- E2E browser tests

---

## Tests Not Covered (and why)

| Gap | Reason |
|-----|--------|
| API route HTTP status code tests | Service layer tests prove business rules; routes are thin wrappers |
| UI/component tests | Not in mandatory tier; manual verification sufficient |
| E2E browser tests | Out of scope for assessment |
| Load/performance tests | Not required for NFRs |

---

## Running Tests

```bash
cd src
npm test
```

Expected: 6 test suites, 44 tests, all passing.

See [`test-results.md`](test-results.md) for latest run output.
