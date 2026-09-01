import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import TopBar from "@/components/layout/TopBar"
import LeftNav from "@/components/layout/LeftNav"
import Sidebar from "@/components/layout/Sidebar"
import SqlEditor from "@/components/editor/SqlEditor"
import DataGrid from "@/components/tables/DataGrid"
import StructureView from "@/components/tables/StructureView"
import RelationsView from "@/components/tables/RelationsView"
import TabBar from "@/components/layout/TabBar"
import Header from "@/components/layout/Header"
import { useConnection } from "@/context/ConnectionContext"
import { useTranslation } from "@/context/I18nContext"
import { Braces, AlertTriangle } from "lucide-react"
import { api } from "@/lib/api"

function getConfirmEnabled() {
  try {
    const raw = localStorage.getItem("deck:settings")
    if (!raw) return true
    const j = JSON.parse(raw)
    return j?.editor?.confirmDestructive ?? true
  } catch { return true }
}

function isDestructiveSql(sql) {
  try {
    const stmts = splitMockStatements(sql)
    const pat = /\b(delete\s+from|drop\s+(table|database|schema|view|index|sequence)|truncate(\s+table)?|alter\s+table\s+.*\s+drop)\b/i
    return stmts.some(s => pat.test(s))
  } catch { return /\b(delete|drop|truncate)\b/i.test(sql) }
}

const LS_TABLE_KEY = "deck:selectedTable"
const LS_TAB_KEY = "deck:activeTab"
const VALID_TABS = ["data", "structure", "relations"]

function getStoredTable(fallback = "favorites") {
  try {
    const v = localStorage.getItem(LS_TABLE_KEY)
    return v || fallback
  } catch {
    return fallback
  }
}

function getStoredTab(fallback = "data") {
  try {
    const v = localStorage.getItem(LS_TAB_KEY)
    return VALID_TABS.includes(v) ? v : fallback
  } catch {
    return fallback
  }
}

function getDefaultLimit() {
  try {
    const raw = localStorage.getItem("deck:settings")
    if (raw) {
      const j = JSON.parse(raw)
      const n = j?.editor?.defaultLimit
      if (typeof n === "number" && n > 0) return n
    }
  } catch {}
  return 100
}

