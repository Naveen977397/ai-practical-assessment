# data-model

Prisma schema for Core entities. Implementation: [`src/prisma/schema.prisma`](src/prisma/schema.prisma).

## Enums

### Priority

| Value | Display |
|-------|---------|
| `LOW` | Low |
| `MEDIUM` | Medium |
| `HIGH` | High |

### TicketStatus

| Value | Display |
|-------|---------|
| `OPEN` | Open |
| `IN_PROGRESS` | In Progress |
| `RESOLVED` | Resolved |
| `CLOSED` | Closed |
| `CANCELLED` | Cancelled |

## User

Seeded only — no CRUD UI.

| Field | Type | Constraints |
|-------|------|-------------|
| id | String | PK, cuid |
| name | String | Required |
| email | String | Required, unique |
| role | String | Informational only in Core |

**Relations:** `createdTickets`, `assignedTickets`, `comments`

## Ticket

| Field | Type | Constraints |
|-------|------|-------------|
| id | String | PK, cuid |
| title | String | Required, max 200 chars |
| description | String | Required, max 5000 chars |
| priority | Priority | Required |
| status | TicketStatus | Default `OPEN` |
| assignedToId | String? | FK → User, nullable |
| createdById | String | FK → User, required |
| createdAt | DateTime | Auto-set |
| updatedAt | DateTime | Auto-updated |

**Relations:** `assignedTo`, `createdBy`, `comments`

## Comment

| Field | Type | Constraints |
|-------|------|-------------|
| id | String | PK, cuid |
| ticketId | String | FK → Ticket, cascade delete |
| message | String | Required, max 2000 chars |
| createdById | String | FK → User, required |
| createdAt | DateTime | Auto-set |

**Relations:** `ticket`, `createdBy`

## Entity Relationship

```
User 1──* Ticket (createdBy)
User 1──* Ticket (assignedTo, optional)
User 1──* Comment (createdBy)
Ticket 1──* Comment
```

## Indexes

- `User.email` — unique
- `Ticket.status` — supports status filter
- `Ticket.createdAt` — supports default sort (newest first)
