const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001"
const LOG_KEY = "deck:api:logs"
const MAX_LOGS = 100

function getLogs() {
  try {
    const raw = sessionStorage.getItem(LOG_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function addLog(entry) {
  try {
    const logs = getLogs()
    logs.unshift(entry)
    if (logs.length > MAX_LOGS) logs.length = MAX_LOGS
    sessionStorage.setItem(LOG_KEY, JSON.stringify(logs))
    window.dispatchEvent(new Event("deck:logs:update"))
  } catch {}
}

function truncate(str, n = 800) {
  if (!str) return str
  const s = typeof str === "string" ? str : JSON.stringify(str)
  return s.length > n ? s.slice(0, n) + "…" : s
}

async function request(path, opts = {}) {
  const method = (opts.method || "GET").toUpperCase()
  const start = performance.now()
  const timestamp = new Date().toISOString()
  let res, data, error
  try {
    res = await fetch(`${BASE}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...opts,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    })
    data = await res.json().catch(() => ({}))
    if (!res.ok) {
      const err = new Error(data.error || `Request failed: ${res.status}`)
      err.data = data
      err.status = res.status
      throw err
    }
    return data
  } catch (e) {
    error = e.message
    throw e
  } finally {
    const duration = Math.round(performance.now() - start)
    const status = res ? res.status : (error ? 0 : 200)
    addLog({
      id: `${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
      timestamp,
      method,
      path,
      status,
      ok: res ? res.ok : false,
      duration,
      requestBody: truncate(opts.body),
      responseBody: truncate(data),
      error: error || null,
    })
  }
}

export const api = {
  connect: (config) => request("/api/connect", { method: "POST", body: config }),
  disconnect: () => request("/api/disconnect", { method: "POST" }),
  status: () => request("/api/status"),
  query: (sql, params) => request("/api/query", { method: "POST", body: { sql, params } }),
  tables: () => request("/api/tables"),
  columns: (name) => request(`/api/tables/${name}/columns`),
  relations: (name) => request(`/api/tables/${name}/relations`),
  schema: () => request("/api/schema"),
  rows: (name, { limit = 100, offset = 0 } = {}) => request(`/api/tables/${name}/rows?limit=${limit}&offset=${offset}`),
  health: () => request("/api/health"),
  getLogs,
  clearLogs: () => { try { sessionStorage.removeItem(LOG_KEY); window.dispatchEvent(new Event("deck:logs:update")) } catch {} },
}

export const API_BASE = BASE