function splitMockStatements(sql) {
  const out = []
  let cur = ""
  let inSingle = false
  let inDouble = false
  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i]
    const next = sql[i + 1]
    if (ch === "'" && !inDouble) {
      if (inSingle && next === "'") { cur += "''"; i++; continue }
      inSingle = !inSingle
    } else if (ch === '"' && !inSingle) {
      if (inDouble && next === '"') { cur += '""'; i++; continue }
      inDouble = !inDouble
    }
    if (ch === ";" && !inSingle && !inDouble) {
      if (cur.trim()) out.push(cur.trim())
      cur = ""
    } else cur += ch
  }
  if (cur.trim()) out.push(cur.trim())
  return out.filter(s => s.replace(/--.*$/gm,"").replace(/\/\*[\s\S]*?\*\//g,"").trim())
}

function mockResultForStatement(stmt) {
  const q = stmt.toLowerCase()
  if (q.startsWith("insert")) return { command: "INSERT", rowCount: 1, rows: [], fields: [], duration: 12, sql: stmt }
  if (q.startsWith("update")) return { command: "UPDATE", rowCount: 1, rows: [], fields: [], duration: 8, sql: stmt }
  if (q.startsWith("delete")) return { command: "DELETE", rowCount: 1, rows: [], fields: [], duration: 8, sql: stmt }
  if (q.startsWith("create")) return { command: "CREATE", rowCount: 0, rows: [], fields: [], duration: 15, sql: stmt }
  if (q.includes("posts")) return { command: "SELECT", rowCount: 2, rows: [{ id: 101, title: "Hello Postgres", author_id: 1, status: "published", views: 1230 }], fields: [], duration: 18, sql: stmt }
  return { command: "SELECT", rowCount: 2, rows: [{ id: 1, name: "Alice" }], fields: [], duration: 10, sql: stmt }
}

export default function EditorPage() {
  const { t } = useTranslation()
  const nav = useNavigate()
  const { connected } = useConnection()
  const [selectedTable, setSelectedTable] = useState(() => getStoredTable("favorites"))
  const [activeTab, setActiveTab] = useState(() => getStoredTab("data"))
  const [search, setSearch] = useState("")
  const [refreshKey, setRefreshKey] = useState(0)
  const [query, setQuery] = useState(() => {
    const t = getStoredTable("favorites")
    const lim = getDefaultLimit()
    return `-- Deck SQL Editor — PostgreSQL\nINSERT INTO users VALUES (122, 'Ahmed', 100);\nSELECT * FROM ${t} LIMIT ${lim};`
  })
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState(null)
  const [totalDuration, setTotalDuration] = useState(0)
  const [queryError, setQueryError] = useState("")
  const [lastRun, setLastRun] = useState(null)
  const [addKey, setAddKey] = useState(0)
  const [confirmOpen, setConfirmOpen] = useState(false)

  // Persist latest table + tab so refresh / navigation restores them
  useEffect(() => {
    try { localStorage.setItem(LS_TABLE_KEY, selectedTable) } catch {}
  }, [selectedTable])

  useEffect(() => {
    try { localStorage.setItem(LS_TAB_KEY, activeTab) } catch {}
  }, [activeTab])

  // History: keep recent table/tab for History page
  useEffect(() => {
    try {
      const key = "deck:history"
      const raw = localStorage.getItem(key)
      let arr = raw ? JSON.parse(raw) : []
      arr.unshift({ table: selectedTable, tab: activeTab, at: new Date().toISOString(), action: "opened" })
      arr = arr.filter((it, i, a) => i === 0 || !(a[i - 1].table === it.table && a[i - 1].tab === it.tab))
      arr = arr.slice(0, 50)
      localStorage.setItem(key, JSON.stringify(arr))
    } catch {}
  }, [selectedTable, activeTab])

  const handleSelectTable = (name) => {
    setSelectedTable(name)
    const lim = getDefaultLimit()
    setQuery(`SELECT * FROM ${name} LIMIT ${lim};`)
    setResults(null)
    setQueryError("")
  }
  const handleRefresh = () => { setRefreshKey(k=>k+1); setResults(null); setQueryError("") }
  const executeRun = async () => {
    setIsRunning(true); setQueryError("")
    if (connected) {
      try {
        const res = await api.query(query)
        const arr = res.results ?? (res.rows ? [{ ...res, sql: query }] : [])
        setResults(arr); setTotalDuration(res.duration ?? arr.reduce((a,b)=>a+(b.duration||0),0)); setLastRun(new Date().toLocaleTimeString())
      } catch (err) {
        if (err.data?.results?.length) { setResults(err.data.results); setTotalDuration(err.data.duration ?? 0) } else setResults(null)
        setQueryError((err.message||"Query failed") + (err.data?.failedSql ? ` — failed at: ${err.data.failedSql.slice(0,100)}` : ""))
        setLastRun(new Date().toLocaleTimeString())
      } finally { setIsRunning(false) }
      return
    }
    const stmts = splitMockStatements(query)
    await new Promise(r=>setTimeout(r,300))
    const mocked = stmts.map(s=>mockResultForStatement(s))
    setResults(mocked); setTotalDuration(mocked.reduce((a,b)=>a+b.duration,0)); setLastRun(new Date().toLocaleTimeString()); setIsRunning(false)
  }

  const handleRun = async () => {
    if (getConfirmEnabled() && isDestructiveSql(query)) {
      setConfirmOpen(true)
      return
    }
    await executeRun()
  }

  const handleConfirmRun = async () => {
    setConfirmOpen(false)
    await executeRun()
  }

  const hasResults = Array.isArray(results) && results.length>0

  return (
    <div className="h-screen flex flex-col bg-[#292824] overflow-hidden">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <LeftNav />
        <Sidebar selectedTable={selectedTable} onSelectTable={handleSelectTable} search={search} setSearch={setSearch} />

        {/* Main workspace per spec: #1D1C1A padding 28 */}
        <div className="flex-1 flex flex-col bg-[#1D1C1A] overflow-hidden">
          {activeTab === "data" ? (
            <div className="flex-1 flex flex-col p-7 overflow-hidden">
              {/* Page header */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-[18px] font-semibold text-[#F0EFEC]">{selectedTable}</span>
                <div className="flex items-center gap-2">
                  <button onClick={()=> setAddKey(k=>k+1)} className="h-10 px-4 bg-[#292824] border border-[#4A4944] rounded-[7px] text-[13px] font-medium text-[#F0EFEC] hover:bg-[#3B3935] flex items-center gap-1.5">
                    <span className="text-[14px]">+</span> Add
                  </button>
                  <button className="w-10 h-10 bg-[#292824] border border-[#4A4944] rounded-[7px] flex items-center justify-center text-[#B7B5B0] hover:bg-[#3B3935] hover:text-[#F0EFEC]">
                    <span className="text-[16px]">⋮</span>
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-auto">
                <DataGrid key={`data-${refreshKey}-${selectedTable}`} table={selectedTable} refreshKey={refreshKey} addTrigger={addKey} />
              </div>
              <button onClick={()=> nav("/sql")} className="fixed bottom-6 right-6 h-10 px-4 bg-[#292824] border border-[#3B3A36] rounded-[8px] flex items-center gap-2 text-[#F0EFEC] hover:bg-[#3B3935] shadow-[0_4px_12px_rgba(0,0,0,0.4)]">
                <Braces className="w-4 h-4" /> SQL Editor
              </button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden bg-[#1D1C1A]">
              <Header selectedTable={selectedTable} activeTab={activeTab} onRefresh={handleRefresh} onRun={handleRun} isRunning={isRunning} />
              <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />
              <main className="flex-1 p-7 bg-[#1D1C1A] space-y-4 overflow-auto">
                {activeTab === "structure" && <StructureView table={selectedTable} />}
                {activeTab === "sql" && (
                  <div className="space-y-3">
                    <SqlEditor query={query} setQuery={setQuery} onRun={handleRun} isRunning={isRunning} />
                    {queryError && <div className="bg-[#2a1a1a] border border-[#5a2222] rounded-[8px] px-3 py-2 text-[12px] font-mono text-[#fca5a5] break-all">ERROR: {queryError}</div>}
                    {hasResults ? (
                      <div className="space-y-3">
                        {results.map((r,idx)=>(
                          <div key={idx} className="space-y-2">
                            <div className="flex items-center gap-2 text-[11px] font-mono px-1 text-[#85837E]"><span className="truncate max-w-[420px]">{r.sql.slice(0,80).replace(/\n/g," ")}</span><span className="ml-auto text-white">{r.command} {r.command==="INSERT"?`0 ${r.rowCount}`:r.rowCount}</span><span>• {r.duration}ms</span></div>
                            {r.command==="SELECT"||(r.rows&&r.rows.length>0) ? <><div className="flex items-center gap-2 text-[11px] text-[#85837E] px-1"><span className="w-2 h-2 rounded-full bg-white"/>{r.rowCount} rows • {r.duration}ms</div><DataGrid table={selectedTable} queryResult={r} /></> : <div className="bg-[#1D1C1A] border border-[#3B3A36] rounded-[8px] px-3 py-2 text-[12px] font-mono text-[#B7B5B0]">{r.command} {r.command==="INSERT"?`0 ${r.rowCount}`:r.rowCount} • {r.duration}ms</div>}
                          </div>
                        ))}
                        <div className="text-[11px] text-[#85837E] px-1">{results.length} statements • total {totalDuration}ms • {lastRun}</div>
                      </div>
                    ) : !queryError ? <div className="border border-dashed border-[#3B3A36] bg-[#1D1C1A] p-6 text-center rounded-[8px]"><p className="text-[13px] text-[#85837E]">Run statements to see results here — like psql.</p></div> : null}
                  </div>
                )}
                {activeTab === "relations" && <RelationsView table={selectedTable} onSelectTable={handleSelectTable} />}
              </main>
              <footer className="h-7 border-t border-[#3B3A36] bg-[#1D1C1A] flex items-center justify-between px-3 text-[11px] text-[#85837E]"><span>TABLE: {selectedTable.toUpperCase()} • {activeTab.toUpperCase()} {connected?"• LIVE":"• MOCK"}</span><span className="hidden md:inline">DECK • pg@8.23.0</span></footer>
            </div>
          )}
        </div>
      </div>
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" onClick={() => setConfirmOpen(false)} />
          <div className="relative w-full max-w-[480px] bg-[#292824] border border-[#3B3A36] rounded-[10px] overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
            <div className="p-5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-[#7f1d1d] flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-[14px] font-semibold text-[#F0EFEC]">{t("destructive.title")}</div>
                  <div className="text-[13px] text-[#B7B5B0] mt-1 leading-relaxed">{t("destructive.desc")} <span className="font-mono text-[#fca5a5]">{t("destructive.deleteDropTruncate")}</span> {t("destructive.permanently")}</div>
                </div>
              </div>
              <pre className="mt-4 p-3 bg-[#1D1C1A] border border-[#3B3A36] rounded-[6px] text-[12px] font-mono text-[#D6D4CF] whitespace-pre-wrap break-all max-h-[140px] overflow-auto">{query.slice(0, 600)}</pre>
              <div className="mt-3 flex items-center gap-2 text-[11px] text-[#85837E]">{t("destructive.tip")}</div>
            </div>
            <div className="px-5 py-3 bg-[#1D1C1A] border-t border-[#3B3A36] flex items-center justify-end gap-2">
              <button onClick={() => setConfirmOpen(false)} className="h-8 px-4 border border-[#4A4944] bg-transparent rounded-[6px] text-[13px] font-medium text-[#B7B5B0] hover:bg-[#3B3935] hover:text-[#F0EFEC]">{t("destructive.cancel")}</button>
              <button onClick={handleConfirmRun} className="h-8 px-4 bg-[#EF4444] hover:bg-[#dc2626] text-white rounded-[6px] text-[13px] font-medium">{t("destructive.runAnyway")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
