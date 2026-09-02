import { useState, useEffect } from "react"
import TopBar from "@/components/layout/TopBar"
import LeftNav from "@/components/layout/LeftNav"
import Sidebar from "@/components/layout/Sidebar"
import SqlEditor from "@/components/editor/SqlEditor"
import DataGrid from "@/components/tables/DataGrid"
import { useConnection } from "@/context/ConnectionContext"
import { useTranslation } from "@/context/I18nContext"
import { api } from "@/lib/api"
import { X, Plus, AlertTriangle } from "lucide-react"
import { FAKE_ROWS, getMockRowsForTable } from "@/lib/fakeData"

const LS_TABS = "deck:sql:tabs"
const LS_ACTIVE = "deck:sql:active"

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

function loadTabs() {
  try {
    const raw = localStorage.getItem(LS_TABS)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length) return parsed
    }
  } catch {}
  return [
    { id: "q1", title: "Query 1", sql: "-- Deck SQL Editor — PostgreSQL\n-- Run multiple statements sequentially like psql\nSELECT * FROM favorites LIMIT 100;" },
    { id: "q2", title: "Query 2", sql: "SELECT * FROM users LIMIT 100;" },
  ]
}

function loadActive(tabs) {
  try {
    const v = localStorage.getItem(LS_ACTIVE)
    if (v && tabs.find(t=> t.id===v)) return v
  } catch {}
  return tabs[0]?.id || "q1"
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

function getConfirmEnabled(){
  try{const raw=localStorage.getItem('deck:settings');if(!raw) return true;const j=JSON.parse(raw);return j?.editor?.confirmDestructive??true;}catch{return true}
}
function isDestructiveSql(sql){
  try{
    const stmts=splitMockStatements(sql);
    const pat=/\b(delete\s+from|drop\s+(table|database|schema|view|index|sequence)|truncate(\s+table)?|alter\s+table\s+.*\s+drop)\b/i;
    return stmts.some(s=>pat.test(s));
  }catch{return /\b(delete|drop|truncate)\b/i.test(sql)}
}
function mockResultForStatement(stmt) {
  const q = stmt.toLowerCase()
  if (q.startsWith("insert")) return { command: "INSERT", rowCount: 1, rows: [], fields: [], duration: 12, sql: stmt }
  if (q.startsWith("update")) return { command: "UPDATE", rowCount: 1, rows: [], fields: [], duration: 8, sql: stmt }
  if (q.startsWith("delete")) return { command: "DELETE", rowCount: 1, rows: [], fields: [], duration: 8, sql: stmt }
  if (q.startsWith("create")) return { command: "CREATE", rowCount: 0, rows: [], fields: [], duration: 15, sql: stmt }
  const tables = ["favorites", "users", "orders", "products", "watchHistory", "watch_history", "watchlists", "test"]
  for (const tbl of tables) {
    if (q.includes(tbl)) {
      const key = tbl === "watch_history" ? "watchHistory" : tbl
      const rows = getMockRowsForTable(key).slice(0, 6)
      const limitMatch = q.match(/limit\s+(\d+)/)
      const lim = limitMatch ? Math.min(parseInt(limitMatch[1], 10), rows.length) : rows.length
      const sliced = rows.slice(0, lim)
      return { command: "SELECT", rowCount: sliced.length, rows: sliced, fields: [], duration: 14, sql: stmt }
    }
  }
  return { command: "SELECT", rowCount: 2, rows: FAKE_ROWS.users.slice(0, 2), fields: [], duration: 10, sql: stmt }
}

export default function SqlPage() {
  const { t } = useTranslation()
  const { connected } = useConnection()
  const [selectedTable, setSelectedTable] = useState("favorites")
  const [search, setSearch] = useState("")
  const [tabs, setTabs] = useState(()=> loadTabs())
  const [activeId, setActiveId] = useState(()=> loadActive(loadTabs()))
  const [resultsMap, setResultsMap] = useState({}) // id -> {results, totalDuration, queryError, lastRun}
  const [runningId, setRunningId] = useState(null)
  const [closeTarget, setCloseTarget] = useState(null) // tab to close
  const [confirmOpen, setConfirmOpen] = useState(false)

  // persist tabs
  useEffect(()=>{ try{ localStorage.setItem(LS_TABS, JSON.stringify(tabs)) }catch{} }, [tabs])
  useEffect(()=>{ try{ localStorage.setItem(LS_ACTIVE, activeId) }catch{} }, [activeId])

  const activeTab = tabs.find(t=> t.id===activeId) || tabs[0]
  const activeResult = resultsMap[activeId]

  const updateTabSql = (id, sql) => {
    setTabs(ts=> ts.map(t=> t.id===id ? { ...t, sql } : t))
  }

  const addTab = () => {
    const n = tabs.length + 1
    const newTab = { id: uid(), title: `Query ${n}`, sql: `SELECT * FROM ${selectedTable} LIMIT 100;` }
    setTabs(ts=> [...ts, newTab])
    setActiveId(newTab.id)
  }

  const requestClose = (tab) => {
    setCloseTarget(tab)
  }

  const confirmClose = () => {
    if (!closeTarget) return
    const id = closeTarget.id
    setTabs(ts=>{
      const next = ts.filter(t=> t.id!==id)
      if (next.length===0) {
        const fallback = { id: uid(), title: "Query 1", sql: "SELECT * FROM favorites LIMIT 100;" }
        setActiveId(fallback.id)
        return [fallback]
      }
      if (activeId===id) {
        const idx = ts.findIndex(t=> t.id===id)
        const nextActive = next[Math.max(0, idx-1)]?.id || next[0].id
        setActiveId(nextActive)
      }
      return next
    })
    setResultsMap(m=>{ const n={...m}; delete n[id]; return n })
    // remove from localStorage is handled by useEffect on tabs
    setCloseTarget(null)
  }

  const executeRun = async () => {
    if (!activeTab) return
    const query = activeTab.sql
    setRunningId(activeTab.id)
    // clear previous error for this tab
    setResultsMap(m=> ({ ...m, [activeTab.id]: { ...m[activeTab.id], queryError: "" } }))
    if (connected) {
      try {
        const res = await api.query(query)
        const arr = res.results ?? (res.rows ? [{ ...res, sql: query }] : [])
        setResultsMap(m=> ({ ...m, [activeTab.id]: { results: arr, totalDuration: res.duration ?? arr.reduce((a,b)=>a+(b.duration||0),0), lastRun: new Date().toLocaleTimeString(), queryError: "" } }))
      } catch (err) {
        const arr = err.data?.results || []
        const msg = (err.message||"Query failed") + (err.data?.failedSql ? ` — failed at: ${err.data.failedSql.slice(0,100)}` : "")
        setResultsMap(m=> ({ ...m, [activeTab.id]: { results: arr.length ? arr : null, totalDuration: err.data?.duration ?? 0, lastRun: new Date().toLocaleTimeString(), queryError: msg } }))
      } finally {
        setRunningId(null)
      }
      return
    }
    const stmts = splitMockStatements(query)
    await new Promise(r=>setTimeout(r,300))
    const mocked = stmts.map(s=>mockResultForStatement(s))
    setResultsMap(m=> ({ ...m, [activeTab.id]: { results: mocked, totalDuration: mocked.reduce((a,b)=>a+b.duration,0), lastRun: new Date().toLocaleTimeString(), queryError: "" } }))
    setRunningId(null)
  }

  const handleRun = async () => {
    if (!activeTab) return
    if (getConfirmEnabled() && isDestructiveSql(activeTab.sql)){
      setConfirmOpen(true)
      return
    }
    await executeRun()
  }

  const handleConfirmRun = async () => {
    setConfirmOpen(false)
    await executeRun()
  }

  const hasResults = activeResult?.results && activeResult.results.length>0

  return (
    <div className="h-screen flex flex-col bg-[#292824] overflow-hidden">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <LeftNav />
        <Sidebar selectedTable={selectedTable} onSelectTable={setSelectedTable} search={search} setSearch={setSearch} />
        <div className="flex-1 flex flex-col bg-[#1D1C1A] overflow-hidden">
          <div className="h-[38px] flex items-center gap-0 border-b border-[#3B3A36] bg-[#1D1C1A] px-2">
            <div className="flex items-center gap-1 overflow-auto">
              {tabs.map(tab => {
                const active = tab.id===activeId
                return (
                  <div key={tab.id} className={`group flex items-center gap-1.5 h-[32px] px-3 rounded-[6px] border text-[13px] font-medium shrink-0 ${active ? "bg-[#292824] border-[#3B3A36] text-[#F0EFEC]" : "bg-transparent border-transparent text-[#85837E] hover:bg-[#292824] hover:border-[#3B3A36] hover:text-[#B7B5B0]"}`}>
                    <button onClick={()=> setActiveId(tab.id)} className="flex items-center gap-1.5">
                      {tab.title}
                    </button>
                    <button onClick={()=> requestClose(tab)} className={`w-5 h-5 flex items-center justify-center rounded-[4px] hover:bg-[#3B3A36] ${active ? "text-[#B7B5B0] hover:text-[#F0EFEC]" : "text-[#66645F] hover:text-[#B7B5B0]"}`}>
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )
              })}
              <button onClick={addTab} className="w-8 h-8 flex items-center justify-center border border-transparent hover:bg-[#292824] hover:border-[#3B3A36] rounded-[6px] text-[#85837E] hover:text-[#F0EFEC] shrink-0">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <span className="ml-auto hidden md:inline text-[11px] text-[#85837E]">PostgreSQL • {selectedTable} • {tabs.length} tabs</span>
          </div>
          <div className="flex-1 p-4 bg-[#1D1C1A] space-y-4 overflow-auto">
            {activeTab && (
              <SqlEditor query={activeTab.sql} setQuery={(sql)=> updateTabSql(activeTab.id, sql)} onRun={handleRun} isRunning={runningId===activeTab.id} />
            )}
            {activeResult?.queryError && <div className="bg-[#2a1a1a] border border-[#5a2222] rounded-[8px] px-3 py-2 text-[12px] font-mono text-[#fca5a5] break-all">ERROR: {activeResult.queryError}</div>}
            {hasResults ? (
              <div className="space-y-3">
                {activeResult.results.map((r,idx)=>(
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center gap-2 text-[11px] font-mono px-1 text-[#85837E]"><span className="truncate max-w-[420px]">{r.sql.slice(0,80).replace(/\n/g," ")}</span><span className="ml-auto text-white">{r.command} {r.command==="INSERT"?`0 ${r.rowCount}`:r.rowCount}</span><span>• {r.duration}ms</span></div>
                    {r.command==="SELECT"||(r.rows&&r.rows.length>0) ? <><div className="flex items-center gap-2 text-[11px] text-[#85837E] px-1"><span className="w-2 h-2 rounded-full bg-white"/>{r.rowCount} rows • {r.duration}ms • {activeResult.lastRun}</div><DataGrid table={selectedTable} queryResult={r} /></> : <div className="bg-[#1D1C1A] border border-[#3B3A36] rounded-[8px] px-3 py-2 text-[12px] font-mono text-[#B7B5B0]">{r.command} {r.command==="INSERT"?`0 ${r.rowCount}`:r.rowCount} • {r.duration}ms</div>}
                  </div>
                ))}
                <div className="text-[11px] text-[#85837E] px-1">{activeResult.results.length} statements • total {activeResult.totalDuration}ms • {activeResult.lastRun}</div>
              </div>
            ) : !activeResult?.queryError ? <div className="border border-dashed border-[#3B3A36] bg-[#1D1C1A] p-6 text-center rounded-[8px]"><p className="text-[13px] text-[#85837E]">Run statements to see results here — like psql.</p><p className="text-[12px] font-mono text-[#85837E] mt-2 bg-[#292824] border border-[#3B3A36] rounded-[6px] px-3 py-2 inline-block text-left">SELECT * FROM favorites LIMIT 100;</p></div> : null}
          </div>
        </div>
      </div>

      {/* Destructive confirm */}
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
              <pre className="mt-4 p-3 bg-[#1D1C1A] border border-[#3B3A36] rounded-[6px] text-[12px] font-mono text-[#D6D4CF] whitespace-pre-wrap break-all max-h-[140px] overflow-auto">{activeTab?.sql?.slice(0,600)}</pre>
              <div className="mt-3 flex items-center gap-2 text-[11px] text-[#85837E]">{t("destructive.tip")}</div>
            </div>
            <div className="px-5 py-3 bg-[#1D1C1A] border-t border-[#3B3A36] flex items-center justify-end gap-2">
              <button onClick={() => setConfirmOpen(false)} className="h-8 px-4 border border-[#4A4944] bg-transparent rounded-[6px] text-[13px] font-medium text-[#B7B5B0] hover:bg-[#3B3935] hover:text-[#F0EFEC]">{t("destructive.cancel")}</button>
              <button onClick={handleConfirmRun} className="h-8 px-4 bg-[#EF4444] hover:bg-[#dc2626] text-white rounded-[6px] text-[13px] font-medium">{t("destructive.runAnyway")}</button>
            </div>
          </div>
        </div>
      )}

      {/* Close dialog */}
      {closeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={()=> setCloseTarget(null)} />
          <div className="relative w-full max-w-[420px] bg-[#292824] border border-[#3B3A36] rounded-[9px] overflow-hidden">
            <div className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#7f1d1d] flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-[14px] font-semibold text-[#F0EFEC]">Close {closeTarget.title}?</div>
                  <div className="text-[13px] text-[#B7B5B0]">This will delete the saved tab from local storage.</div>
                </div>
              </div>
              <div className="mt-3 p-3 bg-[#1D1C1A] border border-[#3B3A36] rounded-[6px]">
                <div className="text-[11px] tracking-widest text-[#85837E]">SQL PREVIEW</div>
                <pre className="mt-1 text-[12px] font-mono text-[#B7B5B0] whitespace-pre-wrap break-all max-h-[120px] overflow-auto">{closeTarget.sql.slice(0,300)}</pre>
              </div>
            </div>
            <div className="px-5 py-3 bg-[#1D1C1A] border-t border-[#3B3A36] flex items-center justify-end gap-2">
              <button onClick={()=> setCloseTarget(null)} className="h-8 px-4 border border-[#4A4944] bg-transparent rounded-[6px] text-[13px] font-medium text-[#B7B5B0] hover:bg-[#3B3935]">Cancel</button>
              <button onClick={confirmClose} className="h-8 px-4 bg-[#EF4444] text-white rounded-[6px] text-[13px] font-medium hover:bg-[#dc2626]">Close tab</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
