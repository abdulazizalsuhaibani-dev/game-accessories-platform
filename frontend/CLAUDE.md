# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Create React App storefront (React 18, react-router 6) for a game-accessories shop, styled with Tailwind + MUI in a custom "Arcade" design system, bilingual EN/AR with RTL and multi-currency. It is the frontend half of the platform; the ASP.NET Core API lives in `../backend` in this same repository. See the repo-root `CLAUDE.md` for the seams between the two halves.

All commands below assume you are in this `frontend/` directory, not the repo root.

## Commands

```bash
npm install
npm start        # dev server on :3000 — the API's CORS allowlist expects exactly this origin
npm run build    # production bundle into build/
```

`npm test` is **currently broken**: jest (CRA 5, no `transformIgnorePatterns` override) cannot parse axios v1's ESM build, so the suite fails to load before running. The only test file is the untouched CRA smoke test asserting a "learn react" link that no longer exists. Treat the repo as having no test coverage; don't cite `npm test` as verification.

Tailwind has no `postcss.config.js` — react-scripts 5 picks up `tailwind.config.js` automatically. Don't add a PostCSS config to "fix" it.

## API integration

`src/api.js` is the single source of the backend origin:

```js
export const API_BASE = "https://game-accessories-api.onrender.com/api/v1";
export function authHeaders() { /* Bearer token from localStorage */ }
```

- **Every** component imports `API_BASE`; never write a URL inline. Point at a local backend by editing this one constant (the API defaults to `http://localhost:5125`, so `http://localhost:5125/api/v1`).
- API routes are **PascalCase** — `/Products`, `/Users`, `/Orders`, `/Carts`, `/Payments`, `/Reviews`. The API README's lowercase paths are stale.
- Authenticated calls pass `{ headers: authHeaders() }`. The JWT lives in `localStorage.token`; `App.js` exchanges it for the current user via `GET /Users/auth` on mount, and `userData === null` is what "signed out" means.
- `GET /Products` responds `{ products, productsCount }` — and `productsCount` is the **total** row count, unaffected by search/filter args, so it can't drive filtered pagination.

### Checkout is a three-call chain

`components/checkout/Checkout.js` posts `/Carts` → `/Payments` (using the returned cart id and total) → `/Orders` (using the returned payment id). Each leg depends on the previous response; a `failureMessage` variable is reassigned between legs so the error snackbar names the step that failed. Note the API caps `Order.Address` at 100 characters and rejects longer values with a 400 — the delivery label and courier notes are appended to the address line here because the order model has no field for them.

## Architecture

- **`src/App.js`** owns nearly all cross-page state — cart, wishlist, their counts, `userData`, and the snackbar triple (`snackBarMessage`, `openSuccessSnackBar`, `openErrorSnackBar`) — and threads it down through props. Cart and wishlist are mirrored into `localStorage` under `cart` / `wishList`. There is no Redux and no data-fetching library; components fetch with `axios` inside `useEffect` and set local state.
- **`src/pages/`** are thin route components; **`src/components/<feature>/`** holds the real UI. `components/shared/Layout.js` is the router's layout route (header, `<Outlet />`, footer, both snackbars); `/login` and `/signUp` sit outside it.
- **`components/shared/ProtectedRoute.js`** guards routes, waiting on `isUserDataLoading` before deciding so a page load doesn't bounce a signed-in user to `/login`. `shouldCheckAdmin` additionally requires `userData.role === "Admin"`.
- **Admin area**: `/dashboard` plus `/dashboard/:tableName`, where `EntityPage` maps the param through a `TABLES` registry to `ProductsTable` / `UsersTable` / `OrdersTable` (MUI `DataGrid` with inline row editing). `useAdminCounts` fetches products, users and orders independently so one failing endpoint leaves that count `null` instead of blanking the shell.
- **`public/_redirects`** rewrites everything to `index.html` for client-side routing on Render.

## i18n, currency and RTL

`src/context/StoreSettings.js` (`useStoreSettings`) is the only source of locale/currency and exposes `t`, `price`, `num`, `locale`, `isRTL`, `setLocale`, `setCurrency`. Both settings persist in `localStorage`.

- **`t(key, vars)`** looks up `src/i18n/strings.js` — a flat, dotted-key table with `en` and `ar` objects that must stay in sync. `{placeholder}` interpolation localizes numeric values automatically. Never hardcode display copy.
- **`price(usdAmount)`** — catalogue prices come off the API in USD; `src/i18n/currencies.js` converts and formats. Symbol leads for Latin currencies and trails for Arabic-script/Gulf ones. **`num(value)`** converts digits to Eastern Arabic numerals under `ar`.
- Direction is set on `<html>` (`dir`/`lang`) by the provider, and `App.js` rebuilds the MUI theme with `direction` on locale change so portals (dialogs, popovers, snackbars) mirror too. In Tailwind markup use logical properties — `ms-*`/`me-*`, `border-s`/`border-e`, `text-start` — not `ml-*`/`pr-*`, and mark Latin islands inside Arabic pages with `dir="ltr"`.

## Styling: the "Arcade" design system

Dark, square-cornered, acid-on-void with hard magenta offset shadows. Three sources must agree when you change a token:

1. **`tailwind.config.js`** — semantic color names (`void`, `chassis`, `panel`, `well`, `line`, `seam`, `edge`, `muted`, `dim`, `ink`, `acid`, `magenta`, `amber`), the display/sans/mono font stacks and their `-ar` counterparts, `tracking-telemetry`, `shadow-offset`, `bg-scanlines`.
2. **`src/index.css`** — the component classes the markup actually reuses: `.telemetry` (uppercase mono label used for every eyebrow, nav item, button and table header), `.btn-acid` / `.btn-ghost` / `.btn-flat`, `.field` / `.field-label`, `.panel`, `.chip` / `.chip-active`, `.box-check`, `.status-pill`, plus the Arabic type-stack overrides.
3. **`src/theme/arcadeTheme.js`** — mirrors the same palette into MUI so DataGrids, dialogs and snackbars match the hand-built markup.

Use the semantic Tailwind tokens and these component classes rather than raw hex values or ad-hoc utility stacks; `borderRadius` is 0 everywhere by design.
