import { useEffect, useState } from "react"
import { Clock3, Trash2, RefreshCw, Search, List, ChevronDown, ChevronUp } from "lucide-react"
import { api } from "@/lib/api"
import TopBar from "@/components/layout/TopBar"
import LeftNav from "@/components/layout/LeftNav"

export default function LogsPage() {
  const [logs, setLogs] = useState(()=> api.getLogs())
  const [filter, setFilter] = useState("")
  const [expanded, setExpanded] = useState(null)

  const refresh = () => setLogs(api.getLogs())
  const clear = () => { api.clearLogs(); setLogs([]); setExpanded(null) }

  useEffect(()=>{
    refresh()
    const onUpdate = ()=> refresh()
    window.addEventListener("deck:logs:update", onUpdate)
    const onStorage = (e)=>{ if(e.key==="deck:api:logs") refresh() }
    window.addEventListener("storage", onStorage)
    // poll as fallback
    const id = setInterval(refresh, 1000)
    return ()=>{ window.removeEventListener("deck:logs:update", onUpdate); window.removeEventListener("storage", onStorage); clearInterval(id) }
  },[])

  const filtered = logs.filter(l=>{
    if(!filter) return true
    const q = filter.toLowerCase()
    return l.method.toLowerCase().includes(q) || l.path.toLowerCase().includes(q) || String(l.status).includes(q) || (l.error||"").toLowerCase().includes(q)
  })

  return (
    <div className="h-screen flex flex-col bg-[#292824] overflow-hidden">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <LeftNav />
        <div className="flex-1 bg-[#1D1C1A] overflow-auto">
          <div className="p-7 max-w-[1200px]">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-[20px] font-semibold text-[#F0EFEC] flex items-center gap-2">
                  <List className="w-5 h-5 text-[#B7B5B0]" />
                  Logs
                </h1>
                <p className="text-[13px] text-[#85837E] mt-1">Latest API requests — stored in <span className="font-mono text-[#B7B5B0]">sessionStorage</span> (per tab, max 100).</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={refresh} className="h-8 px-3 flex items-center gap-1.5 border border-[#4A4944] bg-transparent rounded-[6px] text-[13px] font-medium text-[#B7B5B0] hover:bg-[#3B3935] hover:text-[#F0EFEC]">
                  <RefreshCw className="w-4 h-4" /> Refresh
                </button>
                <button onClick={clear} className="h-8 px-3 flex items-center gap-1.5 border border-[#3B3A36] bg-[#292824] rounded-[6px] text-[13px] font-medium text-[#EF4444] hover:bg-[#3B3935]">
                  <Trash2 className="w-4 h-4" /> Clear
                </button>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <div className="relative flex-1 max-w-[360px]">
                <Search className="w-4 h-4 text-[#85837E] absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Filter method, path, status…" className="w-full h-8 pl-8 pr-3 bg-[#1D1C1A] border border-[#3B3A36] rounded-[6px] text-[13px] placeholder:text-[#85837E] text-[#F0EFEC] focus:outline-none focus:border-[#4A4944]" />
              </div>
              <span className="text-[12px] text-[#85837E]">{filtered.length} of {logs.length} requests</span>
              <span className="ml-auto text-[12px] text-[#85837E] flex items-center gap-1.5"><Clock3 className="w-3.5 h-3.5" /> sessionStorage</span>
            </div>

            <div className="mt-4 border border-[#3B3A36] rounded-[9px] bg-[#1D1C1A] overflow-hidden">
              <div className="h-10 px-4 flex items-center gap-2 border-b border-[#3B3A36] bg-[#292824]">
                <span className="text-[13px] font-semibold tracking-widest text-[#B7B5B0]">REQUESTS</span>
                <span className="ml-auto text-[12px] text-[#85837E]">{filtered.length} total</span>
              </div>

              {!filtered.length ? (
                <div className="p-12 text-center">
                  <div className="text-[13px] text-[#85837E]">No requests yet — interact with Deck (connect, query, tables) and they will appear here.</div>
                  <div className="text-[12px] font-mono text-[#66645F] mt-2">Stored in sessionStorage key <span className="text-[#B7B5B0]">deck:api:logs</span></div>
                </div>
              ) : (
                <div className="divide-y divide-[#3B3A36]">
                  {filtered.map(l=>(
                    <div key={l.id} className="hover:bg-[#232220]">
                      <button onClick={()=> setExpanded(expanded===l.id?null:l.id)} className="w-full h-10 flex items-center gap-3 px-4 text-left">
                        <span className="text-[11px] font-mono text-[#85837E] w-[160px] shrink-0">{new Date(l.timestamp).toLocaleTimeString()}<span className="text-[#66645F] hidden lg:inline"> • {new Date(l.timestamp).toLocaleDateString()}</span></span>
                        <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-[4px] border ${l.method==="GET"?"bg-[#1D1C1A] border-[#3B3A36] text-[#B7B5B0]":l.method==="POST"?"bg-[#4A90E2]/15 border-[#4A90E2]/30 text-[#4A90E2]":"bg-[#232220] border-[#3B3A36] text-[#B7B5B0]"}`}>{l.method}</span>
                        <span className="text-[13px] font-mono text-[#F0EFEC] truncate flex-1">{l.path}</span>
                        <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded-[4px] border ${l.ok ? "bg-[rgba(34,197,94,0.08)] border-[#16803A] text-[#22C55E]" : "bg-[rgba(239,68,68,0.08)] border-[#991b1b] text-[#EF4444]"}`}>{l.status || "ERR"}</span>
                        <span className="text-[12px] font-mono text-[#85837E] w-16 text-right">{l.duration}ms</span>
                        {expanded===l.id ? <ChevronUp className="w-4 h-4 text-[#85837E]" /> : <ChevronDown className="w-4 h-4 text-[#85837E]" />}
                      </button>
                      {expanded===l.id && (
                        <div className="px-4 pb-3 grid grid-cols-1 lg:grid-cols-2 gap-3 bg-[#1D1C1A] border-t border-[#3B3A36]">
                          <div>
                            <div className="text-[11px] tracking-widest text-[#85837E] mt-2">REQUEST</div>
                            <pre className="mt-1 p-3 bg-[#292824] border border-[#3B3A36] rounded-[6px] text-[12px] font-mono text-[#D6D4CF] whitespace-pre-wrap break-all max-h-[200px] overflow-auto">{l.requestBody ? JSON.stringify(JSON.parse(l.requestBody),null,2) : "(no body)"}</pre>
                            {l.error && <div className="mt-2 text-[12px] text-[#EF4444] font-mono">ERROR: {l.error}</div>}
                          </div>
                          <div>
                            <div className="text-[11px] tracking-widest text-[#85837E] mt-2">RESPONSE</div>
                            <pre className="mt-1 p-3 bg-[#292824] border border-[#3B3A36] rounded-[6px] text-[12px] font-mono text-[#D6D4CF] whitespace-pre-wrap break-all max-h-[200px] overflow-auto">{l.responseBody ? (()=>{ try{ return JSON.stringify(JSON.parse(l.responseBody),null,2)} catch{ return l.responseBody }})() : "(empty)"}</pre>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 text-[12px] text-[#85837E] flex items-center gap-2">
              <span>Logs are per-tab session only — closing the tab clears them.</span>
              <span className="ml-auto font-mono text-[#66645F]">deck:api:logs • {logs.length}/100</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
