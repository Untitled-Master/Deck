<div align="center">
  <img src="./public/deck-logo.svg" alt="Deck" width="72" height="72" onerror="this.style.display='none'" />
  <h1>Deck</h1>
  <p><strong>Your database, on deck.</strong> — Local PostgreSQL IDE for developers.</p>
  <p>
    <img src="https://img.shields.io/badge/status-beta-orange?style=flat-square" alt="Beta" />
    <img src="https://img.shields.io/badge/license-MIT-black?style=flat-square" alt="MIT" />
    <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" alt="React" />
    <img src="https://img.shields.io/badge/PostgreSQL-17-336791?style=flat-square&logo=postgresql" alt="PostgreSQL" />
    <img src="https://img.shields.io/github/stars/Untitled-Master/Deck?style=flat-square" alt="Stars" />
  </p>
  <p>
    <a href="https://github.com/Untitled-Master/Deck"><strong>Untitled-Master/Deck</strong></a> • Dense, monochrome, desktop-first • No telemetry
  </p>
  <p><strong>Beta</strong> — API and UI may change. Feedback via GitHub Issues is welcome.</p>
</div>

---

## Overview

Deck is a local PostgreSQL control app. Connect to any Postgres instance, browse tables, edit data inline, run sequential SQL like `psql`, and inspect schema, relations, health and request logs — all in a flat charcoal workspace inspired by Supabase Table Editor and Vercel dashboard density.

- **Local-first** — credentials live in memory (`pg.Pool`), never written to disk
- **Unified server** — Express serves API (`/api/*`) and the Vite build (`dist`) on one port
- **Dense UI** — `Inter`/`GT America`/`Geist Mono`, `13px` type, `1px` `#3B3A36` borders, `6–9px` radii, no gradients or shadows

---

## Features

| Area | What it does |
|------|--------------|
| **Connection** | Form (`host`, `port`, `database`, `user`, `password`) → `POST /api/connect` (`SELECT 1` + `SHOW server_version`). Pill `Healthy • PostgreSQL` (`#22C55E` on `rgba(34,197,94,0.08)`). DB name in `TopBar` with PostgreSQL logo. |
| **Data Grid** | Fixed `520px` table (`#2A2825`) — `40px` header/row, `16px` checkbox, inline double-click edit (`UPDATE … WHERE pk`), row selection, `Delete` with confirm dialog, `+ Add` dialog (`INSERT`), column picker (`EyeOff`), `Filter & Sort`. |
| **SQL Editor** | Monaco `vs-dark` (`Geist Mono` `14px`, `320px`). Sequential `splitStatements` (handles `'`, `"`, `$tag$`, `--`, `/* */`) on a single `client` — returns `results[]` per statement. Multi-tab (`Query 1…` `+`, `localStorage deck:sql:*`, close confirm). |
| **Schema Canvas** | `GET /api/schema` — draggable tables (`280px`), dot grid `24px`, Manhattan field-to-field lines (`userId → _id`), zoom `0.4–1.8` (wheel), pan, `localStorage deck:schema:*`, sidebar click animates to table. |
| **Health** | `GET /api/status` + `pg_database_size` — connection card, `API Healthy`/`Reachable`, metrics `TABLES`/`ROWS`/`SIZE`/`LATENCY`. |
| **Logs** | `GET /api/*` intercepted → `sessionStorage deck:api:logs` (100) — `Logs` page with filter, expand `REQUEST`/`RESPONSE`. |
| **Navigation** | `TopBar 64px` (`Deck` `32px` isometry + `PostgreSQL`), `LeftNav 150⇄56px` collapsible (`Health/Data/SQL Editor/Schema/Logs`), `Sidebar 330px` (`public`, `Tables`, `32px` rows). |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite 6, React Router 7, Tailwind CSS 3, Radix UI, Monaco Editor, Lucide Icons |
| Backend | Node 18+, Express 5, `pg` 8.23 (`Pool`) |
| Tooling | `concurrently` (dev), ESLint, `sonner` toasts |

