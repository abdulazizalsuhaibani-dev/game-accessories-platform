# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A monorepo holding both halves of a game-accessories e-commerce platform:

- **`backend/`** — ASP.NET Core 8 Web API over PostgreSQL (EF Core), port 5125.
- **`frontend/`** — React 18 storefront (Create React App, Tailwind + MUI),
  port 3000, bilingual EN/AR with RTL and multi-currency.

They are two independent applications sharing a repository and nothing else —
no workspace tooling, no root `package.json`, no shared code, no unified build.
The only contract between them is the REST API. Treat a change to one half as
affecting the other **only** where it crosses that HTTP boundary.

## Start here

**Each half has its own CLAUDE.md, and those are the authoritative documents.**
This file is orientation only — do not duplicate their content here.

- [`backend/CLAUDE.md`](backend/CLAUDE.md) — the four-layer
  controller → service → repository → DbContext flow, hand-written DI
  registration in `Program.cs`, `CustomException` error handling, JWT auth and
  ownership checks, and a long list of load-bearing gotchas.
- [`frontend/CLAUDE.md`](frontend/CLAUDE.md) — `App.js` as the owner of nearly
  all cross-page state, the three-call checkout chain, the `useStoreSettings`
  i18n/currency/RTL provider, and the "Arcade" design system's three
  must-agree token sources.

Read the one for the half you are touching before making changes.

## Commands

Always run these from inside the relevant subdirectory, never the repo root.

```bash
cd backend  && dotnet build      # 0 errors; ~78 pre-existing nullable warnings are the baseline
cd backend  && dotnet run        # http://localhost:5125, Swagger at /swagger
cd frontend && npm install
cd frontend && npm start         # http://localhost:3000
cd frontend && npm run build
```

## Verification

**There are no usable tests in this repository.** The backend has no test
project. The frontend's `npm test` is broken — CRA 5's jest cannot parse axios
v1's ESM build, so the suite fails to load, and the only test file is the stock
CRA smoke test asserting a link that no longer exists. Never cite `npm test` as
evidence that anything works.

Verify with `dotnet build` and `npm run build`, and by exercising the affected
screen or endpoint by hand.

## Cross-cutting concerns

These are the seams where the two halves are coupled. Changing one side without
the other breaks the app:

- **The API origin** lives in exactly one place on the frontend:
  `API_BASE` in `frontend/src/api.js`. Every component imports it; never write a
  URL inline. It points at the deployed Render API by default, so pointing at a
  local backend means editing that one constant.
- **Routes are PascalCase** — `/api/v1/Products`, `/api/v1/Users`,
  `/api/v1/Orders`, `/api/v1/Reviews`. Both READMEs document lowercase paths and
  both are stale. Read the controller.
- **CORS is an allowlist** hardcoded in `backend/src/Program.cs`. A new frontend
  origin requires editing it there.
- **`Order.Address` is capped at 100 characters** on the entity and the DTO, and
  `[ApiController]` rejects longer values with a 400 before the service runs.
  The frontend composes its address line from several fields plus courier notes,
  so this limit is easy to trip from checkout.
- **`GET /api/v1/Products` returns `{ products, productsCount }`** where
  `productsCount` is the table's total row count and ignores search/filter
  arguments. It cannot drive filtered pagination on either side.

## Local setup and deployment

See [`README.md`](README.md) for the gitignored files a fresh clone must
recreate (`backend/appsettings.json`, `backend/Migrations/`), how to bootstrap
the first admin in Postgres, and the Render **Root Directory** setting each of
the two services needs now that both live in one repository.
