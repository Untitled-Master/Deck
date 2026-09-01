import { RefreshCw, MoreHorizontal } from "lucide-react"

export default function Header({ selectedTable, activeTab, onRefresh, onRun, isRunning }) {
  const isSql = activeTab === "sql"
  return (
    <div className="h-[52px] border-b border-[#3B3A36] bg-[#1D1C1A] flex items-center justify-between px-7 shrink-0">
      <div className="flex items-center gap-3">
        <span className="text-[18px] font-semibold text-[#F0EFEC]">{selectedTable}</span>
        <span className="hidden md:inline-flex text-[11px] font-medium tracking-widest border border-[#3B3A36] px-2 py-1 rounded-[6px] bg-[#292824] text-[#B7B5B0]">
          {activeTab.toUpperCase()}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onRefresh} className="hidden md:flex items-center gap-1.5 h-8 px-3 border border-[#4A4944] bg-transparent rounded-[6px] text-[13px] font-medium text-[#B7B5B0] hover:bg-[#3B3935] hover:text-[#F0EFEC] transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
        {isSql && (
          <button onClick={onRun} disabled={isRunning} className="h-8 px-4 bg-[#4A90E2] text-white rounded-[6px] text-[13px] font-medium hover:bg-[#3a7bc8] disabled:opacity-50">
            {isRunning ? "Running…" : "Run"}
          </button>
        )}
        <button className="w-8 h-8 flex items-center justify-center border border-[#3B3A36] bg-[#292824] rounded-[6px] hover:bg-[#3B3935] text-[#B7B5B0]">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
