# ui-flow

## Screen Map

```
/  → redirect to /tickets
/tickets          → Ticket list (search + status filter)
/tickets/new      → Create ticket form
/tickets/[id]     → Ticket detail (edit, status, comments)
```

## Global: Acting User Picker

- Rendered in the app header on every page
- Dropdown populated from `GET /api/users`
- Selection persisted in `localStorage` (`actingUserId`)
- Used as `createdById` when creating tickets and adding comments
- Default: first user in list if none stored

## Ticket List (`/tickets`)

1. User lands on list page
2. Sees all tickets (newest first) from database
3. Can type keyword in search box → filters title/description
4. Can select status from dropdown (`All`, `Open`, `In Progress`, etc.)
5. Search and filter work together
6. Empty state when no matches
7. Click ticket row → navigate to detail
8. Click "New Ticket" → navigate to create form

**URL params:** `?q=keyword&status=OPEN`

## Create Ticket (`/tickets/new`)

1. User fills: title, description, priority, optional assignee
2. Acting user from header is sent as `createdById`
3. Submit → POST `/api/tickets`
4. On success → redirect to detail or list
5. On validation error → show inline error messages

## Ticket Detail (`/tickets/[id]`)

1. Load ticket + comments from `GET /api/tickets/:id`
2. Display: title, description, priority, status badge, assignee, creator, timestamps
3. Editable section: title, description, priority, assignee → Save calls PATCH `/api/tickets/:id`
4. Status section: buttons for **valid next statuses only** (from state machine)
   - Click → PATCH `/api/tickets/:id/status`
   - On 409 → show error banner
5. Comments section: chronological list + form to add comment
6. Loading and error states for all async actions

## Status Action Buttons by Current Status

| Current Status | Actions Shown |
|----------------|---------------|
| Open | Start Work (→ In Progress), Cancel |
| In Progress | Resolve (→ Resolved), Cancel |
| Resolved | Close (→ Closed) |
| Closed | Reopen (→ Open) |
| Cancelled | (none) |

## Error States

- Form validation errors: inline under fields
- API 400: show message from `error` field
- API 409 (invalid transition): prominent banner on detail page
- Network failure: retry-friendly error message
- 404 on detail: "Ticket not found" page
