import { BookOpen, Layers, Terminal, Play, Hash, Filter, ArrowUpDown, Boxes, FileCode, ChevronRight } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const groups = [
  {
    title: "Getting started",
    items: [
      { label: "Overview", path: "/api", icon: BookOpen },
    ]
  },
  {
    title: "Reference",
    items: [
      { label: "Endpoints", path: "/api/endpoints", icon: Layers },
    ]
  },
  {
    title: "Guides",
    items: [
      { label: "Examples", path: "/api/examples", icon: Terminal },
      { label: "Playground", path: "/api/playground", icon: Play },
    ]
  },
]

export default function ApiDocsSidebar({ selected, tables, onSelectTable }) {
  const loc = useLocation()
  const nav = useNavigate()
  const isActive = (p) => loc.pathname === p

  return (
    <aside className="w-[220px] shrink-0 bg-[#1D1C1A] border-r border-[#3B3A36] hidden md:flex flex-col overflow-hidden">
      <div className="p-4 border-b border-[#3B3A36]">
        <div className="text-[11px] font-semibold tracking-widest text-[#85837E]">API DOCS</div>
        <div className="text-[11px] text-[#66645F] mt-1">REST • Postgres • public</div>
        {tables && onSelectTable && (
          <div className="mt-3">
            <div className="text-[11px] tracking-widest text-[#66645F] mb-1.5">TABLE</div>
            <Select value={selected} onValueChange={onSelectTable}>
              <SelectTrigger className="h-8 w-full bg-[#292824] border-[#3B3A36] text-[#F0EFEC] font-mono text-[13px] focus:border-[#4A4944]">
                <SelectValue placeholder="Select table" />
              </SelectTrigger>
              <SelectContent className="bg-[#292824] border-[#3B3A36]">
                {tables.map(t=> <SelectItem key={t.name} value={t.name} className="font-mono text-[13px]">{t.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="text-[11px] text-[#66645F] mt-1.5 flex items-center gap-1.5"><Boxes className="w-3 h-3" /> {tables.length} tables</div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto p-3 space-y-5">
        {groups.map(group=> (
          <div key={group.title}>
            <div className="text-[11px] font-semibold tracking-widest text-[#66645F] px-2 mb-1.5">{group.title.toUpperCase()}</div>
            <div className="space-y-0.5">
              {group.items.map(item=>{
                const Icon = item.icon
                const active = isActive(item.path)
                return (
                  <button key={item.path} onClick={()=> nav(item.path)} className={`w-full flex items-center gap-2.5 px-2.5 h-8 rounded-[6px] text-left text-[13px] font-medium transition-colors ${active ? "bg-[#292824] text-[#F0EFEC] border border-[#3B3A36]" : "text-[#B7B5B0] hover:bg-[#292824] hover:text-[#F0EFEC] border border-transparent"}`}>
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${active ? "text-[#F0EFEC]" : "text-[#85837E]"}`} />
                    {item.label}
                    {active && <ChevronRight className="w-3 h-3 ml-auto text-[#85837E]" />}
                  </button>
                )
              })}
            </div>
          </div>
        ))}

        <div className="pt-3 border-t border-[#3B3A36]">
          <div className="text-[11px] font-semibold tracking-widest text-[#66645F] px-2 mb-2">ON THIS PAGE</div>
          <div className="space-y-1 px-2 text-[12px] text-[#85837E] leading-relaxed">
            <div className="hover:text-[#B7B5B0] cursor-default">Base URL</div>
            <div className="hover:text-[#B7B5B0] cursor-default">Authentication</div>
            <div className="hover:text-[#B7B5B0] cursor-default">Query params</div>
          </div>
        </div>
      </div>

      <div className="p-3 border-t border-[#3B3A36]">
        <div className="rounded-[7px] bg-[#292824] border border-[#3B3A36] p-3">
          <div className="text-[11px] font-semibold text-[#F0EFEC]">Need help?</div>
          <div className="text-[11px] text-[#85837E] mt-1 leading-relaxed">Endpoints are open — add auth middleware before production.</div>
        </div>
      </div>
    </aside>
  )
}
