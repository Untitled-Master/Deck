<div align="center">
  <img src="./public/deck-logo.svg" alt="Deck Logo" width="80" height="80" onerror="this.style.display='none'" />
  <h1>Deck</h1>
  <p><b>Your database, on deck.</b> — Dense, monochrome PostgreSQL IDE. Supabase Table Editor × Vercel dashboard density. Local-first.</p>

  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
  [![React 19](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev/)
  [![Vite 6](https://img.shields.io/badge/Vite-6-646CFF.svg)](https://vitejs.dev/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-336791.svg)](https://www.postgresql.org/)
  [![Node pg 8.23](https://img.shields.io/badge/pg-8.23-336791.svg)](https://node-postgres.com/)
  [![Repo](https://img.shields.io/badge/repo-Untitled--Master%2FDeck-24221F.svg)](https://github.com/Untitled-Master/Deck)
</div>

---

## About

**Deck** is a local PostgreSQL control app — see tables, browse data, edit inline, and run SQL. It feels like **Supabase Database + Vercel dashboard + VS Code** had a child: **flat charcoal surfaces (#292824 / #1D1C1A), thin #3B3A36 borders, 13px Inter, dense spacing, no gradients/shadows**.

Launched locally via `npx deck` (or `npm run dev` / `npm start`), it connects with `pg` on a unified Express server (`server/index.js`) that serves both API and the built Vite frontend on one port.

**Live demo (local):** `http://localhost:5173` (Vite) + `http://localhost:3001/api/*` (API) — or single port `http://localhost:3001` in production (`npm start`).

---

## Screenshots

> Dark, dense, spreadsheet-like data grid — `favorites` / `users` with `_id`, `addedAt`, `mediaType`, `posterPath`, `title`, `tmdbId`, `userId`, `Filter & Sort` (bold) + eye column picker, `Add` / `Delete N` with dialog, double-click edit.

> Schema canvas — dot grid (`radial #4A4944/#3B3A36`), draggable tables (`watchHistory`, `watchlists`, `favorites` → `users`), Manhattan right-angle lines field-to-field (`userId → _id`), zoom/pan/wheel, `Automatic grouping` toggle.

---

## Features

- **Connection** — form `host=localhost` `port=5432` `database=mydb` `user=postgres` `password=280823` (defaults pre-filled), `POST /api/connect` tests `SELECT 1`, stores `pg.Pool`, shows `Healthy • PostgreSQL` pill (`#22C55E` on `#0f2a14`) and DB name in `TopBar` (`PostgreSQL` SVG, no white bg, `w-8`), health page (`/health`) with connection card, latency, pool, metrics.
- **Data Grid** — `DataGrid.jsx` — fixed `h-[520px]` (`#2A2825`) full, not row-dependent, `40px` header/row, `40px` checkbox (`16px` `#5A5852`), header `13px 600 #B7B5B0`, cells `13px mono bold #F0EFEC` (`unset` italic `#66645F`), hover `bg #232220`, horizontal `8px` scrollbar `track #1D1C1A` `thumb #5A5852`, toolbar `52px` with Lucide `ArrowLeft/Right`, `SlidersHorizontal Filter & Sort` **bold**, `EyeOff` column picker (search, toggles `bg #4A90E2`, `Hide/Show All`), `+ Add` (`bg #F0EFEC` `#1D1C1A`) opens form, selection (`Check` `#4A90E2`), `Delete N` (`bg #450a0a` `#7f1d1d`) + dialog with `SELECTED IDS` chips.
- **Inline Edit** — double-click any cell (except SQL results) → `h-7` `bg #1D1C1A` `border #4A90E2` input + `Check`/`X`, `UPDATE "table" SET "col"=$1 WHERE "pk"=$2` via `pg` (live) or local `setRows` (mock), `Escape` cancels.
- **Add Row** — `+ Add` in page header (`h-10` `bg #292824` `border #4A4944` `rounded 7`) and toolbar, dialog `max-w 520` `bg #292824` `border #3B3A36` `rounded 9`, fields for `orderedColumns` (`_id` auto `j...`), `INSERT INTO "table" (...) VALUES (...)` with `null` for empty, mock prepends to `rows`.
- **SQL Editor** — `Monaco` `vs-dark` `13px` → `14px` `ui-monospace`, `320px`, `bg #1D1C1A` `border #3B3A36` `rounded 8`, header `h-38px` tabs (`Query 1` active `bg #292824` `border #4A90E2`), `PostgreSQL` badge, `Run` (`bg #F0EFEC`), sequential multi-statement via single `client` (`splitStatements` respects `'`, `"`, `''`, `""`, `$tag$`, `--`, `/* */`), returns `results[]` (`command/rowCount/rows/fields/duration`) + `totalDuration`. UI shows per-statement `INSERT 0 1` / `SELECT • rows • ms` + `DataGrid` for `SELECT`. **Multi-tab** (`/sql`) — `Query 1, Query 2…` `+`, persisted `localStorage deck:sql:tabs` + `deck:sql:active`, close shows dialog (`AlertTriangle` + preview `300 chars`) and deletes from storage.
- **Schema Canvas** — `GET /api/schema` (tables + columns + PK + relations), `SchemaPage.jsx` — `TopBar` (Deck logo `32×32` `stroke 2.2`), `LeftNav` (`Health/Data/SQL Editor/Schema/Logs` + `History/Settings`), `Sidebar` (`public ⌄`, `Tables`, `Search`, `orders/products/test/users` `32px` `rounded 5` `13px` `active #3B3935`), canvas `bg #1D1C1A` `border #3B3A36` `rounded 9` inside `p-3` form div, dot pattern `radial #4A4944/#3B3A36` `24px` `0.35/0.25` transformed with `offset/zoom`, tables `280px` `bg #292824` `border #3B3A36` draggable (`handleTableMouseDown` canvas coords `(e.clientX - offset.x)/zoom`), panning on empty space (`data-table-card` check), wheel zoom `0.4–1.8` towards cursor, header `h-7` `bg #3B3A36/60`, rows `22px` `11px` mono with `Key #EAB308` (PK) / `Link2 #4A90E2` (FK) + `Id<"users">`, indexes `INDEXES 10px`, relations Manhattan `M sx fromY L midX fromY L midX toY L tx toY` field-to-field (`fromCol`/`toCol` + `isPrimary/isFK`), bottom toolbar `− 61% +` `Maximize2` `RotateCcw` `Automatic grouping` toggle. Layout persists `localStorage deck:schema:*` (`zoom/offset/positions/autoGroup`), sidebar click zooms to table with `450ms ease` `requestAnimationFrame`.
- **Health** (`/health`) — `TopBar` + `LeftNav` (no DB explorer), `PostgreSQL` `w-7` in title + connection card, `CONNECTION` pill, `HOST:PORT`/`DATABASE`/`USER`/`LATENCY`, `Status` `API Healthy`/`Reachable`/`1 client`, metrics `TABLES`/`ROWS`/`SIZE`/`LATENCY` `20px`, tables list `4` (`orders/products/test/users` mock when disconnected).
- **Logs** (`/logs`) — `TopBar`+`LeftNav`, `sessionStorage deck:api:logs` (max 100) via `api.js` wrapper (`method/path/status/duration/requestBody/responseBody/error/timestamp`), `Search`, `Refresh`/`Clear`, list `h-10` `hover #232220`, `Method` `GET #B7B5B0` `POST #4A90E2`, `Status` green/red pill, expand `REQUEST`/`RESPONSE` `pre` `bg #292824`.
- **Navigation** — `TopBar` `64px` `bg #292824` `border #3B3A36`, `Deck` `14px` `/` + `PostgreSQL w-8` + `dbName` (`movieman` fallback → live `mydb`), health pill, `Find anything` `240×40` `border #3B3A36` `bg #232220`, avatar. `LeftNav` `150px` → `56px` collapsible (`w-[150px]⇄w-[56px]` `transition-all`, `localStorage deck:leftNav:collapsed`, `ChevronsLeft/Right`), items `40px` `13px` `18px` `stroke 1.8`, active `bg #3B3935` `text #F0EFEC`. `Tabs` `38px` `13px` active `bg #292824` `border #4A90E2`.
- **Data page** — `TopBar`+`LeftNav`+`Sidebar 330px`+`Main #1D1C1A p-7` — header `18px 600 #F0EFEC` + `+ Add` `40px` `border #4A4944` `bg #292824` + `⋮`, table `border #3B3A36` `rounded 9` `bg #2A2825`, `fn` → `Braces SQL Editor` `h-10 px-4` `bg #292824` `→ /sql`.

---

## Tech Stack

| Tech | Version | Use |
|------|---------|-----|
| React | 19 | UI |
| Vite | 6 | Build / HMR |
| React Router | 7.18 | Routing (`/`, `/connect`, `/health`, `/logs`, `/sql`, `/schema`) |
| Tailwind | 3 | Utility classes, `Inter` + `GT America` + `Geist Mono` |
| Monaco | 4.7 | SQL editor (`vs-dark`, `pgsql`) |
| pg | 8.23 | `Pool`, `client.query` |
| Express | 5.2 | `server/index.js` API + static `dist` |
| Lucide | 0.475 | Icons (`18px` nav, `16px` UI, `13px` table) |
| concurrently | 10 | `dev` (server + vite) |

---

## Quick Start

### Prerequisites
- Node 18+ / npm
- PostgreSQL 12+ (local or remote) — default expects `postgresql://postgres:280823@localhost:5432/mydb` (change in Connect form)

### Install & Run (unified)

```bash
git clone https://github.com/Untitled-Master/Deck.git
cd Deck
npm install

# dev: API :3001 + Vite :5173 concurrently
npm run dev
# → http://localhost:5173 (vite) + http://localhost:3001/api/*

# production: build + serve on single port :3001
npm start
# → http://localhost:3001 (API + static)

# single services
npm run dev:vite   # vite only
npm run dev:server # node server/index.js :3001
npm run server     # alias for dev:server
```

Killed old `0.0.0.0:3001` (`PID 9428`, `32360`) before unified server — `server/index.js` now serves `dist` via `express.static` + SPA fallback `app.get(/^(?!\/api).*/)` when `dist` exists, logs `serving frontend from ...`.

### Build

```bash
npm run build   # vite build → dist/
npm run preview # vite preview
```

---

## Environment

- `VITE_API_URL` — override API base (default `http://localhost:3001`)
- `PORT` — server port (`process.env.PORT || 3001`)

No `.env` required; connection is entered in UI and held in memory (`pool` + `connectionConfig`).

---

## API

Base `http://localhost:3001/api`

| Method | Path | Body / Query | Description |
|--------|------|--------------|-------------|
| POST | `/api/connect` | `{host,port,database,user,password}` | `new Pool`, `SELECT 1`, `SHOW server_version`, stores `pool` |
| POST | `/api/disconnect` | — | `pool.end()` |
| GET | `/api/status` | — | `{connected, config}` |
| POST | `/api/query` | `{sql, params?}` | `splitStatements` (quotes/`$tag$`/comments), single `client` sequential, `results[]` (`command/rowCount/rows/fields/duration`) + `duration` |
| GET | `/api/tables` | — | `pg_class` + `pg_stat_user_tables` → `tables{name,schema,type,sizeBytes,columnCount,estimatedRows}` |
| GET | `/api/tables/:name/columns` | — | `information_schema.columns` + `table_constraints` + `key/column_usage` → `columns{column,type,nullable,default,isPrimary,isUnique,foreignKey}` |
| GET | `/api/tables/:name/relations` | — | outgoing/incoming `FOREIGN KEY` with `constraint_name/update_rule/delete_rule` |
| GET | `/api/schema` | — | all tables + columns (with PK) + relations (`sourceTable/sourceColumn/targetTable/targetColumn`) |
| GET | `/api/tables/:name/rows` | `?limit=100&offset=0` | `SELECT * FROM "name" LIMIT/OFFSET` + `count(*)` |
| GET | `/api/health` | — | `{ok, connected}` |

All `GET /api/*` return `400 {success:false, error}` when not connected; `POST /api/query` returns `400` with `results` partial on failure.

**Mock** when not connected: `Sidebar`/`Health`/`DataGrid`/`Schema` fall back to `favorites` (6 docs), `users` (6), `orders`/`products`/`test` (4 `id/num` 1:100…4:600).

---

## Project Structure

```
deck/
├── server/index.js          # Express + pg Pool, splitStatements, /api/*, static dist
├── src/
│   ├── components/
│   │   ├── DeckLogo.jsx     # 32×32 deck isometry (stroke 2.2)
│   │   ├── PostgreSQL.jsx   # 432×445 elephant
│   │   ├── layout/TopBar.jsx      # 64px, Deck + PostgreSQL w-8 + dbName, health pill, search 240×40
│   │   ├── layout/LeftNav.jsx     # 150→56 collapsible, Health/Data/SQL/Schema/Logs/History/Settings, ChevronsLeft/Right
│   │   ├── layout/Sidebar.jsx     # 330px, public 40px #4A4944, Tables 13px, 32px rows #3B3935 active #4A90E2
│   │   ├── layout/Header.jsx      # 52px, 18px title, Refresh/Run
│   │   ├── layout/TabBar.jsx      # 38px, Data/Structure/Relations, active #292824 border #4A90E2
│   │   ├── editor/SqlEditor.jsx   # Monaco vs-dark 320px 14px Geist Mono, 38px header, Run #4A90E2
│   │   ├── tables/DataGrid.jsx    # 52px toolbar (ArrowLeft/Right, Filter&Sort bold, EyeOff col picker, +Add, Delete), 40px header/row, #2A2825, #24221F, 520px fixed h, inline edit, delete dialog
│   │   ├── tables/StructureView.jsx # 40px header, 13px, PK Key #EAB308 / FK Link2 #4A90E2
│   │   ├── tables/RelationsView.jsx # field-to-field Manhattan L
│   │   └── ui/*               # Radix, shadcn
│   ├── pages/
│   │   ├── EditorPage.jsx     # / (Data) — TopBar+LeftNav+Sidebar 330 + Main #1D1C1A p-7, DataGrid + fn→/sql Braces, Structure/Relations via TabBar
│   │   ├── SqlPage.jsx        # /sql — multi-tab Query 1.. (uid, localStorage deck:sql:tabs/active, X + dialog, +), per-tab results
│   │   ├── SchemaPage.jsx     # /schema — TopBar+LeftNav+Sidebar, dot grid 24px #4A4944/#3B3A36, draggable tables 280px, Manhattan field-to-field, zoom 0.4–1.8 wheel, localStorage deck:schema:*
│   │   ├── HealthPage.jsx     # /health — TopBar+LeftNav (no explorer), PostgreSQL w-7/w-5, Connection, Status, Metrics, Tables 4
│   │   ├── LogsPage.jsx       # /logs — sessionStorage deck:api:logs (100), filter, expand REQUEST/RESPONSE
│   │   └── ConnectPage.jsx    # /connect — 960px grid, left branding Deck + npx deck, right form 40px inputs #1D1C1A #4A4944
│   ├── context/ConnectionContext.jsx # connect/disconnect/status, pool config
│   ├── lib/api.js             # fetch wrapper, BASE, addLog → sessionStorage, getLogs/clearLogs, request logging
│   ├── lib/utils.js
│   ├── App.jsx                # BrowserRouter, ConnectionProvider, Routes /connect / /health /logs /sql /schema
│   └── index.css              # Tailwind base, Inter/GT America, tokens #292824 #1D1C1A #232220 #3B3A36 #4A4944 #F0EFEC #B7B5B0 #85837E #22C55E #4A90E2
├── vite.config.js             # alias @
├── index.html
└── package.json
```

---

## Scripts

```bash
npm run dev        # concurrently server + vite (dim/cyan)
npm run dev:vite   # vite
npm run dev:server # node server/index.js
npm run build      # vite build
npm run start      # build + node server (unified :3001)
npm run preview    # vite preview
npm run lint       # eslint
```

---

## Connection Defaults

Pre-filled in `ConnectPage.jsx:14`:

```js
{ host: "localhost", port: "5432", database: "mydb", user: "postgres", password: "280823" }
```

Change in UI; stored only in memory (`pool`), `password: "***"` in `connectionConfig`.

---

## Deployment

- **Local** `npx deck` — expects `server/index.js` + `dist` (after `npm run build`) on `:3001`
- **Vercel** — `vercel.json` present, but `pg` requires Node server — deploy `server` separately or use `npm start` on a Node host

---

## Security

- `password` never written to disk, held in `pool` config only
- `sessionStorage` logs (100) per-tab, cleared on tab close or `Clear`
- `localStorage` for `deck:selectedTable`, `deck:activeTab`, `deck:sql:tabs`, `deck:schema:*`, `deck:leftNav:collapsed` — no secrets

---

## Contributing

PRs welcome — `git checkout -b feature/x`, `npm run lint`, `npm run build`.

---

## License

MIT — see `LICENSE`.

---

<div align="center">
  <sub>Built with <a href="https://github.com/Untitled-Master/Deck">Deck</a> • <a href="https://www.postgresql.org/">PostgreSQL</a> • <a href="https://react.dev/">React</a></sub>
</div>