---

## Requirements

- Node.js `18+`
- PostgreSQL `12+` reachable at `host:port`

Defaults pre-filled in the connect form:

```
host=localhost  port=5432  database=mydb  user=postgres  password=280823
```

---

## Installation & Launch

```bash
# 1. Clone
git clone https://github.com/Untitled-Master/Deck.git
cd Deck

# 2. Install
npm install

# 3a. Development — API (:3001) + Vite (:5173) concurrently
npm run dev
# → http://localhost:5173  (Vite)
# → http://localhost:3001/api/* (API)

# 3b. Production — single port
npm start
# → builds (vite build → dist/) then node server/index.js
# → http://localhost:3001  (API + static frontend)

# Other commands
npm run dev:vite    # Vite only
npm run dev:server  # node server/index.js only
npm run build       # vite build
npm run preview     # vite preview
npm run lint        # eslint .
```

> **npx deck** — for local distribution, the package exposes a binary that runs `node server/index.js` after build (see `bin` in `package.json` when published).

Environment:

```bash
PORT=3001                    # server port (default 3001)
VITE_API_URL=http://localhost:3001  # frontend API base (default)
```

---

## Using Deck

1. **Connect** — `http://localhost:5173/connect` (or `:3001/connect` in production) → fill form → `Connect`. On success you are redirected to `/` (Data). `Already connected` banner appears if a pool exists.
2. **Data** — `/` — select table from `Sidebar 330px` (`orders`, `products`, `test`, `users`), use `Filter & Sort` (bold), eye picker, `+ Add`, row checkboxes → `Delete N` → confirm dialog, double-click cell → edit → `Enter` saves (`UPDATE`), `Esc` cancels. Table is `520px` fixed, `8px` scrollbar `track #1D1C1A` `thumb #5A5852`.
3. **SQL Editor** — `/sql` via `LeftNav` or the `fn → SQL Editor` (`Braces`) button in Data — multi-tab (`Query 1` `+` `X` with close dialog), `Run` (`Ctrl+Enter`) executes the whole string sequentially. Example:

   ```sql
   INSERT INTO users VALUES (122, 'Ahmed', 100);
   SELECT * FROM users LIMIT 100;
   -- → INSERT 0 1
   -- → SELECT 2 rows • 12ms (DataGrid)
   ```
4. **Schema** — `/schema` — canvas (`#1D1C1A` `border #3B3A36` `rounded 9`) with dot grid, drag tables (`cursor-grab`), pan on empty, wheel zoom to cursor, `− 61% +` + `Automatic grouping` toggle. Tables show `PK Key #EAB308` / `FK Link2 #4A90E2` and `Id<"users">`, lines are Manhattan `M sx fromY L midX fromY L midX toY L tx toY`. Click a table in `Sidebar` to animate-zoom to it.
5. **Health** — `/health` — `PostgreSQL` logo, `Connection` (`HOST:PORT`/`DATABASE`/`USER`/`LATENCY`), `Status` (`Healthy`/`Reachable`), metrics `TABLES`/`ROWS`/`SIZE`/`LATENCY`.
6. **Logs** — `/logs` — `Find anything` filter, `Refresh`/`Clear`, list `Method` (`GET`/`POST`), `Path`, `Status` (green/red pill), `Duration`, expand to see `REQUEST`/`RESPONSE` JSON.

---

## API Reference

