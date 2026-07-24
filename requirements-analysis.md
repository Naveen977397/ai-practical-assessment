# requirements-analysis

## Business Context

An internal Support Ticket Management System for creating, updating, commenting on, searching, and progressing support tickets through a defined lifecycle. Users are **seeded in the database only** — no user-management UI is required. **Authentication and authorization are out of scope for Core** (Stretch only).

**Scope:** Core (Mandatory) requirements only. Stretch features are explicitly excluded.

**Technology stack (agreed):** Next.js App Router, Prisma, SQLite — application code lives in [`src/`](src/).

---

## 1. Functional Requirements

### 1.1 Data Model

| Entity | Fields | Core Behavior |
|--------|--------|---------------|
| **User** | `id`, `name`, `email`, `role` | Seeded only; referenced as `createdBy` and `assignedTo`; no CRUD UI |
| **Ticket** | `id`, `title`, `description`, `priority`, `status`, `assignedTo`, `createdBy`, `createdAt`, `updatedAt` | Full lifecycle via UI and API |
| **Comment** | `id`, `ticketId`, `message`, `createdBy`, `createdAt` | Append-only on a ticket; no edit/delete in Core |

| ID | Requirement |
|----|-------------|
| **FR-DM-01** | System shall persist Users, Tickets, and Comments in a database. |
| **FR-DM-02** | `createdBy` on Ticket and Comment shall reference a seeded User. |
| **FR-DM-03** | `assignedTo` on Ticket shall reference a seeded User; may be null (unassigned). |
| **FR-DM-04** | `createdAt` and `updatedAt` shall be set and maintained by the system. |

---

### 1.2 Ticket Creation

| ID | Requirement |
|----|-------------|
| **FR-TC-01** | User can create a ticket via the UI with `title`, `description`, and `priority`. |
| **FR-TC-02** | New tickets shall default to status **Open**. |
| **FR-TC-03** | `createdBy` shall be set to the currently selected acting user. |
| **FR-TC-04** | Backend shall reject creation when required fields are missing or invalid. |
| **FR-TC-05** | `assignedTo` is optional at creation; user may assign during creation or leave unassigned. |

---

### 1.3 Ticket Listing

| ID | Requirement |
|----|-------------|
| **FR-TL-01** | User can view a list of all tickets loaded from the database (not in-memory or mock data). |
| **FR-TL-02** | List shall support keyword search across ticket `title` and `description`. |
| **FR-TL-03** | List shall support filter by status (`All`, `Open`, `In Progress`, `Resolved`, `Closed`, `Cancelled`). |
| **FR-TL-04** | Keyword search and status filter shall be combinable. |
| **FR-TL-05** | Default list sort order shall be newest first (`createdAt` descending). |

---

### 1.4 Ticket Detail View

| ID | Requirement |
|----|-------------|
| **FR-TD-01** | User can open a single ticket detail view showing ticket fields, current status, assignee, creator, timestamps, and related comments. |
| **FR-TD-02** | Detail view shall reflect the latest persisted state after updates. |

---

### 1.5 Ticket Field Updates

| ID | Requirement |
|----|-------------|
| **FR-TU-01** | User can update `title`, `description`, `priority`, and `assignedTo` (reassign). |
| **FR-TU-02** | Updates shall persist to the database and update `updatedAt`. |
| **FR-TU-03** | Backend shall validate all updatable fields and reject invalid input. |
| **FR-TU-04** | Status shall **not** be updated through the general field-update path; it uses the state machine (§1.6). |
| **FR-TU-05** | Field updates are permitted on tickets in any status, including `Closed` and `Cancelled`. |

---

### 1.6 Status State Machine

Allowed transitions only:

```
Open         → In Progress
In Progress  → Resolved
Resolved     → Closed
Open         → Cancelled
In Progress  → Cancelled
```

| ID | Requirement |
|----|-------------|
| **FR-SM-01** | Ticket status shall be one of: `Open`, `In Progress`, `Resolved`, `Closed`, `Cancelled`. |
| **FR-SM-02** | Backend shall enforce transitions — valid transitions succeed; invalid transitions are rejected with a clear error. |
| **FR-SM-03** | Frontend shall expose only valid next-status actions for the current state. |
| **FR-SM-04** | Frontend shall display meaningful errors when the backend rejects an invalid transition. |
| **FR-SM-05** | `Cancelled` is a terminal state with no further transitions. `Closed` may be reopened to `Open` (post-Core enhancement for mistaken closures). |
| **FR-SM-06** | Any internal user may change ticket status; assignee-only restrictions do not apply in Core. |
| **FR-SM-07** | Status may be changed regardless of whether an assignee is set. |

