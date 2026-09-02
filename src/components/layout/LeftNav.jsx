import { Activity, Table2, Box, List, History, Settings, ChevronsLeft, ChevronsRight, Braces, Code2, BookOpen, Terminal, Play, ChevronDown, ChevronRight, Layers } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"
import { useTranslation } from "@/context/I18nContext"
import { useState, useEffect } from "react"

const mainItems = [
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

const apiSubItems = [
  { id: "overview", label: "Overview", icon: BookOpen, path: "/api" },
  { id: "endpoints", label: "Endpoints", icon: Layers, path: "/api/endpoints" },
  { id: "examples", label: "Examples", icon: Terminal, path: "/api/examples" },
  { id: "playground", label: "Playground", icon: Play, path: "/api/playground" },
]

export default function LeftNav() {
  const { t } = useTranslation()
  const nav = useNavigate()
  const loc = useLocation()
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem("deck:leftNav:collapsed") === "true" } catch { return false }
  })
  const [apiOpen, setApiOpen] = useState(() => {
    try { const v = localStorage.getItem("deck:api:open"); return v ? v === "true" : true } catch { return true }
  })
  const [showApi, setShowApi] = useState(() => {
    try {
      const raw = localStorage.getItem("deck:settings")
      if (raw) {
        const j = JSON.parse(raw)
        return j?.navigation?.showApi ?? true
      }
    } catch {}
    return true
  })
  useEffect(() => { try { localStorage.setItem("deck:leftNav:collapsed", String(collapsed)) } catch {} }, [collapsed])
  useEffect(() => { try { localStorage.setItem("deck:api:open", String(apiOpen)) } catch {} }, [apiOpen])
  useEffect(() => {
    const sync = () => {
      try {
        const raw = localStorage.getItem("deck:settings")
        if (raw) {
          const j = JSON.parse(raw)
          setShowApi(j?.navigation?.showApi ?? true)
        } else setShowApi(true)
      } catch { setShowApi(true) }
    }
    sync()
    const onStorage = (e) => { if (!e.key || e.key === "deck:settings") sync() }
    window.addEventListener("storage", onStorage)
    window.addEventListener("deck:settings:update", sync)
    const id = setInterval(sync, 800)
    return () => { window.removeEventListener("storage", onStorage); window.removeEventListener("deck:settings:update", sync); clearInterval(id) }
  }, [])

  const isActive = (path) => {
    if (path === "/") return loc.pathname === "/"
    return loc.pathname.startsWith(path)
  }
  const isApiActive = isActive("/api")

  const handleApiNav = (path) => {
    nav(path)
    if (collapsed) setCollapsed(false)
  }

  const getSubActive = (path) => {
    if (path === "/api") return loc.pathname === "/api"
    return loc.pathname === path
  }

  return (
    <aside className={`${collapsed ? "w-[56px]" : "w-[168px]"} shrink-0 bg-[#292824] border-r border-[#3B3A36] flex flex-col transition-all duration-150`}>
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {mainItems.map(item => {
          const Icon = item.icon
          const active = isActive(item.path)
          return (
            <button
              key={item.id}
              onClick={() => nav(item.path)}
              title={collapsed ? t(item.key) : undefined}
              className={`w-full flex items-center ${collapsed ? "justify-center px-2" : "gap-3 px-3"} h-9 rounded-[6px] text-[13px] font-medium text-left transition-colors ${active ? "bg-[#3B3935] text-[#F0EFEC]" : "text-[#B7B5B0] hover:bg-[#232220] hover:text-[#F0EFEC]"}`}
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
            <button key={item.id} onClick={() => nav(item.path)} title={collapsed ? t(item.key) : undefined} className={`w-full flex items-center ${collapsed ? "justify-center px-2" : "gap-3 px-3"} h-9 rounded-[6px] text-[13px] font-medium text-left transition-colors ${active ? "bg-[#3B3935] text-[#F0EFEC]" : "text-[#B7B5B0] hover:bg-[#232220] hover:text-[#F0EFEC]"}`}>
              <Icon className="w-[18px] h-[18px] shrink-0" strokeWidth={1.8} />
              {!collapsed && t(item.key)}
            </button>
          )
        })}

        {/* ── API — own section with dropdown ── */}
        {showApi && (
        <div className="mt-4">
          {!collapsed && (
            <div className="px-2 mb-1.5 flex items-center gap-1.5">
              <span className="text-[10px] font-semibold tracking-[0.14em] text-[#66645F]">DEVELOPER</span>
              <span className="flex-1 h-px bg-[#3B3A36]/60" />
            </div>
          )}
          {collapsed && <div className="h-px bg-[#3B3A36] my-3 mx-2" />}

          <div className={`rounded-[8px] border transition-colors ${isApiActive ? "bg-[#1D1C1A] border-[#3B3A36]" : "bg-transparent border-transparent hover:border-[#3B3A36]/50"}`}>
            <button
              onClick={() => {
                if (collapsed) { setCollapsed(false); setApiOpen(true); }
                else if (isApiActive) setApiOpen(v => !v)
                else { nav("/api"); setApiOpen(true) }
              }}
              title={collapsed ? "API" : undefined}
              className={`w-full flex items-center ${collapsed ? "justify-center px-2" : "gap-2 px-2.5"} h-9 rounded-[6px] text-left transition-colors ${isApiActive ? "text-[#F0EFEC]" : "text-[#B7B5B0] hover:text-[#F0EFEC]"}`}
            >
              {collapsed ? (
                <span className="relative">
                  <Code2 className={`w-[18px] h-[18px] shrink-0 ${isApiActive ? "text-[#F0EFEC]" : "text-[#B7B5B0]"}`} strokeWidth={1.8} />
                  {isApiActive && <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#B7B5B0] rounded-full border border-[#292824]" />}
                </span>
              ) : (
                <>
                  <div className={`w-7 h-7 rounded-[6px] flex items-center justify-center shrink-0 border ${isApiActive ? "bg-[#3B3935] border-[#3B3A36] text-[#F0EFEC]" : "bg-[#232220] border-[#3B3A36] text-[#B7B5B0]"}`}>
                    <Code2 className="w-3.5 h-3.5" strokeWidth={1.9} />
                  </div>
                  <span className="flex-1 text-[13px] font-semibold tracking-tight">API</span>
                  <span className="hidden xl:inline-flex text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#3B3A36] text-[#B7B5B0] border border-[#4A4944] leading-none">REST</span>
                  {apiOpen ? <ChevronDown className="w-3.5 h-3.5 text-[#85837E] shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-[#85837E] shrink-0" />}
                </>
              )}
            </button>

            {!collapsed && apiOpen && (
              <div className="px-1 pb-1.5 pt-0.5 space-y-0.5">
                {apiSubItems.map(sub => {
                  const Icon = sub.icon
                  const active = getSubActive(sub.path)
                  return (
                    <button
                      key={sub.id}
                      onClick={() => handleApiNav(sub.path)}
                      className={`w-full flex items-center gap-2.5 pl-[13px] pr-2 h-7 rounded-[6px] text-[13px] font-medium text-left transition-colors ${active ? "bg-[#292824] text-[#F0EFEC] border border-[#3B3A36]" : "text-[#85837E] hover:bg-[#292824]/70 hover:text-[#B7B5B0] border border-transparent"}`}
                    >
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${active ? "text-[#F0EFEC]" : "text-[#66645F]"}`} strokeWidth={1.8} />
                      {sub.label}
                      {sub.id === "endpoints" && !active && <span className="ml-auto text-[10px] px-1 py-0.5 rounded bg-[#3B3A36] text-[#85837E] font-mono">5</span>}
                    </button>
                  )
                })}
                <div className="pt-1.5 px-1">
                  <div className="rounded-[6px] bg-[#292824] border border-[#3B3A36] px-2.5 py-2">
                    <div className="text-[11px] font-semibold text-[#F0EFEC] flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" /> API</div>
                    <div className="text-[11px] leading-[1.4] text-[#85837E] mt-0.5">Supabase-like CRUD for every table.</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* When collapsed and api is active, show vertical dots for sub nav */}
          {collapsed && isApiActive && (
            <div className="mt-2 flex flex-col items-center gap-1.5">
              {apiSubItems.map(sub => (
                <button key={sub.id} onClick={() => handleApiNav(sub.path)} title={sub.label} className={`w-1 h-1 rounded-full transition-all ${getSubActive(sub.path) ? "bg-[#F0EFEC] w-4 h-1.5" : "bg-[#3B3A36] hover:bg-[#5A5852]"}`} />
              ))}
            </div>
          )}
        </div>
        )}
      </nav>

      <div className="p-2 border-t border-[#3B3A36]/50">
        <button onClick={() => setCollapsed(v=> !v)} className={`flex items-center gap-2 px-3 py-2 text-[13px] text-[#B7B5B0] hover:text-[#F0EFEC] w-full ${collapsed ? "justify-center" : ""}`}>
          {collapsed ? <ChevronsRight className="w-4 h-4" /> : <><ChevronsLeft className="w-4 h-4" />{t("nav.collapse")}</>}
        </button>
      </div>
    </aside>
  )
}
