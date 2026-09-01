import express from "express"
import cors from "cors"
import pg from "pg"
import path from "path"
import { fileURLToPath } from "url"
import fs from "fs"

const { Pool } = pg

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json({ limit: "2mb" }))

let pool = null
let connectionConfig = null

function getPool() {
  return pool
}

// Split SQL into individual statements, respecting quotes, dollar quotes and comments
function splitStatements(sql) {
  const stmts = []
  let cur = ""
  let inSingle = false
  let inDouble = false
  let inLineComment = false
  let inBlockComment = false
  let dollarTag = null

  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i]
    const next = sql[i + 1]

    // line comment --
    if (!inSingle && !inDouble && !inBlockComment && dollarTag === null && ch === "-" && next === "-") {
      inLineComment = true
      cur += ch
      continue
    }
    if (inLineComment) {
      cur += ch
      if (ch === "\n") inLineComment = false
      continue
    }
    // block comment /*
    if (!inSingle && !inDouble && !inLineComment && dollarTag === null && ch === "/" && next === "*") {
      inBlockComment = true
      cur += ch
      continue
    }
    if (inBlockComment) {
      cur += ch
      if (ch === "*" && next === "/") {
        cur += next
        i++
        inBlockComment = false
      }
      continue
    }
    // dollar quote $tag$
    if (!inSingle && !inDouble && !inLineComment && !inBlockComment) {
      if (ch === "$") {
        const m = sql.slice(i).match(/^\$[a-zA-Z0-9_]*\$/)
        if (m) {
          const tag = m[0]
          if (dollarTag === null) {
            dollarTag = tag
            cur += tag
            i += tag.length - 1
            continue
          } else if (dollarTag === tag) {
            dollarTag = null
            cur += tag
            i += tag.length - 1
            continue
          }
        }
      }
      if (dollarTag !== null) {
        cur += ch
        continue
      }
    }
    if (dollarTag !== null) {
      cur += ch
      continue
    }

    // single quotes, '' escaped
    if (ch === "'" && !inDouble && !inLineComment && !inBlockComment) {
      if (inSingle && next === "'") {
        cur += "''"
        i++
        continue
      }
      inSingle = !inSingle
      cur += ch
      continue
    }
    // double quotes, "" escaped
    if (ch === '"' && !inSingle && !inLineComment && !inBlockComment) {
      if (inDouble && next === '"') {
        cur += '""'
        i++
        continue
      }
      inDouble = !inDouble
      cur += ch
      continue
    }

    if (ch === ";" && !inSingle && !inDouble && !inLineComment && !inBlockComment && dollarTag === null) {
      if (cur.trim()) stmts.push(cur.trim())
      cur = ""
      continue
    }
    cur += ch
  }
  if (cur.trim()) stmts.push(cur.trim())
  // filter out pure comment/empty statements
  return stmts.filter(s => s.replace(/--.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "").trim().length > 0)
}

// Test + store connection
app.post("/api/connect", async (req, res) => {
  const { host, port, database, user, password } = req.body

  if (!host || !port || !database || !user) {
    return res.status(400).json({ success: false, error: "Missing required fields: host, port, database, user" })
  }

  if (pool) {
    try { await pool.end() } catch {}
    pool = null
  }

  const config = {
    host: host.trim(),
    port: Number(port),
    database: database.trim(),
    user: user.trim(),
    password: password ?? "",
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  }

  const testPool = new Pool(config)

  try {
    const client = await testPool.connect()
    await client.query("SELECT 1")
    const versionRes = await client.query("SHOW server_version;")
    client.release()

    pool = testPool
    connectionConfig = { host, port: Number(port), database, user, password: password ? "***" : "" }

    return res.json({
      success: true,
      message: "Connected",
      config: connectionConfig,
      serverVersion: versionRes.rows?.[0]?.server_version ?? null,
    })
  } catch (err) {
    try { await testPool.end() } catch {}
    console.error("pg connect error:", err.message)
    return res.status(400).json({ success: false, error: err.message })
  }
})

app.post("/api/disconnect", async (req, res) => {
  if (pool) {
    try { await pool.end() } catch {}
    pool = null
    connectionConfig = null
  }
  res.json({ success: true })
})

