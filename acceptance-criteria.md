# acceptance-criteria

Testable acceptance criteria for **Core** requirements. Each criterion uses Given / When / Then format and maps to requirement IDs in [`requirements-analysis.md`](requirements-analysis.md).

---

## AC-01: Create Ticket via UI

**Maps to:** FR-TC-01–05, FR-VE-01

**Given** the application is running and seeded users exist  
**When** the user selects an acting user, enters a valid title, description, and priority, and submits the create form  
**Then** a new ticket is persisted with status `Open`, the selected user as `createdBy`, and the ticket appears in the ticket list

**Given** the user submits the create form with a missing or whitespace-only title  
**When** the backend validates the request  
**Then** creation is rejected and the UI displays a meaningful validation error

**Given** the user submits the create form with an invalid priority value  
**When** the backend validates the request  
**Then** creation is rejected and the UI displays a meaningful validation error

---

## AC-02: View All Tickets from Database

**Maps to:** FR-TL-01, FR-TL-05, NFR-01

**Given** tickets exist in the database  
**When** the user opens the ticket list page  
**Then** all persisted tickets are displayed, sorted newest first by `createdAt`

**Given** tickets were created before an application restart  
**When** the user opens the ticket list after restart  
**Then** the same tickets are still visible

---

## AC-03: Open Ticket Detail View

**Maps to:** FR-TD-01, FR-TD-02

**Given** a ticket exists in the database  
**When** the user selects that ticket from the list  
**Then** the detail view shows title, description, priority, status, assignee, creator, timestamps, and all comments in chronological order

**Given** the user updates a ticket field and returns to the detail view  
**When** the page loads  
**Then** the detail view reflects the latest persisted values

---

## AC-04: Update Ticket Fields and Reassign

**Maps to:** FR-TU-01–03, FR-VE-01

**Given** a ticket exists with status `Open`  
**When** the user updates the title, description, priority, or assignee and saves  
**Then** the changes are persisted and `updatedAt` is refreshed

**Given** the user clears the title to whitespace only  
**When** the update is submitted  
**Then** the backend rejects the request and the UI displays a meaningful error

**Given** the user sets `assignedTo` to a non-existent user ID via API  
**When** the backend validates the request  
**Then** the update is rejected

**Given** a ticket is in status `Closed` or `Cancelled`  
**When** the user updates editable fields  
**Then** the update succeeds (field edits are not blocked by terminal status)

---

## AC-05: Add Comments

**Maps to:** FR-CM-01–05, FR-VE-01

**Given** a ticket exists  
**When** the user enters a valid comment message and submits  
**Then** the comment is persisted with `createdBy`, `createdAt`, and `ticketId`, and appears on the detail view

**Given** the user submits an empty or whitespace-only comment  
**When** the backend validates the request  
**Then** the comment is rejected and the UI displays a meaningful error

**Given** a ticket is in status `Closed` or `Cancelled`  
**When** the user adds a comment  
**Then** the comment is accepted and displayed

---

## AC-06: Status State Machine — Valid Transitions

**Maps to:** FR-SM-01–07, FR-TS-01

**Given** a ticket in status `Open`  
**When** the user transitions to `In Progress`  
**Then** the transition succeeds and status is updated in the database

**Given** a ticket in status `In Progress`  
**When** the user transitions to `Resolved`  
**Then** the transition succeeds

**Given** a ticket in status `Resolved`  
**When** the user transitions to `Closed`  
**Then** the transition succeeds

**Given** a ticket in status `Open`  
**When** the user transitions to `Cancelled`  
**Then** the transition succeeds

**Given** a ticket in status `In Progress`  
**When** the user transitions to `Cancelled`  
**Then** the transition succeeds

**Given** a ticket with no assignee  
**When** the user performs a valid status transition  
**Then** the transition succeeds

---

## AC-07: Status State Machine — Invalid Transitions Rejected

**Maps to:** FR-SM-02, FR-SM-04, FR-SM-05, FR-TS-01

**Given** a ticket in status `Open`  
**When** the user attempts to transition directly to `Resolved` or `Closed`  
**Then** the backend rejects the transition and the UI displays a meaningful error

**Given** a ticket in status `In Progress`  
**When** the user attempts to transition to `Open` or `Closed`  
**Then** the backend rejects the transition

**Given** a ticket in status `Resolved`  
**When** the user attempts to transition to `Open`, `In Progress`, or `Cancelled`  
**Then** the backend rejects the transition

**Given** a ticket in status `Closed` or `Cancelled`  
**When** the user attempts any status transition  
**Then** the backend rejects the transition

**Given** a ticket in status `Open`  
**When** the detail view is rendered  
**Then** only valid next-status actions (`In Progress`, `Cancelled`) are shown

---

## AC-08: Keyword Search and Status Filter

**Maps to:** FR-SF-01–04, FR-TL-02–04

**Given** tickets exist with varied titles and descriptions  
**When** the user enters a keyword matching a ticket title or description  
**Then** only matching tickets are displayed (case-insensitive, partial match)

**Given** tickets exist in multiple statuses  
**When** the user selects a specific status filter  
**Then** only tickets with that status are displayed

**Given** the user enters a keyword and selects a status filter  
**When** both are applied  
**Then** only tickets matching both criteria are displayed

**Given** the keyword field is empty  
**When** the user views the list  
**Then** all tickets are shown (subject to the active status filter)

**Given** a search or filter yields no matches  
**When** the list renders  
**Then** an appropriate empty state is shown

---

## AC-09: Backend Validation

**Maps to:** FR-VE-01–03, NFR-03

**Given** any write operation (create ticket, update ticket, add comment, change status)  
**When** invalid input is submitted  
**Then** the backend rejects the request without corrupting existing data

**Given** a direct API call with an invalid enum value for priority or status  
**When** the backend validates the request  
**Then** the request is rejected with an appropriate error response

---

## AC-10: Data Persistence After Restart

**Maps to:** NFR-01, NFR-02

**Given** tickets, comments, and seeded users exist in the database  
**When** the application is stopped and restarted  
**Then** all data remains available and referentially intact

---

## AC-11: No Secrets in Repository

**Maps to:** NFR-05

**Given** the project repository  
**When** reviewed for committed secrets  
**Then** no API keys, passwords, or database credentials are present in tracked files (`.env` is gitignored)

---

## AC-12: State-Machine Integration Tests

**Maps to:** FR-TS-01–02, NFR-06

**Given** the integration test suite is executed  
**When** state-machine tests run against the real persistence layer  
**Then** all valid transitions pass and representative invalid transitions are rejected by the backend

**Given** the test command completes  
**When** results are reviewed  
**Then** all mandatory state-machine integration tests pass

---

## Summary Checklist (Assessment Core Criteria)

| # | Criterion | AC ID |
|---|-----------|-------|
| 1 | Create ticket via UI | AC-01 |
| 2 | View all tickets from database | AC-02 |
| 3 | Open ticket detail view | AC-03 |
| 4 | Update fields and reassign | AC-04 |
| 5 | Add comments | AC-05 |
| 6 | Valid transitions only; invalid rejected | AC-06, AC-07 |
| 7 | Keyword search and status filter | AC-08 |
| 8 | Data survives restart | AC-10 |
| 9 | Backend validation | AC-09 |
| 10 | No secrets in repo | AC-11 |
| 11 | State-machine integration tests pass | AC-12 |