**Invalid transitions (non-exhaustive):**

- `Open` → `Resolved`, `Closed`
- `In Progress` → `Open`, `Closed`
- `Resolved` → `Open`, `In Progress`, `Cancelled`
- `Cancelled` → any

**Post-Core enhancement:** `Closed` → `Open` (Reopen) is allowed so mistakenly closed tickets can be restored.

---

### 1.7 Comments

| ID | Requirement |
|----|-------------|
| **FR-CM-01** | User can add a comment to a ticket from the detail view. |
| **FR-CM-02** | Comment shall store `message`, `createdBy`, `createdAt`, and `ticketId`. |
| **FR-CM-03** | Backend shall reject empty or whitespace-only comment messages. |
| **FR-CM-04** | Comments shall be visible on the ticket detail view in chronological order (oldest first). |
| **FR-CM-05** | Comments may be added on tickets in any status, including `Closed` and `Cancelled`. |

---

### 1.8 Search and Filter

| ID | Requirement |
|----|-------------|
| **FR-SF-01** | Keyword search shall match tickets by `title` and `description` (case-insensitive, partial match). |
| **FR-SF-02** | Status filter shall restrict results to the selected status, or show all when `All` is selected. |
| **FR-SF-03** | Results shall come from persisted database data. |
| **FR-SF-04** | Empty keyword search shall return all tickets (subject to active status filter). |

---

### 1.9 Validation and Error Handling

| ID | Requirement |
|----|-------------|
| **FR-VE-01** | Backend is the source of truth for validation (required fields, enums, foreign keys, state transitions). |
| **FR-VE-02** | UI shall surface validation and business-rule errors in a user-readable way. |
| **FR-VE-03** | Invalid API requests shall not corrupt persisted data. |

**Validation rules (agreed defaults):**

| Field | Rule |
|-------|------|
| `title` | Required; non-empty after trim; max 200 characters |
| `description` | Required; non-empty after trim; max 5000 characters |
| `priority` | Required; one of `Low`, `Medium`, `High` |
| `status` | System-managed via state machine |
| `assignedTo` | Optional; must reference an existing seeded User if provided |
| `message` (comment) | Required; non-empty after trim; max 2000 characters |

---

### 1.10 Testing (Core Mandatory Tier)

| ID | Requirement |
|----|-------------|
| **FR-TS-01** | Integration tests shall prove state-machine rules: each valid transition succeeds; representative invalid transitions are rejected by the backend. |
| **FR-TS-02** | Tests shall run against real persistence layer behavior (not mocked state logic in isolation). |

---

### 1.11 Out of Scope (Core)

- User CRUD and role management UI
- Authentication, protected routes, API authorization checks
- Filter by priority or assignee; sorting controls beyond default; pagination
- Unit tests, edge-case/failure test suites, OpenAPI/Swagger, Docker, CI (Stretch)
- Ticket deletion
- Comment edit and delete

---

## 2. Non-Functional Requirements

| ID | Category | Requirement |
|----|----------|-------------|
| **NFR-01** | Persistence | All tickets, comments, and seed users survive application restart |
| **NFR-02** | Data integrity | Referential integrity between Ticket ↔ User and Comment ↔ Ticket |
| **NFR-03** | Validation | Server-side validation on all write operations |
| **NFR-04** | Usability | Meaningful, actionable error states in the UI (not silent failures) |
| **NFR-05** | Security | No secrets (API keys, DB credentials) committed to the repository |
| **NFR-06** | Testability | State-machine integration tests are mandatory and must pass |
| **NFR-07** | Maintainability | Clear separation: UI → API → validation → persistence |
| **NFR-08** | Performance | Reasonable response for a small internal dataset; no explicit SLA |

---

## 3. Agreed Assumptions

