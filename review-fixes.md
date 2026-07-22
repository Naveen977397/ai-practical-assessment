# Review Fixes

Changes made after AI-assisted code review and assessment compliance check.

---

## Fix 1: Jest Test Reliability

**Issue:** Parallel Jest workers caused flaky integration test failures against shared SQLite test DB.  
**Fix:** Added `maxWorkers: 1` to `src/jest.config.js`.  
**Verified:** 17/17 tests pass consistently with `npm test`.

---

## Fix 2: UI Readability and Contrast

**Issue:** Original UI had poor text visibility and inconsistent styling.  
**Fix:** Introduced shared CSS component classes (`.app-card`, `.app-input`, `.app-btn-primary`, etc.) and applied across all components.  
**Verified:** Manual visual review; professional light theme with readable contrast.

---

## Fix 3: Back Navigation Alignment

**Issue:** "Back to tickets" arrow and text were misaligned.  
**Fix:** Created `BackToTicketsLink` component with SVG icon and flex alignment.  
**Verified:** Visual check on New Ticket and Detail pages.

---

## Fix 4: Closed Ticket Reopen

**Issue:** Mistakenly closed tickets had no recovery path.  
**Fix:** Added `CLOSED → OPEN` transition in state machine; "Reopen" button in UI; updated tests and docs.  
**Verified:** Integration test for `Closed → Open` passes; UI shows Reopen button on closed tickets.

---

## Fix 5: Documentation Completeness

**Issue:** Many assessment submission files were placeholder stubs.  
**Fix:** Filled in all required artifacts: candidate-info, tool-workflow, test-strategy, test-results, pr-description, reflection, final-ai-usage-summary, debugging-notes, code-review-notes, and prompt history entries.  
**Verified:** All files in assessment repository structure now contain substantive content.

---

## Fix 6: Implementation Plan Status

**Issue:** `implementation-plan.md` showed phases as "Pending" despite completion.  
**Fix:** Updated all phases to "Done" with milestone summary.  
**Verified:** Plan reflects actual project state.

---

## Fix 8: Auth Session — Blank Page and `users.map` Crash

**Issue:** Stale JWT cookie after DB reseed caused `/tickets` to render a blank page and `users.map is not a function` crash.  
**Fix:** Server-side auth guard in `(app)/layout.tsx`; defensive API response checks in `TicketListPanel`; logout API for stale cookie cleanup; removed middleware login→tickets auto-redirect on JWT alone.  
**Verified:** Unauthenticated users redirect to `/login`; no blank page; no runtime crash. See featured bug hunt in `debugging-notes.md`.

---

## Fix 9: Cookie Modification in Layout

**Issue:** `cookieStore.delete()` in Server Component layout caused Next.js error.  
**Fix:** Redirect only in layout; clear cookies via `POST /api/auth/logout` from `AuthProvider`.  
**Verified:** No 500 errors; stale sessions cleared on auth failure.

---

## Fix 10: JWT Auth Security (Post-Review)

**Issue:** Code review identified stale-session gap and missing auth tests.  
**Fix:** Added `tests/integration/auth.test.ts`; server-side session checks on login/signup pages; documented security decisions.  
**Verified:** 44/44 tests pass; auth review findings addressed. See featured review in `code-review-notes.md`.
