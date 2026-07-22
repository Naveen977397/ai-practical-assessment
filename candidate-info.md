# Candidate Information

**Name:** Naveen  
**Role:** Software Engineer  
**Primary Technology Stack:** Next.js, TypeScript, Prisma, SQLite  

**Primary AI Tool Used:** Cursor  
**Project Option Selected:** Support Ticket Management System (Core)  

**Assessment Start Date:** 2026-07-21  
**Submission Date:** 2026-07-22

---

## Project Summary

A full-stack internal Support Ticket Management System built with Next.js App Router, Prisma 7, and SQLite. The application lets users sign up or sign in, create tickets, search and filter the ticket list, view and update ticket details, add comments, and progress tickets through an enforced status state machine. JWT authentication protects all routes; new users register with the **Requester** role by default. Admins can manage users via the `/users` page.

The signature engineering judgment piece is the status state machine: valid transitions succeed, invalid transitions are rejected by the backend (HTTP 409) and surfaced clearly in the UI. Mandatory integration tests prove these rules against real database persistence.

---

## Tools Used

| Tool | Purpose |
|------|---------|
| Cursor | Primary AI-assisted IDE for planning, implementation, debugging, and documentation |
| Next.js 16 (App Router) | Full-stack framework (UI + API routes) |
| Prisma 7 + SQLite | ORM and persistent storage |
| Zod | Request validation |
| Jest + ts-jest | Integration tests |
| TypeScript | Type safety across frontend and backend |

---

## Setup Summary

```bash
cd src
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
npm run dev    # http://localhost:3000
npm test       # integration tests
npm run build  # production build
```

See [`README.md`](README.md) and [`database/setup-notes.md`](database/setup-notes.md) for full setup details.