app.get("/api/status", (req, res) => {
  res.json({
    connected: !!pool,
    config: connectionConfig,
  })
})

// Execute arbitrary SQL — supports multiple statements sequentially like psql
app.post("/api/query", async (req, res) => {
  const p = getPool()
  if (!p) return res.status(400).json({ success: false, error: "Not connected to any database. POST /api/connect first." })

  const { sql, params } = req.body
  if (!sql || typeof sql !== "string" || !sql.trim()) {
    return res.status(400).json({ success: false, error: "Missing 'sql' string" })
  }

  const statements = splitStatements(sql)
  if (!statements.length) {
    return res.status(400).json({ success: false, error: "No executable statements found" })
  }

  const client = await p.connect()
  const results = []
  const startAll = performance.now()
  try {
    for (let idx = 0; idx < statements.length; idx++) {
      const stmt = statements[idx]
      const s = performance.now()
      // only first statement gets params if provided (to keep simple)
      const result = await client.query(stmt, idx === 0 && params ? params : undefined)
      const duration = Math.round(performance.now() - s)
      results.push({
        sql: stmt,
        command: result.command,
        rowCount: result.rowCount,
        rows: result.rows,
        fields: result.fields?.map(f => ({ name: f.name, dataTypeID: f.dataTypeID })) ?? [],
        duration,
        oid: result.oid ?? null,
      })
    }
    const totalDuration = Math.round(performance.now() - startAll)
    const last = results[results.length - 1]
    return res.json({
      success: true,
      results,
      duration: totalDuration,
      // backward compat for single-statement callers
      rowCount: last.rowCount,
      rows: last.rows,
      fields: last.fields,
      command: last.command,
    })
  } catch (err) {
    const totalDuration = Math.round(performance.now() - startAll)
    console.error("pg query error:", err.message, "at statement", results.length + 1)
    return res.status(400).json({
      success: false,
      error: err.message,
      code: err.code,
      results, // partial results before error
      failedAt: results.length,
      failedSql: statements[results.length],
      duration: totalDuration,
    })
  } finally {
    client.release()
  }
})

// List tables in public schema
app.get("/api/tables", async (req, res) => {
  const p = getPool()
  if (!p) return res.status(400).json({ success: false, error: "Not connected" })
  try {
    const result = await p.query(`
      SELECT
        c.relname AS name,
        c.relkind AS kind,
        n.nspname AS schema,
        pg_total_relation_size(c.oid) AS size_bytes,
        (SELECT count(*)::int FROM information_schema.columns WHERE table_name = c.relname AND table_schema = n.nspname) AS column_count
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relkind IN ('r','v','m')
      ORDER BY c.relname;
    `)

    const counts = await p.query(`
      SELECT relname, n_live_tup::int as estimate
      FROM pg_stat_user_tables WHERE schemaname='public';
    `)
    const countMap = Object.fromEntries(counts.rows.map(r => [r.relname, r.estimate]))

    const tables = result.rows.map(r => ({
      name: r.name,
      schema: r.schema,
      type: r.kind === 'v' ? 'view' : r.kind === 'm' ? 'materialized' : 'table',
      sizeBytes: Number(r.size_bytes),
      columnCount: Number(r.column_count),
      estimatedRows: countMap[r.name] ?? 0,
    }))

    res.json({ success: true, tables })
  } catch (err) {
    res.status(400).json({ success: false, error: err.message })
  }
})

