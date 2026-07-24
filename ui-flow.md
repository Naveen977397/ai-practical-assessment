# ui-flow

## Screen Map

```
/           → redirect to /tickets (if authenticated) or /login
/login      → Sign in (public)
/signup     → Create account (public)
/tickets          → Ticket list (search, filters, pagination)
/tickets/new      → Create ticket form
/tickets/[id]     → Ticket detail (edit, status, comments)
/users            → User management (Admin only)
/api-docs         → OpenAPI documentation browser
```

## Authentication Flow

1. Unauthenticated user visits any protected route → redirected to `/login`
2. User signs in with email/password → JWT stored in httpOnly cookie → redirect to `/tickets`
3. New users visit `/signup` → register → auto-login → redirect to `/tickets`
4. Header shows authenticated user name, role, and **Log out** button
5. `createdBy` on tickets and comments is set **server-side** from the JWT session (not sent by client)

## Ticket List (`/tickets`)

1. User lands on list page (authenticated)
2. Sees paginated tickets (newest first by default) from database
3. Can type keyword in search box → filters title/description
4. Can filter by status, priority, and assignee (including unassigned)
5. Can change sort field and order
6. Search and filters work together
7. Empty state when no matches
8. Click ticket row → navigate to detail
9. Click "New Ticket" → navigate to create form

**URL params:** `?q=keyword&status=OPEN&priority=HIGH&assignedToId=unassigned&sortBy=createdAt&sortOrder=desc&page=1&limit=10`

## Create Ticket (`/tickets/new`)

1. User fills: title, description, priority, optional assignee
2. Authenticated user is used as `createdBy` automatically on the server
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

## User Management (`/users`) — Admin only

1. Admin views list of all users
2. Can create new users with name, email, role, password
3. Can edit existing users
4. Can delete users without related tickets or comments

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
- API 401: redirect to login (session expired or invalid)
- API 403: permission denied (e.g. non-admin on `/users`)
- API 409 (invalid transition): prominent banner on detail page
- Network failure: retry-friendly error message
- 404 on detail: "Ticket not found" page
