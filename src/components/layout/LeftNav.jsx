import { Activity, Table2, Box, List, History, Settings, ChevronsLeft, ChevronsRight, Braces } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"
import { useTranslation } from "@/context/I18nContext"
import { useState, useEffect } from "react"

const items = [
  { id: "health", key: "nav.health", icon: Activity, path: "/health" },
  { id: "data", key: "nav.data", icon: Table2, path: "/" },
  { id: "sql", key: "nav.sqlEditor", icon: Braces, path: "/sql" },
  { id: "schema", key: "nav.schema", icon: Box, path: "/schema" },
  { id: "logs", key: "nav.logs", icon: List, path: "/logs" },
]

const bottom = [
  { id: "history", key: "nav.history", icon: History, path: "/history" },
  { id: "settings", key: "nav.settings", icon: Settings, path: "/settings" },
]

export default function LeftNav() {
  const { t } = useTranslation()
  const nav = useNavigate()
  const loc = useLocation()
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem("deck:leftNav:collapsed") === "true" } catch { return false }
  })
  useEffect(() => { try { localStorage.setItem("deck:leftNav:collapsed", String(collapsed)) } catch {} }, [collapsed])
  const isActive = (path) => {
    if (path === "/") return loc.pathname === "/"
    return loc.pathname.startsWith(path)
  }
  return (
    <aside className={`${collapsed ? "w-[56px]" : "w-[150px]"} shrink-0 bg-[#292824] border-r border-[#3B3A36] flex flex-col transition-all duration-150`}>
      <nav className="flex-1 py-3 px-2 space-y-0.5">
        {items.map(item => {
          const Icon = item.icon
          const active = isActive(item.path)
          return (
            <button
              key={item.id}
              onClick={() => nav(item.path)}
              title={collapsed ? t(item.key) : undefined}
              className={`w-full flex items-center ${collapsed ? "justify-center px-2" : "gap-3 px-3"} h-10 rounded-[6px] text-[13px] font-medium text-left transition-colors ${active ? "bg-[#3B3935] text-[#F0EFEC]" : "text-[#B7B5B0] hover:bg-[#232220] hover:text-[#F0EFEC]"}`}
            >
              <Icon className="w-[18px] h-[18px] shrink-0" strokeWidth={1.8} />
              {!collapsed && t(item.key)}
            </button>
          )
        })}
        <div className="h-px bg-[#3B3A36] my-3 mx-2" />
        {bottom.map(item => {
          const Icon = item.icon
          const active = isActive(item.path)
          return (
            <button key={item.id} onClick={() => nav(item.path)} title={collapsed ? t(item.key) : undefined} className={`w-full flex items-center ${collapsed ? "justify-center px-2" : "gap-3 px-3"} h-10 rounded-[6px] text-[13px] font-medium text-left transition-colors ${active ? "bg-[#3B3935] text-[#F0EFEC]" : "text-[#B7B5B0] hover:bg-[#232220] hover:text-[#F0EFEC]"}`}>
              <Icon className="w-[18px] h-[18px] shrink-0" strokeWidth={1.8} />
              {!collapsed && t(item.key)}
            </button>
          )
        })}
      </nav>
      <div className="p-2">
        <button onClick={() => setCollapsed(v=> !v)} className={`flex items-center gap-2 px-3 py-2 text-[13px] text-[#B7B5B0] hover:text-[#F0EFEC] w-full ${collapsed ? "justify-center" : ""}`}>
          {collapsed ? <ChevronsRight className="w-4 h-4" /> : <><ChevronsLeft className="w-4 h-4" />{t("nav.collapse")}</>}
        </button>
      </div>
    </aside>
  )
}
