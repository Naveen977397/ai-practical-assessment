# Debugging Notes

Issues encountered during the Support Ticket Management System assessment, how they were investigated, and how they were resolved.

---

## Featured Bug Hunt: Blank `/tickets` Page and `users.map is not a function`

This is a real end-to-end bug hunt that surfaced after JWT authentication was added. It involved three related symptoms, two failed fixes, and one root cause chain.

### Symptom

After starting the dev server and opening `http://localhost:3000`, the browser showed a **blank white page** at `/tickets` instead of the login screen. The terminal logged:

```
GET /tickets 200
GET /api/auth/me 401
GET /api/users 401
GET /api/tickets 401
[browser] Uncaught TypeError: users.map is not a function
    at TicketListPanel (components/TicketListPanel.tsx:225:22)
```

### Initial Hypothesis (wrong)

The first guess was that middleware was not protecting routes. But `/tickets` returned **200**, which suggested the request was allowed through — so middleware was running, not missing.

### Investigation Steps

1. **Checked the network tab** — all three API calls returned `401 Unauthorized`. The page HTML loaded, but data fetches failed.
2. **Checked cookies** — an `auth_token` cookie was present from a previous session (before a database reseed). The JWT signature was still valid.
3. **Traced middleware** (`src/middleware.ts`) — `verifyAuthToken()` succeeded on the cookie, so middleware allowed `/tickets` through without redirecting to `/login`.
4. **Traced `getSessionUser()`** (`src/lib/auth/session.ts`) — verifies the JWT **and** looks up the user in the database. After reseed, the JWT's `sub` pointed to a user ID that no longer existed → returned `null` → APIs returned 401.
5. **Traced `TicketListPanel`** — the users fetch did:
   ```typescript
   fetch("/api/users")
     .then((res) => res.json())
     .then((data) => setUsers(data))  // sets { error: "..." } on 401
   ```
   Then `users.map(...)` crashed because `users` was an object, not an array.
6. **Traced `AuthProvider`** — on 401, it set `user` to `null` and returned `null` from render (blank page) while attempting `router.replace("/login")` client-side, which did not complete reliably before paint.

### How AI Helped

Cursor helped narrow the problem in stages:

| Stage | AI contribution |
|-------|-----------------|
| Crash diagnosis | Identified that `401` response body `{ error: "..." }` was being stored as the users array |
| Blank page | Explained the stale-JWT scenario: middleware checks signature only, not DB user existence |
| First fix attempt | Added server-side auth guard in `(app)/layout.tsx` with `redirect("/login")` |
| Second failure | Diagnosed Next.js error: `Cookies can only be modified in a Server Action or Route Handler` when layout tried `cookieStore.delete()` |
| Final fix | Removed cookie deletion from layout; cleared stale cookies via `POST /api/auth/logout`; moved login redirect logic from middleware to page-level `getSessionUser()` checks |

### Root Cause (full chain)

```
Stale JWT cookie (valid signature, deleted user in DB)
  → Middleware allows /tickets (JWT verifies)
  → getSessionUser() returns null (user not in DB)
  → APIs return 401
  → TicketListPanel stores error object as users array
  → users.map() throws TypeError
  → AuthProvider returns null (blank page)
  → Client redirect to /login unreliable
```

### Fixes Applied

1. **`TicketListPanel.tsx`** — only call `setUsers` when `response.ok` and `Array.isArray(data)`
2. **`(app)/layout.tsx`** — server-side `getSessionUser()` guard; `redirect("/login")` before rendering protected content
3. **`AuthProvider.tsx`** — call `POST /api/auth/logout` on session failure, then `window.location.assign("/login")`
4. **`middleware.ts`** — removed auto-redirect from `/login` → `/tickets` on valid JWT (prevented redirect loop with stale tokens)
5. **`login/page.tsx` / `signup/page.tsx`** — server-side session check; redirect to `/tickets` only when user actually exists in DB

### Verification

- [x] Fresh start with no cookie → redirects to `/login`
- [x] Stale cookie after DB reseed → redirects to `/login` (no blank page, no crash)
- [x] Valid login → `/tickets` loads with user list populated
- [x] No `Cookies can only be modified...` server error
- [x] `npm test` — 44/44 passing

### What I Learned

- **Middleware JWT verify ≠ full session validation.** Signature checks and database user lookups must align, or you get "authenticated in middleware, unauthenticated in API" gaps.
- **Never assume API responses are the expected shape.** Always check `response.ok` before using data in UI state.
- **Client-only redirects are not enough for auth guards.** Server-side redirect in the layout prevents rendering protected UI with invalid sessions.
- **Read framework constraints before fixing.** Next.js App Router does not allow cookie writes in Server Component layouts — use Route Handlers instead.

