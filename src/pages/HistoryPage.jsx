import { useEffect, useState } from "react"
import TopBar from "@/components/layout/TopBar"
import LeftNav from "@/components/layout/LeftNav"
import { History, Clock3, Table2, Search } from "lucide-react"

const LS_TABLE = "deck:selectedTable"
const LS_TAB = "deck:activeTab"
const LS_HISTORY = "deck:history"

function loadHistory() {
  try {
    const raw = localStorage.getItem(LS_HISTORY)
    if (raw) return JSON.parse(raw)
  } catch {}
  // fallback: build from current table/tab if history empty
  try {
    const t = localStorage.getItem(LS_TABLE) || "favorites"
    const tab = localStorage.getItem(LS_TAB) || "data"
    return [{ table: t, tab, at: new Date().toISOString(), action: "opened" }]
  } catch { return [] }
}

export default function HistoryPage() {
  const [items, setItems] = useState(() => loadHistory())
  const [filter, setFilter] = useState("")

  useEffect(() => {
    const onStorage = () => setItems(loadHistory())
    window.addEventListener("storage", onStorage)
    // also watch table/tab changes via interval
    const id = setInterval(() => setItems(loadHistory()), 1000)
    return () => { window.removeEventListener("storage", onStorage); clearInterval(id) }
  }, [])

  const filtered = items.filter(i => !filter || i.table.toLowerCase().includes(filter.toLowerCase()) || i.tab.toLowerCase().includes(filter.toLowerCase()))

  return (
    <div className="h-screen flex flex-col bg-[#292824] overflow-hidden">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <LeftNav />
        <div className="flex-1 bg-[#1D1C1A] overflow-auto">
          <div className="p-7 max-w-[900px]">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-[20px] font-semibold text-[#F0EFEC] flex items-center gap-2">
                  <History className="w-5 h-5 text-[#B7B5B0]" />
                  History
                </h1>
                <p className="text-[13px] text-[#85837E] mt-1">Recently opened tables and tabs — stored locally in <span className="font-mono text-[#B7B5B0]">deck:history</span>.</p>
              </div>
              <span className="text-[12px] text-[#85837E] flex items-center gap-1.5"><Clock3 className="w-3.5 h-3.5" /> localStorage</span>
            </div>

            <div className="mt-6 relative max-w-[360px]">
              <Search className="w-4 h-4 text-[#85837E] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input value={filter} onChange={e=> setFilter(e.target.value)} placeholder="Filter table or tab…" className="w-full h-8 pl-8 pr-3 bg-[#1D1C1A] border border-[#3B3A36] rounded-[6px] text-[13px] placeholder:text-[#85837E] text-[#F0EFEC] focus:outline-none focus:border-[#4A4944]" />
            </div>

            <div className="mt-4 border border-[#3B3A36] rounded-[9px] bg-[#292824] overflow-hidden">
              <div className="h-10 px-4 flex items-center gap-2 border-b border-[#3B3A36] bg-[#292824]">
                <span className="text-[13px] font-semibold tracking-widest text-[#B7B5B0]">RECENT</span>
                <span className="ml-auto text-[12px] text-[#85837E]">{filtered.length} entries</span>
              </div>
              {!filtered.length ? (
                <div className="p-12 text-center">
                  <div className="text-[13px] text-[#85837E]">No history yet — open tables in Data / Structure to build history.</div>
                  <div className="text-[12px] font-mono text-[#66645F] mt-2">Keys: deck:selectedTable • deck:activeTab</div>
                </div>
              ) : (
                <div className="divide-y divide-[#3B3A36]">
                  {filtered.map((it, idx) => (
                    <div key={idx} className="h-12 flex items-center gap-3 px-4 hover:bg-[#232220]">
                      <div className="w-8 h-8 rounded-[6px] bg-[#1D1C1A] border border-[#3B3A36] flex items-center justify-center shrink-0"><Table2 className="w-4 h-4 text-[#B7B5B0]" /></div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] font-medium text-[#F0EFEC]">{it.table} <span className="text-[#85837E] font-normal">• {it.tab}</span></div>
                        <div className="text-[11px] text-[#85837E] font-mono">{new Date(it.at).toLocaleString()} • {it.action}</div>
                      </div>
                      <span className="text-[11px] font-medium px-2 py-1 rounded-full border bg-[#1D1C1A] border-[#3B3A36] text-[#B7B5B0] capitalize">{it.tab}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 text-[12px] text-[#85837E]">History is written on every table/tab change. Clear via Settings → Data management → Clear all data.</div>
          </div>
        </div>
      </div>
    </div>
  )
}
