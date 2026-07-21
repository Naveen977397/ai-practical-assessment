# api-contract

REST API contract for Core features. Base path: `/api`.

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
| 404 | Resource not found |
| 409 | Invalid status transition |
| 500 | Unexpected server error |

---

## GET /api/users

List seeded users for the acting-user picker.

**Response 200:**

```json
[
  { "id": "...", "name": "...", "email": "...", "role": "..." }
]
```

---

## GET /api/tickets

List tickets with optional search and status filter.

**Query params:**

| Param | Type | Description |
|-------|------|-------------|
| q | string? | Keyword search (title + description, partial match) |
| status | string? | Filter by status enum value; omit for all |

**Response 200:**

```json
[
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
]
```

Sorted by `createdAt` descending.

---

## POST /api/tickets

Create a ticket (status defaults to `OPEN`).

**Request body:**

```json
{
  "title": "string",
  "description": "string",
  "priority": "LOW" | "MEDIUM" | "HIGH",
  "createdById": "string",
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

Add a comment to a ticket.

**Request body:**

```json
{
  "message": "string",
  "createdById": "string"
}
```

**Response 201:** Created comment object.

**Response 400:** Validation failure.

**Response 404:** Ticket not found.