---

## Issue 1: Prisma 7 + SQLite Adapter Setup

### Problem

Prisma 7 requires an explicit database adapter for SQLite. Initial `prisma generate` and client instantiation failed with an error about engine type `"client"` requiring `adapter` or `accelerateUrl`.

### How I Investigated

- Read Prisma 7 migration guide and error messages
- Checked `src/lib/create-prisma.ts` and `src/lib/prisma.ts` for adapter configuration
- Verified `DATABASE_URL` in `.env` points to `file:./dev.db`

### How AI Helped

AI suggested the adapter pattern with `PrismaBetterSqlite3` and a singleton client factory. Provided `prisma.config.ts` for seed command configuration.

### What I Validated

- `npx prisma generate` succeeds
- `npx prisma migrate deploy` applies migration
- `npx prisma db seed` inserts 3 users
- API routes return data from SQLite

### Final Fix

- Installed `@prisma/adapter-better-sqlite3` and `dotenv`
- Created `lib/create-prisma.ts` with adapter factory
- Configured seed in `prisma.config.ts`

---

## Issue 2: better-sqlite3 Native Module Version Mismatch

### Problem

After a Node.js version change, `better-sqlite3` threw a `NODE_MODULE_VERSION` mismatch error (`Module did not self-register`). Tests and the dev server failed to start.

### How I Investigated

- Error message indicated the compiled binary was for a different Node ABI version
- Confirmed Node version with `node -v`
- Reproduced on both `npm test` and `npm run dev`

### How AI Helped

AI recommended `npm rebuild better-sqlite3` or a clean reinstall (`rm -rf node_modules && npm install`). Suggested adding a `postinstall` script to rebuild automatically.

### What I Validated

- Rebuild completed without errors
- `npm test` and `npm run dev` started successfully after rebuild and dev server restart

### Final Fix

```bash
cd src
npm rebuild better-sqlite3
# or: rm -rf node_modules && npm install
```

Added to `package.json`:

```json
"postinstall": "npm rebuild better-sqlite3"
```

---

## Issue 3: Missing Build Tools on Linux (`make` not found)

### Problem

`npm rebuild better-sqlite3` failed with `gyp ERR! not found: make`. The system lacked C++ build tools required to compile the native addon from source.

### How I Investigated

- Read the full `node-gyp` error output
- Confirmed `make` and `g++` were not installed on the machine

### How AI Helped

AI identified missing `build-essential` on Ubuntu/Debian and recommended installing it before reinstalling dependencies.

### What I Validated

- After `sudo apt-get install -y build-essential python3`, `npm install` completed successfully
- `better-sqlite3` compiled and loaded without errors

### Final Fix

```bash
sudo apt-get install -y build-essential python3
cd src
rm -rf node_modules
npm install
```

Documented in `database/setup-notes.md`.

---

## Issue 4: Jest Parallel Workers Causing Flaky Tests

### Problem

Running `npm test` without `--runInBand` caused intermittent failures: unique constraint violations on user email, "ticket not found" errors. Multiple Jest workers shared the same SQLite test database concurrently.

### How I Investigated

- Ran tests with `--runInBand` — all tests passed consistently
- Ran default parallel execution — several tests failed with DB contention errors
- Reviewed `tests/helpers/test-db.ts` reset logic

### How AI Helped

AI identified the root cause as parallel test workers sharing a single SQLite file without proper isolation.

### What I Validated

- `maxWorkers: 1` in `jest.config.js` — all tests pass without the `--runInBand` flag
- Tests remain integration-level (real DB, not mocked)

### Final Fix

Added `maxWorkers: 1` to `src/jest.config.js` for serial test execution.

---

## Issue 5: Login Returns 500 Internal Server Error

### Problem

Signing in at `/login` returned `500 Internal Server Error`. The API failed before reaching validation logic.

### How I Investigated

- Checked terminal/server logs for the stack trace
- Found `Module did not self-register` from `better-sqlite3`
- Confirmed the issue was the same native module mismatch as Issue 2, triggered on the first Prisma DB call during login

### How AI Helped

AI traced the 500 to the SQLite adapter native module, not auth logic. Recommended rebuild + dev server restart.

### What I Validated

- After `npm rebuild better-sqlite3` and restarting `npm run dev`, login succeeded with seeded credentials
- Invalid credentials correctly returned `400` (not 500)