// Get columns for a table
app.get("/api/tables/:name/columns", async (req, res) => {
  const p = getPool()
  if (!p) return res.status(400).json({ success: false, error: "Not connected" })
  const { name } = req.params
  try {
    const result = await p.query(`
      SELECT
        column_name,
        data_type,
        udt_name,
        is_nullable,
        column_default,
        character_maximum_length
      FROM information_schema.columns
      WHERE table_schema='public' AND table_name=$1
      ORDER BY ordinal_position;
    `, [name])

    const constraints = await p.query(`
      SELECT
        kcu.column_name,
        tc.constraint_type,
        ccu.table_name AS foreign_table,
        ccu.column_name AS foreign_column
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
      LEFT JOIN information_schema.constraint_column_usage ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.table_schema='public' AND tc.table_name=$1;
    `, [name])

    const map = {}
    for (const c of constraints.rows) {
      if (!map[c.column_name]) map[c.column_name] = []
      map[c.column_name].push(c)
    }

    const columns = result.rows.map(r => ({
      column: r.column_name,
      type: r.data_type === 'USER-DEFINED' ? r.udt_name : r.data_type,
      udtName: r.udt_name,
      nullable: r.is_nullable === 'YES',
      default: r.column_default,
      maxLength: r.character_maximum_length,
      constraints: map[r.column_name] ?? [],
      isPrimary: (map[r.column_name] ?? []).some(x => x.constraint_type === 'PRIMARY KEY'),
      isUnique: (map[r.column_name] ?? []).some(x => x.constraint_type === 'UNIQUE'),
      foreignKey: (map[r.column_name] ?? []).find(x => x.constraint_type === 'FOREIGN KEY') ?? null,
    }))

    res.json({ success: true, table: name, columns })
  } catch (err) {
    res.status(400).json({ success: false, error: err.message })
  }
})

// Get relations (foreign keys) for a table
app.get("/api/tables/:name/relations", async (req, res) => {
  const p = getPool()
  if (!p) return res.status(400).json({ success: false, error: "Not connected" })
  const { name } = req.params
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
    return res.status(400).json({ success: false, error: "Invalid table name" })
  }
  try {
    const outgoing = await p.query(`
      SELECT
        kcu.column_name AS column_name,
        ccu.table_name AS foreign_table,
        ccu.column_name AS foreign_column,
        tc.constraint_name,
        rc.update_rule,
        rc.delete_rule
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage ccu
        ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
      LEFT JOIN information_schema.referential_constraints rc
        ON rc.constraint_name = tc.constraint_name AND rc.constraint_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
        AND tc.table_name = $1
      ORDER BY kcu.ordinal_position;
    `, [name])

    const incoming = await p.query(`
      SELECT
        tc.table_name AS table_name,
        kcu.column_name AS column_name,
        ccu.column_name AS foreign_column,
        tc.constraint_name,
        rc.update_rule,
        rc.delete_rule
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage ccu
        ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
      LEFT JOIN information_schema.referential_constraints rc
        ON rc.constraint_name = tc.constraint_name AND rc.constraint_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND ccu.table_schema = 'public'
        AND ccu.table_name = $1
      ORDER BY tc.table_name, kcu.ordinal_position;
    `, [name])

    res.json({
      success: true,
      table: name,
      outgoing: outgoing.rows.map(r => ({
        column: r.column_name,
        foreignTable: r.foreign_table,
        foreignColumn: r.foreign_column,
        constraintName: r.constraint_name,
        updateRule: r.update_rule,
        deleteRule: r.delete_rule,
      })),
      incoming: incoming.rows.map(r => ({
        table: r.table_name,
        column: r.column_name,
        foreignColumn: r.foreign_column,
        constraintName: r.constraint_name,
        updateRule: r.update_rule,
        deleteRule: r.delete_rule,
      })),
    })
  } catch (err) {
    res.status(400).json({ success: false, error: err.message })
  }
})

// Get rows with pagination
app.get("/api/tables/:name/rows", async (req, res) => {
  const p = getPool()
  if (!p) return res.status(400).json({ success: false, error: "Not connected" })
  const { name } = req.params
  const limit = Math.min(Number(req.query.limit ?? 100), 500)
  const offset = Number(req.query.offset ?? 0)

  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
    return res.status(400).json({ success: false, error: "Invalid table name" })
  }

  try {
    const result = await p.query(`SELECT * FROM public."${name}" LIMIT $1 OFFSET $2`, [limit, offset])
    const countRes = await p.query(`SELECT count(*)::int AS total FROM public."${name}"`)
    res.json({
      success: true,
      table: name,
      rows: result.rows,
      fields: result.fields?.map(f => ({ name: f.name, dataTypeID: f.dataTypeID })) ?? [],
      rowCount: result.rowCount,
      total: countRes.rows[0]?.total ?? result.rowCount,
      limit, offset,
    })
  } catch (err) {
    res.status(400).json({ success: false, error: err.message })
  }
})

