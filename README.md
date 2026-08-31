# Game Accessories Platform

An e-commerce store for game accessories — peripherals organised as
categories → subcategories (by brand) → products — with a catalogue,
cart, checkout, order tracking and an admin dashboard.

This repository holds both halves of the platform:

| Directory   | What it is                                                  | Runs on                 |
| ----------- | ----------------------------------------------------------- | ----------------------- |
| `backend/`  | ASP.NET Core 8 Web API, PostgreSQL via EF Core               | `http://localhost:5125` |
| `frontend/` | React 18 storefront (Create React App, Tailwind + MUI)       | `http://localhost:3000` |

They are two independent applications that talk over HTTP only. There is no
shared build, no workspace tooling and no code shared between them — the
contract is the REST API and nothing else.

## Running it locally

Two terminals. Start the backend first; the frontend expects it to be up.

```bash
# terminal 1
cd backend
dotnet run          # http://localhost:5125, Swagger at /swagger

# terminal 2
cd frontend
npm install
npm start           # http://localhost:3000
```

One piece of first-run setup is **not** in the repo and a fresh clone will not
run without it: **`backend/appsettings.json`**, gitignored because it carries
the database connection string and the JWT signing key. Create it with a
`ConnectionStrings:Local` value in Npgsql format and a `Jwt` section (`Key`,
`Issuer`, `Audience`). `appsettings.Development.json` *is* committed but only
sets log levels.

Product image uploads go through Cloudinary. Add a `Cloudinary` section
(`CloudName`, `ApiKey`, `ApiSecret`) from your own Cloudinary account to the
same `appsettings.json` — everything else runs without it, and only
`POST /api/v1/Products/image` fails (with a clear error) until it's set. In
production these are the `Cloudinary__CloudName`, `Cloudinary__ApiKey` and
`Cloudinary__ApiSecret` environment variables on the Render service.

Restock and sale notifications send email through [Resend](https://resend.com).
Add a `Resend` section (`ApiKey`, `From`) to the same `appsettings.json`, or the
`Resend__ApiKey` and `Resend__From` environment variables on Render. **Without a
key nothing breaks**: a logging sender takes over and writes each message to the
console instead, so a fresh clone runs and the subscribe flow can be exercised
locally by copying the confirm link out of the log. `From` must be an address on
a domain verified with Resend, which is the usual first thing to get wrong.

Confirmation and unsubscribe links point at the storefront, not the API.
`Storefront:BaseUrl` (or `Storefront__BaseUrl`) sets that origin; it defaults to
the deployed store, so point it at `http://localhost:3000` when testing locally.

**`backend/Migrations/` is committed**, and the API applies any pending
migration on startup — so pointing a fresh, empty database at it and running
`dotnet run` is enough to build the schema. The same code path migrates the
deployed container when it boots, which is why a schema change and the code
that needs it must ship in the same deploy. To apply migrations without
starting the app, `cd backend && dotnet ef database update`.

By default the frontend points at the **deployed** API, not your local one.
`frontend/src/api.js` holds the single `API_BASE` constant; change it to
`http://localhost:5125/api/v1` to develop against the backend in terminal 1.

### Creating the first admin

The API deliberately cannot mint an admin — registration hardcodes the
`Customer` role, and the only promotion endpoint is itself admin-only. Register
a user through the app, then flip that row's role to `Admin` directly in
Postgres. After that, promotion works through the dashboard.

## Deployment

Both halves deploy to Render as **separate services** from this one repository,
so each service must set its **Root Directory** — `backend` or `frontend` —
otherwise Render builds from the repo root and fails.

- The backend builds from `backend/Dockerfile` and listens on 5125.
- The frontend is a static build; `frontend/public/_redirects` rewrites all
  paths to `index.html` so client-side routing survives a page refresh.
- The API's CORS allowlist is hardcoded in `backend/src/Program.cs` and
  currently admits `http://localhost:3000` plus the deployed store origin. A new
  frontend origin means editing that list.

## Working in this repo

Architecture and conventions for both halves live in the repository root's
[`CLAUDE.md`](CLAUDE.md) — the per-half `CLAUDE.md` files it used to point at
were deliberately removed, so that one file is the whole of it.

Read it before the per-directory `README.md` files, which predate a lot of
the current code. In particular `backend/README.md` documents lowercase API
routes; the real routes are PascalCase (`/api/v1/Products`, `/api/v1/Orders`).

There are no working tests in either half — the backend has no test project and
the frontend's `npm test` cannot load under CRA 5. Verify changes with
`dotnet build` and `npm run build`.