### Final Fix

```bash
cd src
npm rebuild better-sqlite3
# restart dev server
npm run dev
```

---

## Issue 6: `users.map is not a function` on Ticket List

### Problem

After loading `/tickets`, the browser threw `TypeError: users.map is not a function` in `TicketListPanel.tsx`. API calls to `/api/auth/me`, `/api/users`, and `/api/tickets` all returned `401`.

### How I Investigated

- Checked browser console and network tab — all API calls returned 401
- Traced `TicketListPanel` users fetch: `setUsers(data)` ran on error response `{ error: "..." }` instead of an array
- Identified stale or missing auth session (cookie present but session invalid)

### How AI Helped

AI diagnosed the crash as unhandled 401 responses treated as user arrays. Recommended defensive checks and auth redirect.

### What I Validated

- `Array.isArray(data)` guard prevents the crash
- Redirect to `/login` when session is invalid
- Same fix applied to `CreateTicketForm`

### Final Fix

- Guard users fetch: only `setUsers` when `response.ok` and data is an array
- `AuthProvider` redirects unauthenticated users to login
- Ticket fetch redirects on `401`

---

## Issue 7: Blank White Page on `/tickets` Instead of Login

### Problem

Starting the app opened a blank white page at `/tickets` instead of redirecting to sign-in or sign-up.

### How I Investigated

- Checked network requests: page returned `200` but APIs returned `401`
- Identified stale JWT cookie: middleware allowed access (valid JWT signature) but `getSessionUser()` returned null (user not in DB after reseed)
- `AuthProvider` returned `null` during client-side redirect, rendering nothing

### How AI Helped

AI recommended server-side auth guard in `(app)/layout.tsx` so protected pages never render without a valid session.

### What I Validated

- Unauthenticated users are redirected to `/login` before page content renders
- Home page (`/`) redirects to `/login` when not authenticated

### Final Fix

- Server-side `getSessionUser()` check in `src/app/(app)/layout.tsx` with `redirect("/login")`
- Login and signup pages check session server-side and redirect to `/tickets` if already logged in

---

## Issue 8: Cookie Modification Error in App Layout

### Problem

Server error: `Cookies can only be modified in a Server Action or Route Handler`. Occurred in `app/(app)/layout.tsx` when attempting `cookieStore.delete(AUTH_COOKIE_NAME)` before redirect.

### How I Investigated

- Read Next.js docs on `cookies()` API restrictions
- Confirmed Server Component layouts can read cookies but cannot modify them

### How AI Helped

AI removed cookie deletion from the layout and moved stale-cookie cleanup to the logout Route Handler (`POST /api/auth/logout`). Also removed middleware auto-redirect from `/login` to `/tickets` on valid JWT to prevent redirect loops with stale tokens.

### What I Validated

- No more 500 errors on `/tickets`
- Stale sessions redirect to login cleanly
- `AuthProvider` calls logout API before redirecting on auth failure

### Final Fix

- Layout: redirect only, no cookie mutation
- Stale cookie clearing via `POST /api/auth/logout`
- Middleware no longer auto-redirects login→tickets on JWT alone; login/signup pages handle session check server-side

---

## Issue 9: Back Navigation Link Misalignment

### Problem

"← Back to tickets" link had misaligned arrow icon and text on the New Ticket and Detail pages.

### How I Investigated

- Visual inspection of both pages
- Identified Unicode arrow character causing baseline misalignment with link text

### How AI Helped

AI created a shared `BackToTicketsLink` component with an SVG chevron and `inline-flex items-center` alignment via `.app-back-link` CSS class.

### What I Validated

- Link renders with aligned icon and text on both pages
- No functionality change (still navigates to `/tickets`)

### Final Fix

- `src/components/BackToTicketsLink.tsx` with SVG icon
- `.app-back-link` class in `globals.css`

---

## Issue 10: Next.js Turbopack Root Warning

### Problem

Dev server logged a Turbopack panic / "Next.js package not found" after extended use, possibly related to `node_modules` corruption.

### How I Investigated

- Reviewed `next.config.ts` and project structure
- Noted Turbopack deprecation warning for `middleware` → `proxy` in Next.js 16

### How AI Helped

AI added `turbopack.root` to `next.config.ts` pointing to the `src/` directory to stabilize module resolution.

### What I Validated

- Dev server starts reliably after clean `npm install`
- Build succeeds with `npm run build`

### Final Fix

- Added `turbopack.root` in `src/next.config.ts`
- Clean reinstall when `node_modules` becomes corrupted