Base `http://localhost:3001/api` — all `GET` return `400 {success:false}` when not connected.

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/connect` | `{host,port,database,user,password}` → `SELECT 1`, `SHOW server_version` |
| `POST` | `/api/disconnect` | `pool.end()` |
| `GET` | `/api/status` | `{connected, config}` |
| `POST` | `/api/query` | `{sql, params?}` → `results[]` (`command`/`rowCount`/`rows`/`fields`/`duration`) |
| `GET` | `/api/tables` | `pg_class` + `pg_stat_user_tables` |
| `GET` | `/api/tables/:name/columns` | `information_schema.columns` + constraints |
| `GET` | `/api/tables/:name/relations` | outgoing/incoming `FOREIGN KEY` |
| `GET` | `/api/schema` | all tables + columns (with PK) + relations |
| `GET` | `/api/tables/:name/rows?limit=&offset=` | `SELECT *` + `count(*)` |
| `GET` | `/api/health` | `{ok, connected}` |

When disconnected, `DataGrid`/`Sidebar`/`Schema`/`Health` fall back to mock: `favorites` (6 docs), `users` (6), `test` (`id/num` `1:100`…`4:600`), `orders`/`products`.

---

## Project Structure

```
deck/
├── server/index.js              # Express, pg Pool, splitStatements, /api/*, static dist + SPA fallback
├── src/
│   ├── components/
│   │   ├── DeckLogo.jsx         # 32×32 isometry
│   │   ├── PostgreSQL.jsx       # 432×445 elephant
│   │   ├── layout/TopBar.jsx    # 64px #292824, Deck 14px/PostgreSQL w-8/dbName, health pill, search 240×40
│   │   ├── layout/LeftNav.jsx   # 150→56 collapsible, 40px 13px 18px, active #3B3935
│   │   ├── layout/Sidebar.jsx   # 330px #292824, public 40px #4A4944, 32px rows
│   │   ├── editor/SqlEditor.jsx # Monaco 320px 14px, 38px tabs
│   │   └── tables/DataGrid.jsx  # 52px toolbar, 40px grid, #2A2825, 8px scroll, edit/select/delete/add
│   ├── pages/
│   │   ├── EditorPage.jsx       # / — Data (fixed 520px) + Structure/Relations via TabBar 38px
│   │   ├── SqlPage.jsx          # /sql — multi-tab + localStorage
│   │   ├── SchemaPage.jsx       # /schema — canvas + Manhattan field-to-field
│   │   ├── HealthPage.jsx       # /health — PostgreSQL w-7, no explorer
│   │   ├── LogsPage.jsx         # /logs — sessionStorage
│   │   └── ConnectPage.jsx      # /connect — 960px grid, left branding + right form 40px #1D1C1A
│   ├── context/ConnectionContext.jsx
│   ├── lib/api.js               # fetch wrapper + sessionStorage deck:api:logs
│   └── index.css                # Tailwind base, Inter/GT America/Geist Mono, tokens #292824 #1D1C1A #3B3A36 #F0EFEC #22C55E #4A90E2
└── package.json                 # dev/start/server, concurrently
```

---

## Development

```bash
npm run lint     # eslint
npm run build    # vite build → dist/ (served by server in production)
```

- **Killed old `0.0.0.0:3001`** (`PID 9428`) before unified server — `server/index.js` now checks `fs.existsSync(dist)` and serves `express.static(dist)` + `app.get(/^(?!\/api).*/)` fallback.
- **Persistence** — `localStorage` for `deck:selectedTable`, `deck:activeTab`, `deck:sql:tabs`, `deck:schema:*`, `deck:leftNav:collapsed`; `sessionStorage` for logs.

---

## Security

- Password held only in `pool` memory, `config` stores `"***"`, never written to disk
- No telemetry

---

## Contributing

Issues and PRs welcome at [Untitled-Master/Deck](https://github.com/Untitled-Master/Deck).

```bash
git checkout -b feat/your-feature
npm run lint && npm run build
git commit -m "feat: your feature"
git push origin feat/your-feature
# open PR
```

---

## License

MIT — see [LICENSE](LICENSE).

<div align="center">
  <sub>Deck • <a href="https://github.com/Untitled-Master/Deck">Untitled-Master/Deck</a> • PostgreSQL • React</sub>
</div>
