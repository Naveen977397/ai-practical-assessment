# testing

## Prompt #1

### Prompt
Implement mandatory state-machine integration tests. Valid transitions must succeed; invalid transitions must be rejected. Tests must run against real persistence, not mocked state machine.

### AI Response Summary
Created `tests/integration/state-machine.test.ts` with parameterized valid and invalid transition tests. Test helpers in `tests/helpers/test-db.ts` reset database between tests and seed users. Jest configured in `src/jest.config.js` with ts-jest and path aliases. Initial run: 13 tests pass.

### Accepted
- Integration tests via `transitionTicketStatus` service function
- Real SQLite test database (`test.db`)
- Parameterized `it.each` for all transition cases

### Modified
- Tests exercise service layer directly (not HTTP routes) for focused business rule testing

### Rejected
- Mocking Prisma client (Core requires real persistence)

### Reason
Core mandatory test tier is integration tests proving state machine rules.

---

## Prompt #2

### Prompt
Add comment integration tests and fix test reliability issues.

### AI Response Summary
Added `tests/integration/comments.test.ts` (4 tests: add comment, reject empty, reject invalid user, comment on closed ticket). Diagnosed Jest parallel worker flakiness with shared SQLite DB. Fixed with `maxWorkers: 1` in jest config. Total: 17 tests, all passing.

### Accepted
- Comment integration tests
- Serial test execution for reliability

### Modified
- Added `Closed → Open` reopen test case when reopen feature was implemented

### Rejected
- Separate test database per worker (unnecessary complexity for assessment scope)

### Reason
User requested comment tests; flaky parallel execution discovered during compliance audit.

---

## Prompt #3

### Prompt
Add integration tests for stretch list API: keyword search, status/priority/assignee filters, sorting, and pagination.

### AI Response Summary
Created `tests/integration/list-tickets.test.ts` covering paginated list responses, combined filters, sort order, and unassigned assignee filter (`assignedToId=unassigned`). Tests seed tickets with varied statuses, priorities, and assignees. Assert on `items`, `total`, `page`, and `totalPages` fields.

### Accepted
- List API integration tests against real Prisma queries
- Pagination boundary checks (page size, total count)
- Filter combination tests

### Modified
- Test helpers extended to create tickets with specific attributes for filter scenarios

### Rejected
- HTTP-level supertest tests (service layer sufficient and faster)

### Reason
Stretch list API added new query parameters; integration tests prove filter/sort/pagination behavior.

---

## Prompt #4

### Prompt
Add integration tests for user CRUD API (stretch).

### AI Response Summary
Created `tests/integration/users.test.ts` with tests for list, create, update, delete, and duplicate-email rejection. Tests use `createUser`, `updateUser`, `deleteUser` service functions with real database. Validates role and password handling on create/update.

### Accepted
- User CRUD service integration tests
- Duplicate email (P2002) mapped to validation error

### Modified
- None reported

### Rejected
- Testing admin authorization at HTTP layer in this file (covered separately via `requireRole`)

### Reason
Stretch user management API needed persistence-level test coverage.

---

## Prompt #5

### Prompt
Add unit tests for the pure state machine module and auth integration tests for login/signup.

### AI Response Summary
Created `tests/unit/state-machine.test.ts` testing `isValidTransition`, `assertTransition`, and `getValidTransitions` without database I/O. Created `tests/integration/auth.test.ts` with tests for valid login, invalid password, user registration with Requester role, and duplicate email rejection on signup. Total suite grew to 44 tests.

### Accepted
- Pure unit tests on `lib/ticket-state-machine.ts`
- Auth service integration tests (authenticate + register)
- Signup → login flow verified (registered user can authenticate)

### Modified
- Jest `testMatch` includes both `tests/integration/` and `tests/unit/`

### Rejected
- E2E browser tests with Playwright (out of assessment scope)

### Reason
Stretch tier includes unit tests; auth feature added after stretch required its own integration coverage.

---

## Prompt #6

### Prompt
Verify full test suite passes after auth, signup, and middleware changes. Update test-results.md with current counts.

### AI Response Summary
Ran `npm test` — 44/44 passing across 6 suites (state-machine, comments, list-tickets, users, auth, unit). Documented results in `test-results.md` with per-suite breakdown. Noted `npm rebuild better-sqlite3` prerequisite when native module ABI mismatches.

### Accepted
- 44 tests as final count
- Per-suite documentation in test-results.md

### Modified
- `test-results.md` updated from 17 to 44 tests
- Manual verification checklist updated

### Rejected
- None reported

### Reason
User requested submission readiness; test evidence needed to reflect full feature set.
