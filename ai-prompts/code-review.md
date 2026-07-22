# code-review

## Prompt #1

### Prompt
Perform a self-review of the completed Core implementation. Check state machine enforcement, validation, security basics, and test coverage. Document findings in code-review-notes.md and review-fixes.md.

### AI Response Summary
Reviewed state machine isolation, endpoint separation, Zod validation, error mapping, and test coverage. Identified strengths (pure state machine, 409 on invalid transitions, no secrets) and known limitations (no auth, no optimistic locking). Documented rejected suggestions (auth, delete, mocked tests). Listed fixes applied: Jest config, UI polish, back link, reopen, documentation completion.

### Accepted
- Self-review findings documented
- Review-fixes tracking changes made post-review

### Modified
- Added reopen transition documentation to acceptance criteria

### Rejected
- Adding auth middleware as "security fix" (Stretch scope at time of review)
- Adding optimistic locking (unnecessary for Core)

### Reason
Assessment requires code review notes and evidence of responsible judgment about AI suggestions.

---

## Prompt #2

### Prompt
Review stretch feature implementation: paginated list API, user CRUD, OpenAPI, Docker, and CI. Check for scope creep and breaking changes to Core behavior.

### AI Response Summary
Reviewed list API pagination (breaking change from flat array — UI updated), filter/sort query params, user service CRUD with duplicate-email handling, OpenAPI YAML accuracy against routes, Dockerfile multi-stage build, and GitHub Actions workflow (install → migrate → test → build). Confirmed Core state machine and comment behavior unchanged. Noted list response shape change as intentional stretch enhancement.

### Accepted
- Paginated list API with documented response shape
- Admin-only user mutations
- CI runs tests with `maxWorkers: 1` equivalent via Jest config

### Modified
- OpenAPI spec updated to include stretch endpoints

### Rejected
- Reverting pagination to flat array (stretch requirement)
- Adding delete protection for users with assigned tickets (not specified)

### Reason
Stretch features added after Core review; separate review pass to ensure Core integrity preserved.

---

## Prompt #3

### Prompt
Review JWT authentication implementation. Check for security issues: cookie settings, secret handling, middleware coverage, role enforcement, and removal of client-controlled `createdById`.

### AI Response Summary
Reviewed auth module: httpOnly + sameSite=lax cookies, secure flag in production, JWT_SECRET min 32 chars in `.env.example`, middleware protects all non-public paths, `requireRole("Admin")` on user mutation routes, ticket/comment creation uses `requireAuth()` server-side. Confirmed acting-user picker fully removed. Identified that Web Crypto JWT is simpler but lacks industry-standard claims validation libraries — acceptable for assessment. Password hashing documented.

### Accepted
- Server-side `createdById` from JWT (no client spoofing)
- Admin role gating on `/users`
- Public paths whitelist in middleware

### Modified
- Added auth integration tests for login and signup flows

### Rejected
- Storing JWT in localStorage (httpOnly cookie is more secure)
- Allowing client to set role on signup (hardcoded Requester)

### Reason
User requested JWT auth; security review before considering auth feature complete.

---

## Prompt #4

### Prompt
Review signup flow and auth redirect fixes. Check for redirect loops, blank pages, and error handling on stale sessions.

### AI Response Summary
Reviewed signup validation (password match, min length, duplicate email), auto-login cookie on 201 response, middleware public paths, server-side layout guard, and login/signup session checks. Identified and fixed: cookie deletion in layout (Next.js restriction), middleware login→tickets loop with stale JWT, `users.map` crash on 401. Confirmed `AuthProvider` clears session via logout API before redirect.

### Accepted
- Server-side auth guard in `(app)/layout.tsx`
- Defensive API response handling in list/create forms
- Logout API for stale cookie cleanup

### Modified
- Removed cookie mutation from layout
- Removed middleware auto-redirect on login for valid JWT

### Rejected
- Keeping client-only auth redirect without server guard (caused blank page)

### Reason
User reported blank page and cookie errors; post-implementation review of auth UX edge cases.

---

## Prompt #5

### Prompt
Final submission review: verify all acceptance criteria, documentation completeness, test counts, and candidate info. Identify any remaining gaps.

### AI Response Summary
Audited AC-01 through AC-12 (all marked Done). Identified gaps: `candidate-info.md` placeholders, `test-results.md` outdated (17 vs 44 tests), README auth section missing signup. Confirmed 44/44 tests pass and production build succeeds. Recommended final manual smoke test and `npm run lint`.

### Accepted
- All Core AC complete
- Stretch features implemented
- Submission docs need candidate details and test count updates

### Modified
- Updated candidate-info, test-results, and README per user request

### Rejected
- Adding features beyond user requests for submission (scope complete)

### Reason
User asked if project is complete; final compliance audit before submission.

---

## Prompt #6 (Featured AI-Assisted Code Review)

### Prompt
Review JWT authentication implementation. Check for security issues: cookie settings, secret handling, middleware coverage, role enforcement, and removal of client-controlled `createdById`. Document findings with severity and accept/reject recommendations.

### AI Response Summary
Reviewed 10 security areas across auth module, middleware, API routes, and services. Confirmed httpOnly cookies, server-side `createdById`, admin role gating, and signup role hardcoding. Identified stale-JWT gap (middleware verifies signature but not DB user existence) as High severity — linked to blank-page bug hunt. Recommended auth integration tests. Rejected localStorage JWT, signup role selection, refresh tokens, and bcrypt dependency. Full review captured in `code-review-notes.md` Featured AI-Assisted Code Review section.

### Accepted
- Security checklist findings documented with severity table
- Auth integration tests added
- Stale-session fix cross-referenced with bug hunt

### Modified
- Review outcome tied to manual smoke testing (AI missed runtime stale-JWT until symptom reported)

### Rejected
- JWT in localStorage, refresh tokens, bcrypt dependency, rate limiting (documented reasons)

### Reason
Assessment requires at least one real AI-assisted code review with accepted/rejected suggestions and evidence of human judgment.
