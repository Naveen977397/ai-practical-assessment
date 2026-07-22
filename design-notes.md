# design-notes

## Architecture

Layered design inside `src/`:

```
UI (Server + Client Components)
  → API Route Handlers (app/api)
    → Ticket Service (lib/services/)
      → State Machine + Zod Validation
        → Prisma Client → SQLite
```

## Key Decisions

### Separate status endpoint

Status changes use `PATCH /api/tickets/:id/status`, not the general update endpoint. The general PATCH rejects any `status` field in the body. This prevents bypassing the state machine and keeps transition logic in one place.

### State machine as pure module

`lib/ticket-state-machine.ts` is a pure function module with no Prisma dependency. Integration tests exercise it through `ticket-service.ts` with a real database, satisfying FR-TS-02.

### Acting user without authentication

Core has no auth. A header dropdown selects the acting user (persisted in `localStorage`). The client sends `createdById` explicitly on create and comment requests. No server-side session.

### Server vs Client Components

- **Server Components:** initial ticket list data, ticket detail fetch
- **Client Components:** forms, search/filter interactions, status buttons, user picker, error banners

### Validation

- **Zod** schemas in `lib/validations/` shared between API routes
- Backend always re-validates; frontend validation is UX only
- Trim strings before length checks

### Error handling

| Code | Meaning | UI treatment |
|------|---------|--------------|
| 400 | Validation | Inline field errors or form banner |
| 404 | Not found | Dedicated not-found state |
| 409 | Invalid transition | Status action error banner |
| 500 | Server error | Generic error message |

### Search on SQLite

SQLite `LIKE` is case-insensitive for ASCII. Prisma `contains` uses `LIKE` under the hood — no extra normalization needed for Core scope.

### Test database

Integration tests use a separate SQLite file (`test.db`) with migrations applied before the suite and data reset between tests.

## Out of Scope Reminders

No auth, no user CRUD UI, no pagination, no delete operations, no unit test tier in Core.
