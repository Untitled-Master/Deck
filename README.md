<div align="center">
  <img src="./public/deck-logo.svg" alt="Deck" width="72" height="72" onerror="this.style.display='none'" />
  <h1>Deck</h1>
  <p><strong>Your database, on deck.</strong> — Local PostgreSQL workspace for developers.</p>
  <p>
    <img src="https://img.shields.io/badge/status-beta-orange?style=flat-square" alt="Beta" />
    <img src="https://img.shields.io/badge/license-MIT-black?style=flat-square" alt="MIT" />
    <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" alt="React" />
    <img src="https://img.shields.io/badge/PostgreSQL-17-336791?style=flat-square&logo=postgresql" alt="PostgreSQL" />
    <img src="https://img.shields.io/github/stars/Untitled-Master/Deck?style=flat-square" alt="Stars" />
  </p>
  <p>
    <a href="https://github.com/Untitled-Master/Deck"><strong>Untitled-Master/Deck</strong></a> • No telemetry • Local-first
  </p>
  <p><strong>Beta</strong> — APIs and UI may change. Please open an issue for feedback.</p>
</div>

---

## Overview

Deck is a desktop-first PostgreSQL IDE that runs locally. Connect to any Postgres instance and browse tables, edit rows, run SQL, inspect schema and monitor health — all from a single window.

- Credentials stay in memory (`pg.Pool`) and are never written to disk
- One server serves both API and the built frontend
- Works fully offline with mock data when not connected

---

## Features

| Area | Capabilities |
|------|--------------|
| **Connect** | Connect to any PostgreSQL host/port/database with user/password. Test connection, show server version and latency, and keep the session alive. |
| **Data** | Browse tables, search and filter, paginate, hide/show columns, sort, select rows, double-click to edit a cell, and add or delete rows with confirmation. |
| **SQL Editor** | Monaco-based editor with PostgreSQL syntax, run one or many statements sequentially (like `psql`), see per-statement results, and keep multiple tabs. |
| **Schema** | Visual canvas of all tables and their relations. Drag tables, pan and zoom, and jump to a table from the explorer. |
| **Health** | Live connection status, database size, table and row counts, and request latency. |
| **Logs** | Local history of recent API requests with method, path, status and duration; expand to inspect request and response bodies. |
| **Navigation** | Collapsible sidebar, top bar with connection and search, and a dedicated database explorer. |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite 6, React Router 7, Tailwind CSS 3, Monaco Editor, Lucide Icons |
| Backend | Node.js 18+, Express 5, `pg` 8.23 |
| Tooling | `concurrently`, ESLint |

---

## Requirements

- Node.js `18+` and `npm`
- PostgreSQL `12+` reachable at your chosen host and port

Default connection values pre-filled in the UI:

```
host=localhost  port=5432  database=mydb  user=postgres  password=280823
```

---

## Installation & Launch

```bash
# 1 — Clone
git clone https://github.com/Untitled-Master/Deck.git
cd Deck

# 2 — Install
npm install

# 3 — Run in development (API on :3001 + Vite on :5173)
npm run dev
# → http://localhost:5173

# 4 — Production build + single-port server
npm start
# → http://localhost:3001
```

Other commands:

```bash
npm run dev:vite    # Vite only
npm run dev:server  # API only (node server/index.js)
npm run build       # vite build → dist/
npm run preview     # vite preview
npm run lint        # eslint
```

Environment:

```bash
PORT=3001
VITE_API_URL=http://localhost:3001
```

> `npx deck` is reserved for the published package — it will run the production server after `npm run build`.

---

## Quick Tour

1. **Connect** at `/connect` — enter host/port/database/user/password and connect. You’ll be redirected to `/`.
2. **Data** at `/` — pick a table from the explorer, use the toolbar to filter/sort or toggle columns, double-click a cell to edit, select rows to delete, or use **Add** to insert a new row.
3. **SQL Editor** at `/sql` — open from the sidebar or the floating button in Data. Write one or many statements (`;` separated) and press **Run**. For example:

   ```sql
   INSERT INTO users VALUES (122, 'Ahmed', 100);
   SELECT * FROM users LIMIT 100;
   ```

   You’ll see `INSERT 0 1` and then the `SELECT` result as a table.

4. **Schema** at `/schema` — pan by dragging the background, drag tables by their header, use the mouse wheel to zoom, or click a table in the sidebar to focus it.
5. **Health** at `/health` — check connection, latency, table counts and database size.
6. **Logs** at `/logs` — review the last 100 API calls made in this tab.

---

## API Reference

Base URL: `http://localhost:3001/api` — all `GET` endpoints return `400` when not connected.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/connect` | Connect with `{host, port, database, user, password}` |
| `POST` | `/api/disconnect` | Close the current pool |
| `GET` | `/api/status` | Connection state |
| `POST` | `/api/query` | Execute SQL (single or multi-statement) |
| `GET` | `/api/tables` | List tables in `public` |
| `GET` | `/api/tables/:name/columns` | Columns and constraints for a table |
| `GET` | `/api/tables/:name/relations` | Incoming/outgoing foreign keys |
| `GET` | `/api/schema` | All tables + relations for the canvas |
| `GET` | `/api/tables/:name/rows` | Paginated rows |
| `GET` | `/api/health` | Simple health check |

When disconnected, the UI falls back to mock data (`favorites`, `users`, `orders`, `products`, `test`).

---

## Project Structure

```
deck/
├── server/index.js           # Express + pg, API + static frontend
├── src/
│   ├── components/
│   │   ├── DeckLogo.jsx
│   │   ├── PostgreSQL.jsx
│   │   ├── layout/           # TopBar, LeftNav, Sidebar
│   │   ├── editor/           # SqlEditor
│   │   └── tables/           # DataGrid, StructureView, RelationsView
│   ├── pages/                # EditorPage, SqlPage, SchemaPage, HealthPage, LogsPage, ConnectPage
│   ├── context/              # ConnectionContext
│   ├── lib/                  # api.js, utils
│   └── index.css
├── vite.config.js
└── package.json
```

---

## Development Notes

- **Persistence** — `localStorage` for selected table/tab, SQL tabs, schema layout and nav state; `sessionStorage` for request logs.
- **Unified server** — `server/index.js` serves `dist/` when it exists and falls back to `index.html` for SPA routes.

---

## Security

- Password is held only in memory and shown as `***` in status — never written to disk or `localStorage`.
- No telemetry or external tracking.

---

## Contributing

Issues and pull requests are welcome at [Untitled-Master/Deck](https://github.com/Untitled-Master/Deck).

```bash
git checkout -b feat/your-feature
npm run lint
npm run build
git push origin feat/your-feature
```

---

## License

MIT — see [LICENSE](LICENSE).

<div align="center">
  <sub>Deck • <a href="https://github.com/Untitled-Master/Deck">Untitled-Master/Deck</a> • PostgreSQL • React</sub>
</div>
