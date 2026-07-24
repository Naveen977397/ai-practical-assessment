# api-contract

REST API contract. Base path: `/api`. All endpoints except auth and public pages require a valid JWT session cookie.

## Error Response Format

```json
{
  "error": "Human-readable message",
  "details": {}
}
```

| Status | When |
|--------|------|
| 400 | Validation failure |
| 401 | Not authenticated |
| 403 | Insufficient permissions |
| 404 | Resource not found |
| 409 | Invalid status transition |
| 500 | Unexpected server error |

---

## Authentication Endpoints

All auth endpoints are public (no session required).

### POST /api/auth/login

Sign in with email and password. Sets httpOnly JWT cookie.

**Request body:** `{ "email": "string", "password": "string" }`  
**Response 200:** `{ "user": { "id", "name", "email", "role" } }`  
**Response 400:** Invalid credentials

### POST /api/auth/signup

Register a new user (default role: Requester). Sets httpOnly JWT cookie.

**Request body:** `{ "name", "email", "password", "confirmPassword" }`  
**Response 201:** `{ "user": { ... } }`  
**Response 400:** Validation failure or duplicate email

### POST /api/auth/logout

Clears the auth cookie. **Response 200:** `{ "success": true }`

### GET /api/auth/me

Returns the current authenticated user.  
**Response 200:** `{ "user": { ... } }` | **Response 401:** Not authenticated

---

## GET /api/users

List users for assignee dropdowns and admin user management UI. Requires authentication.

**Response 200:**

```json
[
  { "id": "...", "name": "...", "email": "...", "role": "..." }
]
```

---

## POST /api/users

Create a user (Stretch).

**Request body:**

```json
{
  "name": "string",
  "email": "string",
  "role": "string"
}
```

**Response 201:** Created user object.

**Response 400:** Validation failure or duplicate email.

---

## GET /api/users/:id

Get a single user (Stretch).

**Response 200:** User object.

**Response 404:** User not found.

---

## PATCH /api/users/:id

Update user fields (Stretch).

**Request body (all optional):**

```json
{
  "name": "string",
  "email": "string",
  "role": "string"
}
```

**Response 200:** Updated user object.

---

## DELETE /api/users/:id

Delete a user (Stretch). Fails if user has created tickets or comments.

**Response 204:** Deleted.

**Response 400:** User has related records.

---

## GET /api/tickets

List tickets with search, filters, sorting, and pagination (Stretch).

**Query params:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| q | string? | — | Keyword search (title + description, partial match) |
| status | string? | — | Filter by status enum value |
| priority | string? | — | Filter by priority (`LOW`, `MEDIUM`, `HIGH`) |
| assignedToId | string? | — | Filter by assignee user ID, or `unassigned` |
| sortBy | string | `createdAt` | `createdAt`, `updatedAt`, `priority`, `title` |
| sortOrder | string | `desc` | `asc` or `desc` |
| page | number | `1` | Page number (1-based) |
| limit | number | `10` | Page size (max 100) |

**Response 200:**

```json
{
  "items": [
    {
      "id": "...",
      "title": "...",
      "description": "...",
      "priority": "MEDIUM",
      "status": "OPEN",
      "assignedTo": { "id": "...", "name": "...", "email": "...", "role": "..." } | null,
      "createdBy": { "id": "...", "name": "...", "email": "...", "role": "..." },
      "createdAt": "ISO-8601",
      "updatedAt": "ISO-8601"
    }
  ],
  "page": 1,
  "limit": 10,
  "total": 42,
  "totalPages": 5
}
```

---

## POST /api/tickets

Create a ticket (status defaults to `OPEN`). `createdBy` is set server-side from the authenticated session.

**Request body:**

```json
{
  "title": "string",
  "description": "string",
  "priority": "LOW" | "MEDIUM" | "HIGH",
  "assignedToId": "string | null"
}
```

**Response 201:** Created ticket object (same shape as list item).

**Response 400:** Missing/invalid fields or invalid user references.

---

## GET /api/tickets/:id

Ticket detail with comments.

**Response 200:**

```json
{
  "id": "...",
  "title": "...",
  "description": "...",
  "priority": "MEDIUM",
  "status": "OPEN",
  "assignedTo": { ... } | null,
  "createdBy": { ... },
  "createdAt": "ISO-8601",
  "updatedAt": "ISO-8601",
  "comments": [
    {
      "id": "...",
      "message": "...",
      "createdAt": "ISO-8601",
      "createdBy": { ... }
    }
  ]
}
```

Comments ordered oldest first.

**Response 404:** Ticket not found.

---

## PATCH /api/tickets/:id

Update ticket fields. **Status cannot be changed via this endpoint.**

**Request body (all fields optional):**

```json
{
  "title": "string",
  "description": "string",
  "priority": "LOW" | "MEDIUM" | "HIGH",
  "assignedToId": "string | null"
}
```

**Response 200:** Updated ticket object.

**Response 400:** Validation failure or body includes `status`.

**Response 404:** Ticket not found.

---

## PATCH /api/tickets/:id/status

Change ticket status via state machine.

**Allowed transitions:**

| From | To |
|------|-----|
| OPEN | IN_PROGRESS, CANCELLED |
| IN_PROGRESS | RESOLVED, CANCELLED |
| RESOLVED | CLOSED |
| CLOSED | OPEN (Reopen) |
| CANCELLED | (terminal) |

**Request body:**

```json
{
  "status": "IN_PROGRESS" | "RESOLVED" | "CLOSED" | "CANCELLED" | "OPEN"
}
```

**Response 200:** Updated ticket object.

**Response 409:** Invalid transition from current status.

**Response 404:** Ticket not found.

---

## POST /api/tickets/:id/comments

Add a comment to a ticket. `createdBy` is set server-side from the authenticated session.

**Request body:**

```json
{
  "message": "string"
}
```

**Response 201:** Created comment object.

**Response 400:** Validation failure.

**Response 404:** Ticket not found.

---

## GET /api/openapi

Returns the OpenAPI 3.0 specification (Stretch).

**Response 200:** `application/yaml` OpenAPI document.