| ID | Assumption | Implementation Default |
|----|------------|------------------------|
| **A-01** | New tickets start in `Open` status | Set on create; not user-selectable |
| **A-02** | Acting user selected via UI picker (dropdown) | No auth; user chooses from seeded users |
| **A-03** | Priority is enum: `Low`, `Medium`, `High` | Validated on backend |
| **A-04** | `role` on User is informational only | No authorization checks in Core |
| **A-05** | `assignedTo` is optional at creation | Nullable foreign key |
| **A-06** | Keyword search covers title and description only | Case-insensitive partial match |
| **A-07** | Status filter includes `All` plus each status value | Combined with search |
| **A-08** | `Closed` and `Cancelled` are terminal | No reopen transitions |
| **A-09** | Comments allowed on any ticket status | Including terminal states |
| **A-10** | Field updates allowed on any ticket status | Including terminal states |
| **A-11** | Stack: Next.js App Router + Prisma + SQLite | Code in `src/` |
| **A-12** | Concurrent edits: last write wins | No optimistic locking in Core |
| **A-13** | At least 3 seeded users with varied roles | For assignee/reassign testing |
| **A-14** | No delete operations for tickets or comments | Out of scope |

---

## 4. Open Questions (Deferred — Using Defaults Above)

These were raised during analysis. Defaults in §3 apply unless the Product Owner overrides during implementation.

| # | Question | Default Applied |
|---|----------|-----------------|
| 1 | Default status on create? | `Open` |
| 2 | Are terminal states reopenable? | No |
| 3 | Who may change status? | Any user |
| 4 | Status change without assignee? | Allowed |
| 5 | Priority values? | Low / Medium / High |
| 6 | Assignee required at creation? | No |
| 7 | Required fields for creation? | title, description, priority |
| 8 | Max field lengths? | See §1.9 validation rules |
| 9 | Search scope? | title + description |
| 10 | Case-insensitive search? | Yes |
| 11 | Combined search + filter? | Yes |
| 12 | Default sort? | Newest first |
| 13 | Comments on closed tickets? | Yes |
| 14 | Edits on closed tickets? | Yes |
| 15 | Delete operations? | No |
| 16 | Seeded user count and roles? | ≥3 users; roles informational |
| 17 | Acting user without auth? | UI user picker |

---

## 5. Edge Cases

### State Machine

- Transition attempted from terminal state (`Closed`, `Cancelled`)
- Skip-ahead transitions (`Open` → `Resolved`, `Resolved` → `Closed` without `In Progress`)
- Double-submit / rapid duplicate status change requests
- Stale UI: transition attempted after status changed elsewhere

### Validation

- Empty or whitespace-only title, description, comment
- Invalid `priority` or `status` enum via direct API call
- `assignedTo` or `createdBy` referencing non-existent user ID
- XSS in text fields (render safely in UI)

### Search and Filter

- Empty keyword returns all (with active status filter)
- Keyword with no matches — show empty state
- Status filter with zero results — show empty state
- Special characters in search (`%`, `_`, quotes)
- Combined filter + search with no matches

### Data and Concurrency

- Empty database on first run — seed users required
- App restart — data must persist
- Concurrent updates to same ticket — last write wins

### UI Error States

- Network failure on create, update, comment, or status change
- Distinguish validation errors (400) from invalid transition errors (409)
- Loading, empty, and error states for list and detail views

### Comments

- Very long comment text (enforce max length)
- Comment submitted while ticket status changes in parallel

---

## 6. Traceability — Core Acceptance Criteria

| Assessment Acceptance Criterion | Requirement IDs |
|--------------------------------|-----------------|
| Create ticket via UI | FR-TC-01–05 |
| View all tickets from database | FR-TL-01 |
| Open ticket detail view | FR-TD-01 |
| Update fields and reassign | FR-TU-01–03 |
| Add comments | FR-CM-01–03 |
| Status changes only through valid transitions | FR-SM-02–04 |
| Keyword search and status filter work | FR-SF-01–04, FR-TL-02–04 |
| Data remains available after restart | NFR-01 |
| Backend validation prevents invalid records | FR-VE-01, NFR-03 |
| No secrets committed to repo | NFR-05 |
| State-machine integration tests pass | FR-TS-01–02, NFR-06 |

---

## Implementation Notes (Final)

The following Core assumptions were superseded during Stretch/Auth implementation:

| Original (Core) | Final Implementation |
|-----------------|------------------------|
| FR-TC-03: `createdBy` from acting-user picker | `createdBy` set server-side from JWT session |
| A-02: UI user picker, no auth | JWT login/signup with protected routes |
| Users seeded only, no CRUD UI | Admin user management at `/users` |
| 17 integration tests | 44 tests (integration + unit + auth) |

Core acceptance criteria remain satisfied; auth and stretch exceed original scope.