app.get("/api/schema", async (req, res) => {
  const p = getPool()
  if (!p) return res.status(400).json({ success: false, error: "Not connected" })
  try {
    const tablesRes = await p.query(`
      SELECT
        c.relname AS name,
        c.relkind AS kind,
        n.nspname AS schema,
        pg_total_relation_size(c.oid) AS size_bytes,
        (SELECT count(*)::int FROM information_schema.columns WHERE table_name = c.relname AND table_schema = n.nspname) AS column_count
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relkind IN ('r','v','m')
      ORDER BY c.relname;
    `)
    const counts = await p.query(`SELECT relname, n_live_tup::int as estimate FROM pg_stat_user_tables WHERE schemaname='public';`)
    const countMap = Object.fromEntries(counts.rows.map(r => [r.relname, r.estimate]))

    const colsRes = await p.query(`
      SELECT table_name, column_name, data_type, udt_name, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema='public'
      ORDER BY table_name, ordinal_position;
    `)
    const columnsByTable = {}
    for (const r of colsRes.rows) {
      if (!columnsByTable[r.table_name]) columnsByTable[r.table_name] = []
      const isPK = false // will fill later
      columnsByTable[r.table_name].push({
        column: r.column_name,
        type: r.data_type === 'USER-DEFINED' ? r.udt_name : r.data_type,
        nullable: r.is_nullable === 'YES',
        default: r.column_default,
      })
    }
    // mark pks
    const pkRes = await p.query(`
      SELECT kcu.table_name, kcu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
      WHERE tc.constraint_type='PRIMARY KEY' AND tc.table_schema='public';
    `)
    const pkSet = new Set(pkRes.rows.map(r=> `${r.table_name}.${r.column_name}`))
    for (const t of Object.keys(columnsByTable)) {
      for (const c of columnsByTable[t]) {
        c.isPrimary = pkSet.has(`${t}.${c.column}`)
      }
    }

    const relRes = await p.query(`
      SELECT
        tc.table_name AS source_table,
        kcu.column_name AS source_column,
        ccu.table_name AS target_table,
        ccu.column_name AS target_column,
        tc.constraint_name,
        rc.update_rule,
        rc.delete_rule
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
      LEFT JOIN information_schema.referential_constraints rc ON rc.constraint_name = tc.constraint_name AND rc.constraint_schema = tc.table_schema
      WHERE tc.constraint_type='FOREIGN KEY' AND tc.table_schema='public' AND ccu.table_schema='public'
      ORDER BY tc.table_name;
    `)

    const tables = tablesRes.rows.map(r => ({
      name: r.name,
      schema: r.schema,
      type: r.kind === 'v' ? 'view' : r.kind === 'm' ? 'materialized' : 'table',
      sizeBytes: Number(r.size_bytes),
      columnCount: Number(r.column_count),
      estimatedRows: countMap[r.name] ?? 0,
      columns: columnsByTable[r.name] ?? [],
    }))

    const relations = relRes.rows.map(r => ({
      sourceTable: r.source_table,
      sourceColumn: r.source_column,
      targetTable: r.target_table,
      targetColumn: r.target_column,
      constraintName: r.constraint_name,
      updateRule: r.update_rule,
      deleteRule: r.delete_rule,
    }))

    res.json({ success: true, tables, relations })
  } catch (err) {
    res.status(400).json({ success: false, error: err.message })
  }
})

app.get("/api/health", (req, res) => res.json({ ok: true, connected: !!pool }))

// Serve frontend in production (unified server)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const distPath = path.join(__dirname, "../dist")
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath))
  // SPA fallback: serve index.html for any non-API route
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(distPath, "index.html"))
  })
  console.log(`[deck] serving frontend from ${distPath}`)
}

app.listen(PORT, () => {
  console.log(`[deck] pg backend listening on http://localhost:${PORT}`)
  console.log(`POST /api/connect {host,port,database,user,password}`)
  console.log(`POST /api/query {sql} — sequential multi-statement via single client, like psql`)
})
