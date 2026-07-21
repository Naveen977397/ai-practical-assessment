# test-results

## State-Machine Integration Tests

**Date:** 2026-07-21  
**Command:** `npm test` (from `src/`)  
**Result:** PASS

```
Test Suites: 1 passed, 1 total
Tests:       13 passed, 13 total
```

### Coverage

| Category | Tests |
|----------|-------|
| Valid transitions | 5 (Open→In Progress, In Progress→Resolved, Resolved→Closed, Open→Cancelled, In Progress→Cancelled) |
| Invalid transitions | 8 (skip-ahead, reverse, terminal state attempts) |

Tests run against real SQLite persistence via Prisma adapter (not mocked state machine).

## Build

**Command:** `npm run build`  
**Result:** PASS
