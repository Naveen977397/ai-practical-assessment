# debugging

## Prompt #1

### Prompt
Prisma 7 client fails to initialize with SQLite. Error about engine type "client" requiring adapter or accelerateUrl.

### AI Response Summary
Diagnosed Prisma 7 breaking change requiring explicit database adapter. Installed `@prisma/adapter-better-sqlite3`, created `lib/create-prisma.ts` factory with `PrismaBetterSqlite3` adapter, and configured `prisma.config.ts` for seed command.

### Accepted
- Adapter-based Prisma client factory
- `dotenv` for environment variable loading

### Modified
- Singleton pattern in `lib/prisma.ts` wrapping the factory

### Rejected
- Switching to Prisma Accelerate (unnecessary for local SQLite)

### Reason
Prisma 7 requires adapter for direct database connections.

---

## Prompt #2

### Prompt
better-sqlite3 NODE_MODULE_VERSION mismatch after Node version change. Integration tests fail to start.

### AI Response Summary
Identified native module ABI mismatch. Recommended `npm rebuild better-sqlite3` or clean `node_modules` reinstall.

### Accepted
- Rebuild native module for current Node version

### Modified
- Documented fix in `database/setup-notes.md` and `debugging-notes.md`

### Rejected
- Downgrading Node version (rebuild is simpler)

### Reason
Common issue when Node version changes with native dependencies.

---

## Prompt #3

### Prompt
Jest tests fail intermittently with unique constraint and "ticket not found" errors. All pass with `--runInBand`.

### AI Response Summary
Root cause: parallel Jest workers sharing single SQLite test database. Added `maxWorkers: 1` to `jest.config.js` for serial execution.

### Accepted
- `maxWorkers: 1` in Jest config

### Modified
- None reported

### Rejected
- Per-worker test database files (over-engineering for assessment scope)

### Reason
Discovered during assessment compliance verification when running tests without `--runInBand`.

---

## Prompt #4

### Prompt
Login returns 500 Internal Server Error. User cannot sign in.

### AI Response Summary
Diagnosed `better-sqlite3` native module error: `Module did not self-register`. The compiled binary did not match the running Node.js version. Fix: `npm rebuild better-sqlite3` and restart dev server. Added `postinstall: npm rebuild better-sqlite3` to `package.json` to reduce recurrence.

### Accepted
- Rebuild native module
- `postinstall` rebuild script
- Restart dev server after rebuild

### Modified
- Documented troubleshooting in `database/setup-notes.md`

### Rejected
- Switching away from better-sqlite3 (required by Prisma 7 SQLite adapter)

### Reason
Login API hits Prisma → SQLite; native module mismatch causes 500 on any DB operation.

---

## Prompt #5

### Prompt
`npm rebuild better-sqlite3` fails with `gyp ERR! not found: make`.

### AI Response Summary
Identified missing Linux build tools. System lacks `make` and C++ compiler needed to compile native addons. Recommended installing `build-essential` and `python3`, then `rm -rf node_modules && npm install`.

### Accepted
- Install `build-essential` on Linux before `npm install`
- Full node_modules reinstall after installing build tools

### Modified
- Added build-tools prerequisite to `database/setup-notes.md`

### Rejected
- Prebuilt binary workaround (unreliable across Node versions)

### Reason
`better-sqlite3` compiles from source when no matching prebuild exists; requires `make` and `g++`.

---

## Prompt #6

### Prompt
After loading /tickets, browser error: `users.map is not a function`. API calls return 401.

### AI Response Summary
Root cause: stale or missing auth session. `/api/users` returned `{ error: "..." }` on 401, but `TicketListPanel` called `setUsers(data)` without checking `response.ok` or `Array.isArray`. Fixed with defensive fetch (only set users when response is OK and data is array). Added `AuthProvider` redirect to login on session failure. Added 401 handling in ticket fetch to redirect to login.

### Accepted
- Defensive array check before `users.map`
- Client-side redirect on 401
- Same fix applied to `CreateTicketForm`

### Modified
- `TicketDetailPanel` already had `usersRes.ok` check; left unchanged

### Rejected
- Silently swallowing 401 (user should be redirected to login)

### Reason
User reported runtime crash; unauthenticated API responses were treated as user arrays.

---

## Prompt #9 (Featured Bug Hunt)

### Prompt
After starting the project, a blank white page appears at `/tickets` instead of login/signup. Terminal shows `users.map is not a function` and all API calls return 401. Fix the errors.

### AI Response Summary
Traced a multi-step failure chain: stale JWT cookie (valid signature, user deleted from DB after reseed) → middleware allows `/tickets` → APIs return 401 → `TicketListPanel` stores error object as users array → crash → `AuthProvider` returns null (blank page). Applied defensive fetch guards, server-side auth guard in layout, logout API for stale cookie cleanup, and removed middleware login redirect loop. First fix attempt (`cookieStore.delete()` in layout) failed with Next.js cookie restriction error; corrected in follow-up.

### Accepted
- Server-side `getSessionUser()` guard in `(app)/layout.tsx`
- Defensive `Array.isArray` check before `setUsers`
- Logout API for stale cookie clearing
- Page-level session checks on login/signup

### Modified
- Client redirect changed to `window.location.assign` for reliability
- Middleware no longer auto-redirects login→tickets on JWT alone

### Rejected
- Cookie deletion in Server Component layout (not permitted by Next.js)

### Reason
Real bug hunt with observable symptoms, wrong initial hypothesis, iterative fixes, and documented root cause chain. Captured in full in `debugging-notes.md` Featured Bug Hunt section.

---

## Prompt #7

### Prompt
App opens blank white page on /tickets instead of login/signup after starting the project.

### AI Response Summary
Diagnosed stale JWT cookie: middleware allowed `/tickets` (valid JWT signature) but `getSessionUser()` returned null (user not in DB after reseed). `AuthProvider` returned `null` during client redirect, causing blank page. Fixed with server-side auth guard in `(app)/layout.tsx` using `getSessionUser()` + `redirect("/login")`. Updated home page to redirect unauthenticated users to login. Login/signup pages do server-side session check before rendering.

### Accepted
- Server-side redirect in app layout (before client render)
- Home page auth-aware redirect
- Login/signup server session check

### Modified
- Initially attempted `cookieStore.delete()` in layout — caused Next.js error (see Prompt #8)

### Rejected
- Client-only redirect without server guard (blank page race condition)

### Reason
User saw white screen; server-side guard prevents protected pages rendering without valid session.

---

## Prompt #8

### Prompt
Error: `Cookies can only be modified in a Server Action or Route Handler` in `app/(app)/layout.tsx`.

### AI Response Summary
Next.js does not allow `cookies().delete()` in Server Component layouts. Removed cookie deletion from layout; redirect only. Cleared stale cookies via `POST /api/auth/logout` from `AuthProvider` on auth failure. Removed middleware auto-redirect from `/login` to `/tickets` on valid JWT (prevented redirect loop with stale tokens). Login/signup pages now check `getSessionUser()` server-side to redirect authenticated users.

### Accepted
- Redirect-only in layout (no cookie mutation)
- Logout API for cookie clearing
- Middleware login/signup redirect logic removed in favor of page-level session check

### Modified
- `AuthProvider` calls logout endpoint before redirecting on 401

### Rejected
- Cookie deletion in layout (not permitted by Next.js App Router)

### Reason
User reported 500 errors; Next.js restricts cookie writes to Route Handlers and Server Actions only.
