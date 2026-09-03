# AGENTS.md — Deck

Local-first PostgreSQL IDE. React 19 + Vite 6 frontend, Express 5 + `pg` backend in one repo (no monorepo, no tests, no CI).

## Commands

- `npm install` — install
- `npm run dev` — API (`:3001`) + Vite (`:5173`) via `concurrently`; use for daily work
- `npm run dev:server` / `npm run dev:vite` — backend-only / frontend-only
- `npm start` — `vite build` then unified server on `:3001` (production shape)
- `npm run build` — `vite build` → `dist/`; `npm run preview` — preview build
- `npm run lint` — `eslint .` (only check; ignores `dist/`)
- No test / typecheck / format scripts. Verify with `npm run lint` + `npm run build`.

## Architecture

- Backend: `server/index.js` (ESM). In-memory `pg.Pool` — credentials never touch disk, status masks password as `***`. Serves `dist/` if present with SPA fallback for non-`/api` routes (`app.get(/^(?!\/api).*/)`).
- Frontend entry: `src/main.jsx` → `src/App.jsx`. Providers nest `I18n > Theme > Connection > BrowserRouter`. Routes: `/connect` public; `/` guarded by `RequireConnection`; `/sql /schema /health /logs /settings /history /info /api/*` unguarded.
- Path alias: `@` → `src/` (see `vite.config.js` + `jsconfig.json`). Import as `@/lib/api`, `@/context/...`.
- API client: `src/lib/api.js`. Base = `VITE_API_URL` or `http://localhost:3001`. Every request is logged to `sessionStorage` (`deck:api:logs`, max 100, event `deck:logs:update`). Offline fallback data lives in `src/lib/fakeData.js`.
- Persistence: `localStorage` for selected table/tabs, SQL tabs, schema layout, nav/theme; `sessionStorage` for request logs only. Sidebar table list is cached per-db (`deck:tables:<db>`, stale-while-revalidate) and only refetches on connect/db-switch, manual Refresh, or `deck:tables:invalidate` event (dispatched after successful DDL in Editor/Sql pages) — no mock fallback there.

## Backend quirks (read `server/index.js` before changing)

- `POST /api/query {sql, params}` splits statements quote/dollar-quote/comment-aware and runs them **sequentially on one client** (psql-like). Only the first statement receives `params`. Success returns `results[]` plus last-statement `rows/fields/command` for compat; errors return 400 with partial `results`, `failedAt`, `failedSql`.
- All table access is `public` schema only; kinds `r/v/m`. Identifiers validated with `/^[a-zA-Z_][a-zA-Z0-9_]*$/` — quoted as `public."name"`.
- `GET /api/tables/:name/rows` caps `limit` at 500 (default 100). `GET /api/tables` uses `pg_stat_user_tables` estimates, not exact counts.
- Undocumented Supabase-like CRUD at `/api/rest/:table` (`GET` with `select/limit/offset/order` + `eq./neq./gt./lt.` filters, `GET /:table/:id`, `POST`, `PATCH /:table/:id`, `DELETE`) is consumed by the `/api/*` docs + playground pages — keep it in sync with `src/pages/api/`.

## Frontend conventions

- Design tokens: `design.md` is the source of truth (warm-neutral dark default, `html.light` overrides in `src/index.css`). Tailwind `darkMode: ["class"]`, shadcn `new-york`, `cn()` in `src/lib/utils.js`.
- Dropdown is **custom** `src/components/ui/select.jsx`, not Radix: use `__none__` sentinel for "no selection", `value` always a string.
- Env: `PORT` (default 3001, backend only) and `VITE_API_URL` (frontend). No dotenv; no `.env` committed. Default UI credentials are prefill-only (`localhost:5432/mydb`).

## Gotchas

- Stale `dist/` changes prod behavior: server silently serves it if it exists. Rebuild (`npm run build`) after frontend changes when testing `npm start`; `.gitignore` only ignores `node_modules/`, so don't commit `dist/`.
- Needs a reachable Postgres 12+ for real data; otherwise UI falls back to mocks. There is no seed script or test DB.
- ESLint `settings.react.version` says 18.3 while app uses React 19 — don't "fix" rule behavior based on version-gated rules without checking.
