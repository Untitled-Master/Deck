import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Search, Database } from "lucide-react"
import { useConnection } from "@/context/ConnectionContext"
import { api } from "@/lib/api"

export const TABLES_INVALIDATE_EVENT = "deck:tables:invalidate"
const cacheKey = (db) => `deck:tables:${db}`

function readCache(db) {
  try {
    const raw = localStorage.getItem(cacheKey(db))
    if (!raw) return []
    const j = JSON.parse(raw)
    return Array.isArray(j.tables) ? j.tables : []
  } catch { return [] }
}

export default function Sidebar({ selectedTable, onSelectTable, search, setSearch }) {
  const { connected, config } = useConnection()
  const dbName = config?.database || null
  const navigate = useNavigate()
  // lazy-init from per-db cache so first paint already has rows — no empty flash on page switches
  const [tables, setTables] = useState(() => (connected && dbName ? readCache(dbName) : []))
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState("")
  const [refreshKey, setRefreshKey] = useState(0)
  // refs so the fetch effect doesn't re-run on every parent render
  const selRef = useRef(selectedTable)
  selRef.current = selectedTable
  const selectRef = useRef(onSelectTable)
  selectRef.current = onSelectTable

  useEffect(() => {
    if (!connected || !dbName) {
      setTables([])
      setLoadError("")
      setLoading(false)
      return
    }
    // instant render from per-db cache (no-op if lazy init already populated), then refresh silently in background
    setTables(prev => (prev.length ? prev : readCache(dbName)))
    setLoadError("")
    let cancelled = false
    setLoading(refreshKey > 0)
    ;(async () => {
      try {
        const res = await api.tables()
        if (cancelled) return
        const mapped = (res.tables || []).map(t => ({ name: t.name, rows: t.estimatedRows, type: t.type }))
        setTables(mapped)
        try { localStorage.setItem(cacheKey(dbName), JSON.stringify({ at: Date.now(), tables: mapped })) } catch {}
        if (mapped.length && !mapped.find(x => x.name === selRef.current)) selectRef.current(mapped[0].name)
      } catch (e) {
        if (cancelled) return
        // keep stale cache visible; only surface the error when there's nothing to show
        if (!readCache(dbName).length) setLoadError(e.message || "Couldn't load tables")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    const onInvalidate = () => setRefreshKey(k => k + 1)
    window.addEventListener(TABLES_INVALIDATE_EVENT, onInvalidate)
    return () => {
      cancelled = true
      window.removeEventListener(TABLES_INVALIDATE_EVENT, onInvalidate)
    }
  }, [connected, dbName, refreshKey])

  const refresh = () => {
    if (!connected) return
    setRefreshKey(k => k + 1)
  }
  const filtered = tables.filter(t => t.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <aside className="w-[330px] shrink-0 bg-[#292824] border-r border-[#3B3A36] flex flex-col overflow-hidden">
      {/* Database pill */}
      <div className="p-[14px]">
        <button className="w-full h-10 flex items-center justify-between px-3 bg-[#292824] border border-[#4A4944] rounded-[7px] hover:bg-[#232220] transition-colors">
          <span className="flex items-center gap-2 text-[13px] font-medium text-[#F0EFEC]">
            <Database className="w-4 h-4 text-[#B7B5B0]" />
            {dbName ?? "Not connected"}
          </span>
          <span className="text-[#85837E] text-[12px]">⌄</span>
        </button>
      </div>

      <div className="px-3.5 pb-2">
        <div className="text-[13px] font-medium text-[#F0EFEC]">Tables</div>
        <div className="relative mt-2">
          <Search className="w-4 h-4 text-[#85837E] absolute left-2 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tables..."
            className="w-full h-8 pl-7 pr-2 bg-transparent border border-transparent focus:border-[#4A4944] focus:bg-[#232220] rounded-[6px] text-[13px] placeholder:text-[#85837E] text-[#F0EFEC] focus:outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2">
        <div className="space-y-0.5">
          {filtered.map(t => {
            const active = selectedTable === t.name
            return (
              <button
                key={t.name}
                onClick={() => onSelectTable(t.name)}
                className={`w-full flex items-center gap-2 px-2 h-8 rounded-[5px] text-left text-[13px] font-medium transition-colors ${active ? "bg-[#3B3935] text-[#F5F4F1]" : "text-[#B7B5B0] hover:bg-[#232220] hover:text-[#F0EFEC]"}`}
              >
                <span className="truncate flex-1">{t.name}</span>
              </button>
            )
          })}
          {!connected && <div className="text-[13px] text-[#85837E] px-2 py-3">Not connected — connect to browse tables.</div>}
          {connected && loading && !filtered.length && <div className="text-[13px] text-[#85837E] px-2 py-3">Loading…</div>}
          {connected && !loading && loadError && !filtered.length && <div className="text-[13px] text-[#EF4444] px-2 py-3">{loadError}</div>}
          {connected && !loading && !loadError && !filtered.length && <div className="text-[13px] text-[#85837E] px-2 py-3">{search ? `No tables match "${search}".` : "No tables in this database."}</div>}
        </div>
      </div>

      <div className="p-3 border-t border-[#3B3A36] flex items-center justify-between">
        <span className="text-[11px] text-[#85837E]">{loading ? "Loading…" : `${tables.length} tables`}</span>
        <button onClick={refresh} className="text-[11px] text-[#B7B5B0] hover:text-[#F0EFEC]">Refresh</button>
      </div>
    </aside>
  )
}
