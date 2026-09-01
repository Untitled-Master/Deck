import { Table2, Columns3, Share2 } from "lucide-react"

const TABS = [
  { id: "data", label: "Data", icon: Table2 },
  { id: "structure", label: "Structure", icon: Columns3 },
  { id: "relations", label: "Relations", icon: Share2 },
]

export default function TabBar({ activeTab, setActiveTab }) {
  return (
    <div className="flex items-center gap-0 border-b border-[#3B3A36] bg-[#1D1C1A] px-2 h-[38px]">
      {TABS.map(tab => {
        const active = activeTab === tab.id
        const Icon = tab.icon
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 h-[38px] text-[13px] font-medium border-b-2 -mb-px transition-colors ${active ? "border-[#4A90E2] bg-[#292824] text-[#F0EFEC]" : "border-transparent text-[#85837E] hover:text-[#B7B5B0] hover:bg-[#232220]"}`}
          >
            <Icon className="w-4 h-4" strokeWidth={1.8} />
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

export { TABS }
