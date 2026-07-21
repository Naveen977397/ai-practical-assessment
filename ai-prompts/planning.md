# planning

## Prompt #1

### Prompt
Set up the repository structure exactly as specified in the assessment document for a Support Ticket Management System. Create ONLY the project structure and placeholder files — no business logic, UI, APIs, or configuration. The structure must match the assessment spec exactly, with markdown files containing only a single H1 heading matching the filename. Do not initialize Next.js or add extra folders. After creating the structure, explain the purpose of every major folder and how it maps to the assessment requirements.

### AI Response Summary
Created the full `ai-practical-assessment/` directory tree: all root-level planning/design markdown files, empty `src/` and `tests/` directories, `database/` with `schema-or-migrations/`, `seed-data/`, and `setup-notes.md`, quality/delivery artifact files, `ai-prompts/` with seven phase-specific prompt logs, and `tool-specific/cursor-workflow/` with five Cursor workflow files. Each markdown file was initialized with a single H1 heading matching its filename. Provided a structured overview mapping every major folder and file group to assessment phases (planning, implementation, testing, AI usage documentation, and Cursor-specific workflow).

### Accepted
- Complete repository structure as specified in the assessment document
- Placeholder markdown files with H1-only headings
- Empty `src/`, `tests/`, `database/schema-or-migrations/`, and `database/seed-data/` directories
- No application code, framework initialization, or extra documentation folders
- Folder-purpose explanation mapping structure to assessment requirements

### Modified
- None reported

### Rejected
- None reported

### Reason
The user advanced to the next project instruction (prompt history maintenance) without requesting changes to the repository structure, indicating implicit acceptance of the setup as delivered.

## Prompt #2

### Prompt
Start the planning phase for the Support Ticket Management System. As a senior business analyst, analyze Core requirements only (no Stretch) and identify functional requirements, non-functional requirements, assumptions, Product Owner questions, and edge cases. Provided the full assessment document (entities, features, state machine, acceptance criteria). After agreement, convert the analysis into `requirements-analysis.md`.

### AI Response Summary
Produced a structured Core requirements analysis covering 11 functional requirement groups (data model, ticket CRUD, state machine, comments, search/filter, validation, testing), 8 non-functional requirements, 12 assumptions, 17 PO questions, and edge cases across six categories. Mapped all items to assessment acceptance criteria. User approved the plan and requested implementation.

Formalized deliverables:
- [`requirements-analysis.md`](../requirements-analysis.md) — full analysis with stable FR-*, NFR-*, and A-* IDs, agreed defaults, validation rules, edge cases, and traceability matrix
- [`acceptance-criteria.md`](../acceptance-criteria.md) — 12 testable AC entries in Given/When/Then format with requirement mapping
- [`tool-specific/cursor-workflow/spec.md`](../tool-specific/cursor-workflow/spec.md) — condensed Cursor context spec with entities, state machine, features, and scope boundaries

### Accepted
- Core-only scope (Stretch excluded)
- Full BA analysis structure (functional, non-functional, assumptions, PO questions, edge cases)
- State machine as signature requirement with backend enforcement and frontend error handling
- Conversion to `requirements-analysis.md`, `acceptance-criteria.md`, and `spec.md`
- Agreed defaults for unresolved PO questions (Open default status, Low/Medium/High priority, optional assignee, title+description search, UI user picker, terminal states)

### Modified
- None reported

### Rejected
- None reported

### Reason
User instructed "Implement the plan as specified" without corrections to the analysis content, indicating acceptance of the BA analysis and agreed implementation defaults.

## Prompt #3

### Prompt
Before implementing the coding part, create a plan for development. User then said "proceed" to execute the full implementation plan.

### AI Response Summary
Executed the full Core implementation plan across 7 phases: wrote design docs (`data-model.md`, `api-contract.md`, `ui-flow.md`, `design-notes.md`, `implementation-plan.md`); implemented Prisma schema with SQLite adapter (Prisma 7), migrations, seed data, domain layer (state machine, Zod validation, ticket service), 7 API endpoints, full UI (ticket list with search/filter, create form, detail with edit/status/comments, acting user picker), and 13 state-machine integration tests. Updated README, setup notes, test results, and cursor tasks.

### Accepted
- Phased plan: Design → DB → Domain → API → Tests → UI → Verify
- Next.js App Router + Prisma 7 + SQLite with driver adapter
- Separate status endpoint and enforced state machine
- Integration tests against real persistence

### Modified
- Seed script uses `seed.mjs` (plain Node) instead of TypeScript/tsx due to environment constraints
- Prisma 7 requires `@prisma/adapter-better-sqlite3` — added to dependencies

### Rejected
- None reported

### Reason
User approved plan with "proceed" and did not request changes to architecture or scope during implementation.
