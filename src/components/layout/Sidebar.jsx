import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Search, Plus, Box } from "lucide-react"
import { useConnection } from "@/context/ConnectionContext"
import { api } from "@/lib/api"
import { FAKE_TABLES } from "@/lib/fakeData"

const MOCK_TABLES = FAKE_TABLES

export default function Sidebar({ selectedTable, onSelectTable, search, setSearch }) {
  const { connected } = useConnection()
  const navigate = useNavigate()
  const [tables, setTables] = useState(MOCK_TABLES)
  const [loading, setLoading] = useState(false)

  const fetchTables = async () => {
    if (!connected) { setTables(MOCK_TABLES); return }
    setLoading(true)
    try {
      const res = await api.tables()
      const mapped = res.tables.map(t => ({ name: t.name, rows: t.estimatedRows, type: t.type }))
      setTables(mapped.length ? mapped : MOCK_TABLES)
      if (mapped.length && !mapped.find(x => x.name === selectedTable)) onSelectTable(mapped[0].name)
    } catch { setTables(MOCK_TABLES) } finally { setLoading(false) }
  }

  useEffect(() => { fetchTables() }, [connected])
  const filtered = tables.filter(t => t.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <aside className="w-[330px] shrink-0 bg-[#292824] border-r border-[#3B3A36] flex flex-col overflow-hidden">
      {/* Database selector */}
      <div className="p-[14px]">
        <button className="w-full h-10 flex items-center justify-between px-3 bg-[#292824] border border-[#4A4944] rounded-[7px] hover:bg-[#232220] transition-colors">
          <span className="flex items-center gap-2 text-[13px] font-medium text-[#F0EFEC]">
            <Box className="w-4 h-4 text-[#B7B5B0]" />
            public
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
          {!filtered.length && <div className="text-[13px] text-[#85837E] px-2 py-3">No tables</div>}
        </div>

        <button className="mt-4 flex items-center gap-1.5 px-2 text-[13px] font-medium text-[#4A90E2] hover:text-[#6aa8f0]">
          <Plus className="w-4 h-4" /> Create Table
        </button>
      </div>

      <div className="p-3 border-t border-[#3B3A36] flex items-center justify-between">
        <span className="text-[11px] text-[#85837E]">{loading ? "Loading…" : `${tables.length} tables`}</span>
        <button onClick={fetchTables} className="text-[11px] text-[#B7B5B0] hover:text-[#F0EFEC]">Refresh</button>
      </div>
    </aside>
  )
}

export { MOCK_TABLES }
