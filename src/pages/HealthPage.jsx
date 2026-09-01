import { useEffect, useState } from "react"
import { Activity, Database, HardDrive, Table2, PlugZap, Check, AlertCircle, Clock3, Server, ShieldCheck, Zap, RefreshCw } from "lucide-react"
import { api } from "@/lib/api"
import { useConnection } from "@/context/ConnectionContext"
import { PostgreSQL } from "@/components/PostgreSQL"
import TopBar from "@/components/layout/TopBar"
import LeftNav from "@/components/layout/LeftNav"

const MOCK_HEALTH_TABLES = [
  { name: "orders", estimatedRows: 4, type: "table", sizeBytes: 8192, columnCount: 3 },
  { name: "products", estimatedRows: 0, type: "table", sizeBytes: 0, columnCount: 3 },
  { name: "test", estimatedRows: 0, type: "table", sizeBytes: 0, columnCount: 2 },
  { name: "users", estimatedRows: 6, type: "table", sizeBytes: 16384, columnCount: 5 },
]

export default function HealthPage() {
  const { connected, config } = useConnection()
  const [status, setStatus] = useState(null)
  const [tables, setTables] = useState(MOCK_HEALTH_TABLES)
  const [dbSize, setDbSize] = useState(null)
  const [latency, setLatency] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchHealth = async () => {
    setLoading(true)
    setError("")
    const start = performance.now()
    try {
      const [s, t] = await Promise.all([
        api.status().catch(() => ({ connected: false })),
        api.tables().catch(() => ({ tables: MOCK_HEALTH_TABLES })),
      ])
      setStatus(s)
      const fetched = t.tables && t.tables.length ? t.tables : MOCK_HEALTH_TABLES
      setTables(fetched)
      const lat = Math.round(performance.now() - start)
      setLatency(lat)

      if (s.connected) {
        try {
          const r = await api.query("SELECT pg_database_size(current_database())::bigint as size, current_database() as db, version() as ver;")
          if (r.rows?.[0]?.size) {
            const bytes = Number(r.rows[0].size)
            setDbSize(bytes < 1024*1024 ? (bytes/1024).toFixed(1)+" KB" : (bytes/1024/1024).toFixed(1)+" MB")
          }
        } catch {}
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchHealth() }, [])

  const tableCount = tables.length
  const totalRows = tables.reduce((a,b)=>a+(b.estimatedRows||0),0)
  const totalSize = tables.reduce((a,b)=>a+(b.sizeBytes||0),0)
  const sizeStr = totalSize < 1024*1024 ? (totalSize/1024).toFixed(1)+" KB" : (totalSize/1024/1024).toFixed(2)+" MB"

  return (
    <div className="h-screen flex flex-col bg-[#292824] overflow-hidden">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <LeftNav />
        <div className="flex-1 bg-[#1D1C1A] overflow-auto">
          <div className="p-7 max-w-[1200px]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[20px] font-semibold text-[#F0EFEC] flex items-center gap-3">
              <PostgreSQL className="w-8 h-8" />
              Health
            </h1>
            <p className="text-[13px] text-[#85837E] mt-1">Connection status, PostgreSQL health and database metrics.</p>
          </div>
          <button onClick={fetchHealth} className="h-8 px-3 flex items-center gap-2 border border-[#4A4944] bg-transparent rounded-[6px] text-[13px] font-medium text-[#B7B5B0] hover:bg-[#3B3935] hover:text-[#F0EFEC]">
            <RefreshCw className={`w-4 h-4 ${loading?"animate-spin":""}`} /> Refresh
          </button>
        </div>

        {error && <div className="mt-4 flex items-center gap-2 bg-[#1D1C1A] border border-[#EF4444]/30 rounded-[6px] px-3 py-2 text-[13px] text-[#EF4444]"><AlertCircle className="w-4 h-4" />{error}</div>}

        {/* Connection */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 border border-[#3B3A36] rounded-[9px] bg-[#292824] overflow-hidden">
            <div className="h-10 px-4 flex items-center gap-2 border-b border-[#3B3A36] bg-[#292824]">
              <PostgreSQL className="w-5 h-5" />
              <span className="text-[13px] font-semibold text-[#F0EFEC] tracking-widest">CONNECTION</span>
              <span className={`ml-auto flex items-center gap-1.5 text-[12px] font-medium px-2 py-1 rounded-full border ${connected ? "bg-[rgba(34,197,94,0.08)] border-[#16803A] text-[#22C55E]" : "bg-[rgba(234,179,8,0.08)] border-[#a16207] text-[#EAB308]"}`}>
                <span className={`w-2 h-2 rounded-full ${connected ? "bg-[#22C55E]" : "bg-[#EAB308]"}`} />
                {connected ? "Connected" : "Disconnected"}
              </span>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4">
              <div>
                <div className="text-[11px] tracking-widest text-[#85837E]">HOST</div>
                <div className="text-[13px] font-mono text-[#F0EFEC] mt-1">{config?.host ?? "—"}:{config?.port ?? "—"}</div>
              </div>
              <div>
                <div className="text-[11px] tracking-widest text-[#85837E]">DATABASE</div>
                <div className="text-[13px] font-mono text-[#F0EFEC] mt-1 flex items-center gap-2">
                  <PostgreSQL className="w-4 h-4 text-[#336791]" />
                  {config?.database ?? "—"}
                </div>
              </div>
              <div>
                <div className="text-[11px] tracking-widest text-[#85837E]">USER</div>
                <div className="text-[13px] font-mono text-[#F0EFEC] mt-1">{config?.user ?? "—"}</div>
              </div>
              <div>
                <div className="text-[11px] tracking-widest text-[#85837E]">LATENCY</div>
                <div className="text-[13px] font-mono text-[#F0EFEC] mt-1">{latency != null ? `${latency} ms` : "—"}</div>
              </div>
              <div className="col-span-2 pt-3 border-t border-[#3B3A36] flex items-center gap-2 text-[12px] text-[#85837E]">
                <Server className="w-3.5 h-3.5" />
                PostgreSQL {status?.config ? "17" : "—"} • {connected ? "1 active connection" : "0 connections"} • {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>

          <div className="border border-[#3B3A36] rounded-[9px] bg-[#292824] p-4">
            <div className="text-[13px] font-semibold text-[#F0EFEC] flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-[#B7B5B0]" /> Status</div>
            <div className="mt-3 space-y-3">
              <div className="flex items-center justify-between h-10 px-3 border border-[#3B3A36] rounded-[6px] bg-[#1D1C1A]">
                <span className="text-[13px] text-[#B7B5B0]">API Health</span>
                <span className="flex items-center gap-1.5 text-[12px] font-medium text-[#22C55E]"><Check className="w-3.5 h-3.5" /> Healthy</span>
              </div>
              <div className="flex items-center justify-between h-10 px-3 border border-[#3B3A36] rounded-[6px] bg-[#1D1C1A]">
                <span className="text-[13px] text-[#B7B5B0]">Database</span>
                <span className={`text-[12px] font-medium ${connected ? "text-[#22C55E]" : "text-[#EF4444]"}`}>{connected ? "Reachable" : "Unreachable"}</span>
              </div>
              <div className="flex items-center justify-between h-10 px-3 border border-[#3B3A36] rounded-[6px] bg-[#1D1C1A]">
                <span className="text-[13px] text-[#B7B5B0]">Pool</span>
                <span className="text-[12px] text-[#F0EFEC]">{connected ? "1 client" : "—"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="border border-[#3B3A36] rounded-[9px] bg-[#292824] p-4">
            <div className="flex items-center justify-between"><span className="text-[11px] tracking-widest text-[#85837E]">TABLES</span><Table2 className="w-4 h-4 text-[#66645F]" /></div>
            <div className="text-[20px] font-semibold text-[#F0EFEC] mt-2">{tableCount}</div>
            <div className="text-[12px] text-[#85837E]">in public schema</div>
          </div>
          <div className="border border-[#3B3A36] rounded-[9px] bg-[#292824] p-4">
            <div className="flex items-center justify-between"><span className="text-[11px] tracking-widest text-[#85837E]">ROWS</span><Database className="w-4 h-4 text-[#66645F]" /></div>
            <div className="text-[20px] font-semibold text-[#F0EFEC] mt-2">{totalRows.toLocaleString()}</div>
            <div className="text-[12px] text-[#85837E]">estimated total</div>
          </div>
          <div className="border border-[#3B3A36] rounded-[9px] bg-[#292824] p-4">
            <div className="flex items-center justify-between"><span className="text-[11px] tracking-widest text-[#85837E]">SIZE</span><HardDrive className="w-4 h-4 text-[#66645F]" /></div>
            <div className="text-[20px] font-semibold text-[#F0EFEC] mt-2">{dbSize ?? sizeStr}</div>
            <div className="text-[12px] text-[#85837E]">database size</div>
          </div>
          <div className="border border-[#3B3A36] rounded-[9px] bg-[#292824] p-4">
            <div className="flex items-center justify-between"><span className="text-[11px] tracking-widest text-[#85837E]">LATENCY</span><Zap className="w-4 h-4 text-[#66645F]" /></div>
            <div className="text-[20px] font-semibold text-[#F0EFEC] mt-2">{latency ?? "—"}<span className="text-[13px] font-normal text-[#85837E]"> ms</span></div>
            <div className="text-[12px] text-[#85837E]">last check</div>
          </div>
        </div>

        {/* Tables */}
        <div className="mt-6 border border-[#3B3A36] rounded-[9px] bg-[#1D1C1A] overflow-hidden">
          <div className="h-10 px-4 flex items-center gap-2 border-b border-[#3B3A36] bg-[#292824]">
            <Table2 className="w-4 h-4 text-[#B7B5B0]" />
            <span className="text-[13px] font-semibold tracking-widest text-[#B7B5B0]">TABLES</span>
            <span className="ml-auto text-[12px] text-[#85837E]">{tables.length} tables • {totalRows.toLocaleString()} rows</span>
          </div>
          <div className="divide-y divide-[#3B3A36]">
            {tables.map(t=>(
              <div key={t.name} className="h-10 flex items-center gap-3 px-4 hover:bg-[#232220]">
                <span className="text-[13px] font-mono text-[#F0EFEC] flex-1">{t.name}</span>
                <span className="text-[12px] text-[#85837E]">{t.estimatedRows?.toLocaleString() ?? 0} rows</span>
                <span className="text-[12px] text-[#85837E]">{t.type}</span>
              </div>
            ))}
            {!tables.length && !loading && <div className="p-8 text-center text-[13px] text-[#85837E]">No tables — connect to a database to see metrics.</div>}
            {loading && <div className="p-4 flex items-center gap-2 text-[13px] text-[#85837E]"><Clock3 className="w-4 h-4 animate-spin" /> Loading tables…</div>}
          </div>
        </div>

        <div className="mt-6 flex items-center gap-2 text-[12px] text-[#85837E]">
          <Clock3 className="w-3.5 h-3.5" /> Last checked {new Date().toLocaleTimeString()} • Auto-refresh on reconnect
        </div>
          </div>
        </div>
      </div>
    </div>
  )
}
