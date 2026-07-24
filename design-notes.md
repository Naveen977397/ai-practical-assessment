# design-notes

## Architecture

Layered design inside `src/`:

```
Middleware (JWT route protection)
  → UI (Server + Client Components)
    → API Route Handlers (app/api)
      → Auth Session (lib/auth/session.ts)
        → Services (lib/services/)
          → State Machine + Zod Validation
            → Prisma Client → SQLite
```

## Key Decisions

### Separate status endpoint

Status changes use `PATCH /api/tickets/:id/status`, not the general update endpoint. The general PATCH rejects any `status` field in the body. This prevents bypassing the state machine and keeps transition logic in one place.

### State machine as pure module

`lib/ticket-state-machine.ts` is a pure function module with no Prisma dependency. Integration tests exercise it through `ticket-service.ts` with a real database; unit tests cover the module directly without I/O.

### JWT authentication (Stretch)

Replaced the Core acting-user picker with JWT auth:

- Login/signup via `POST /api/auth/login` and `POST /api/auth/signup`
- Session stored in httpOnly cookie (`auth_token`, 8h expiry)
- `middleware.ts` protects all routes except `/login`, `/signup`, and auth APIs
- Server-side auth guard in `(app)/layout.tsx` via `getSessionUser()`
- `createdById` set from JWT in services — client cannot spoof identity
- Admin role gates `/users` page and user mutation APIs

### Server vs Client Components

- **Server Components:** app layout auth guard, login/signup session checks
- **Client Components:** forms, search/filter interactions, status buttons, auth provider, error banners

### Validation

- **Zod** schemas in `lib/validations/` shared between API routes
- Backend always re-validates; frontend validation is UX only
- Trim strings before length checks

### Error handling

| Code | Meaning | UI treatment |
|------|---------|--------------|
| 400 | Validation | Inline field errors or form banner |
| 401 | Unauthenticated | Redirect to login |
| 403 | Forbidden | Permission denied message |
| 404 | Not found | Dedicated not-found state |
| 409 | Invalid transition | Status action error banner |
| 500 | Server error | Generic error message |

### Search on SQLite

SQLite `LIKE` is case-insensitive for ASCII. Prisma `contains` uses `LIKE` under the hood — no extra normalization needed.

### Test database

Integration tests use a separate SQLite file (`test.db`) with migrations applied before the suite and data reset between tests. Jest runs with `maxWorkers: 1` to avoid parallel contention.

## Stretch Features Implemented

- Paginated list API with priority/assignee filters and sorting
- User CRUD API and admin UI
- OpenAPI spec and `/api-docs` page
- Docker and GitHub Actions CI
- Unit tests on state machine module

## Known Limitations

- No ticket/comment delete operations
- No optimistic locking (last write wins)
- ESLint has known violations (lint step removed from CI; deferred cleanup)
- SQLite only (sufficient for assessment scope)
