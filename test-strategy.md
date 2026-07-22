# Test Strategy

## Test Scope

Core mandatory testing tier: **integration tests** that prove state-machine rules against real database persistence. No unit test tier in Core scope (Stretch).

| Area | Covered | Method |
|------|---------|--------|
| Status state machine (valid transitions) | Yes | Integration tests via `ticket.service.ts` |
| Status state machine (invalid transitions) | Yes | Integration tests expecting `InvalidStatusTransitionError` |
| Comment creation | Yes | Integration tests via `comment.service.ts` |
| API route handlers | Indirectly | Tests exercise service layer with real Prisma |
| UI components | No | Manual verification; out of Core test tier |
| Field validation (Zod) | Partially | Covered when invalid data hits service layer |

---

## Unit Tests

**Not implemented (Core scope).** State machine logic is tested indirectly through integration tests. A Stretch tier would add direct unit tests on `ticket-state-machine.ts` without database I/O.

---

## Component Tests

**Not implemented (Core scope).** UI forms and status buttons were verified manually. Stretch would add React Testing Library tests for form validation and error display.

---

## API / Integration Tests

**Location:** `tests/integration/`  
**Runner:** Jest + ts-jest (from `src/`)  
**Database:** Separate SQLite file (`src/test.db`)  
**Config:** `src/jest.config.js` with `maxWorkers: 1` for serial execution

### State Machine Tests (`state-machine.test.ts`)

| Category | Count | Examples |
|----------|-------|---------|
| Valid transitions | 6 | Open→In Progress, Resolved→Closed, Closed→Open (Reopen) |
| Invalid transitions | 7 | Open→Closed, In Progress→Open, Cancelled→Open |

### Comment Tests (`comments.test.ts`)

| Test | Purpose |
|------|---------|
| Add comment to existing ticket | Basic comment persistence |
| Reject empty comment | Validation |
| Reject invalid user | FK validation |
| Comment on closed ticket | Comments allowed in any status |

**Total:** 17 integration tests

### Test Helpers

- `tests/helpers/jest-setup.ts` — sets `DATABASE_URL` to test DB
- `tests/helpers/test-db.ts` — `resetTestDatabase()`, `seedTestUsers()`, `createTestTicket()`

---

## Edge Case Tests

Covered within integration tests:

- Skip-ahead transitions (Open→Resolved, Open→Closed)
- Reverse transitions (In Progress→Open)
- Terminal state attempts (Cancelled→Open)
- Reopen from Closed (Closed→Open)

Not covered (acceptable for Core):

- Concurrent status transitions
- Extremely long title/description strings (Zod max-length tested at schema level only)
- Network failure simulation in UI

---

## Tests Not Covered (and why)

| Gap | Reason |
|-----|--------|
| Unit tests on pure state machine | Core mandates integration tier only; state machine is small and fully covered via service layer |
| API route HTTP status code tests | Service layer tests prove business rules; routes are thin wrappers |
| UI/component tests | Not in Core mandatory tier |
| E2E browser tests | Out of scope; manual UI verification sufficient for assessment |
| Load/performance tests | Not required for Core NFRs |
| Auth/authorization tests | Auth is Stretch; not implemented |

---

## Running Tests

```bash
cd src
npm test
```

Expected: 2 test suites, 17 tests, all passing.

See [`test-results.md`](test-results.md) for latest run output.
