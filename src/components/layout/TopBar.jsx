import { Search, ChevronDown, LogOut, PlugZap, Loader2, AlertTriangle, Settings, Globe, Moon, Sun, Languages } from "lucide-react"
import { useConnection } from "@/context/ConnectionContext"
import { useTranslation } from "@/context/I18nContext"
import { useTheme } from "@/context/ThemeContext"
import { useNavigate } from "react-router-dom"
import { useState, useRef, useEffect } from "react"
import { toast } from "sonner"
import { PostgreSQL } from "@/components/PostgreSQL"
import DeckLogo from "@/components/DeckLogo"

export default function TopBar() {
  const { t, lang, setLang } = useTranslation()
  const { effective } = useTheme()
  const nav = useNavigate()
  const { config, connected, disconnect } = useConnection()
  const [disconnecting, setDisconnecting] = useState(false)
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const profileRef = useRef(null)
  const dbName = config?.database ?? "my-project"

  const updateTheme = (theme) => {
    try {
      const raw = localStorage.getItem("deck:settings")
      const j = raw ? JSON.parse(raw) : {}
      j.theme = theme
      localStorage.setItem("deck:settings", JSON.stringify(j))
      window.dispatchEvent(new Event("deck:settings:update"))
      toast.success(`${t("settings.general.themeLabel") || "Theme"} → ${theme === "dark" ? t("settings.general.dark") || "Dark" : t("settings.general.light") || "Light"}`, { duration: 1500 })
    } catch {}
  }

  const isDarkLike = effective !== "light"

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfileMenu(false)
    }
    const handleEsc = (e) => { if (e.key === "Escape") setShowProfileMenu(false) }
    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEsc)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEsc)
    }
  }, [])

  const handleDisconnect = async () => {
    if (disconnecting) return
    setDisconnecting(true)
    try {
      await disconnect()
      toast.success(t("toasts.disconnected") || "Disconnected")
      setShowDisconnectConfirm(false)
      nav("/connect")
    } catch (e) {
      toast.error(e.message || "Failed to disconnect")
    } finally {
      setDisconnecting(false)
    }
  }

  return (
    <div className="h-[64px] shrink-0 bg-[#292824] border-b border-[#3B3A36] flex items-center justify-between px-[18px] gap-4">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <DeckLogo className="w-6 h-6 shrink-0 text-[#F0EFEC]" />
          <span className="text-[14px] font-medium text-[#F0EFEC]">Deck</span>
          <span className="text-[#66645F] text-[14px]">/</span>
          <div className="flex items-center gap-2">
            <PostgreSQL className="w-5 h-5 shrink-0" />
            <span className="text-[13px] font-medium text-[#F0EFEC]">{dbName}</span>
          </div>
        </div>

        <button className="hidden md:flex items-center gap-2.5 h-[42px] px-4 bg-[rgba(34,197,94,0.08)] border border-[#16803A] rounded-[22px] hover:bg-[rgba(34,197,94,0.12)] transition-colors">
          <span className={`w-2 h-2 rounded-full ${connected ? "bg-[#22C55E]" : "bg-[#EAB308]"}`} />
          <div className="flex flex-col items-start leading-none">
            <span className="text-[12px] font-medium text-[#22C55E]">{connected ? t("common.healthy") : t("common.disconnected")}</span>
            <span className="text-[11px] text-[#22C55E]/80">PostgreSQL • {dbName}</span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-[#22C55E] ml-2" />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 h-10 w-[240px] bg-transparent md:bg-[#232220] border border-[#3B3A36] rounded-[6px] px-3">
          <Search className="w-4 h-4 text-[#85837E] shrink-0" />
          <input placeholder={t("topbar.findPlaceholder")} className="flex-1 bg-transparent text-[13px] placeholder:text-[#85837E] text-[#F0EFEC] focus:outline-none" />
          <span className="w-5 h-5 flex items-center justify-center bg-[#292824] border border-[#3B3A36] rounded-[4px] text-[11px] text-[#85837E]">/</span>
        </div>
        {connected ? (
          <button
            onClick={() => setShowDisconnectConfirm(true)}
            disabled={disconnecting}
            className="h-8 px-3 flex items-center gap-1.5 border border-[#4A4944] bg-transparent rounded-[6px] text-[13px] font-medium text-[#B7B5B0] hover:bg-[#3B3935] hover:text-[#F0EFEC] hover:border-[#5A5852] disabled:opacity-50 transition-colors"
            title={t("common.disconnect") || "Disconnect"}
          >
            {disconnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
            <span className="hidden sm:inline">{t("common.disconnect") || "Disconnect"}</span>
          </button>
        ) : (
          <button
            onClick={() => nav("/connect")}
            className="h-8 px-3 flex items-center gap-1.5 bg-[#F0EFEC] text-[#1D1C1A] border border-[#F0EFEC] rounded-[6px] text-[13px] font-medium hover:bg-white transition-colors"
          >
            <PlugZap className="w-4 h-4" />
            <span className="hidden sm:inline">{t("common.connect") || "Connect"}</span>
          </button>
        )}
        <div ref={profileRef} className="relative">
          <button onClick={() => setShowProfileMenu(v => !v)} className="w-8 h-8 rounded-full border border-[#3B3A36] overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#4A90E2]/30 hover:border-[#4A4944] transition-colors">
            <img src="https://i.pravatar.cc/100?img=12" alt="avatar" className="w-full h-full object-cover" />
          </button>
          {showProfileMenu && (
            <div className="absolute right-0 top-[calc(100%+8px)] w-[260px] bg-[#292824] border border-[#3B3A36] rounded-[10px] shadow-[0_8px_24px_rgba(0,0,0,0.5)] overflow-hidden z-50">
              <div className="p-3 flex items-center gap-3 border-b border-[#3B3A36]">
                <img src="https://i.pravatar.cc/100?img=12" alt="avatar" className="w-9 h-9 rounded-full border border-[#3B3A36] object-cover" />
                <div className="min-w-0">
                  <div className="text-[13px] font-medium text-[#F0EFEC] leading-none">Alex Morgan</div>
                  <div className="text-[11px] text-[#85837E] truncate">alex.morgan@deck.local</div>
                </div>
                <span className={`ml-auto w-2 h-2 rounded-full ${connected ? "bg-[#22C55E]" : "bg-[#EAB308]"}`} />
              </div>
              <div className="p-2 space-y-3">
                {/* Language switch */}
                <div>
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-[#66645F] px-2 py-1 flex items-center gap-1.5"><Languages className="w-3 h-3" /> {t("topbar.profile.language").toUpperCase()}</div>
                  <div className="flex items-center gap-1 p-1 bg-[#1D1C1A] border border-[#3B3A36] rounded-[7px]">
                    {[
                      { id: "en", label: "EN" },
                      { id: "fr", label: "FR" },
                    ].map(o => (
                      <button key={o.id} onClick={() => { setLang(o.id); setShowProfileMenu(false) }} className={`flex-1 h-7 rounded-[6px] text-[12px] font-medium flex items-center justify-center gap-1 ${lang === o.id ? "bg-[#292824] border border-[#3B3A36] text-[#F0EFEC]" : "text-[#85837E] hover:text-[#B7B5B0]"}`}>
                        <Globe className="w-3 h-3" /> {o.label}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Dark / Light theme */}
                <div>
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-[#66645F] px-2 py-1 flex items-center gap-1.5"><Moon className="w-3 h-3" /> {t("topbar.profile.theme").toUpperCase()}</div>
                  <div className="flex items-center gap-1 p-1 bg-[#1D1C1A] border border-[#3B3A36] rounded-[7px]">
                    <button onClick={() => { updateTheme("dark"); setShowProfileMenu(false) }} className={`flex-1 h-7 rounded-[6px] text-[12px] font-medium flex items-center justify-center gap-1.5 ${isDarkLike ? "bg-[#292824] border border-[#3B3A36] text-[#F0EFEC]" : "text-[#85837E] hover:text-[#B7B5B0]"}`}>
                      <Moon className="w-3.5 h-3.5" /> {t("settings.general.dark")}
                    </button>
                    <button onClick={() => { updateTheme("light"); setShowProfileMenu(false) }} className={`flex-1 h-7 rounded-[6px] text-[12px] font-medium flex items-center justify-center gap-1.5 ${effective === "light" ? "bg-[#292824] border border-[#3B3A36] text-[#F0EFEC]" : "text-[#85837E] hover:text-[#B7B5B0]"}`}>
                      <Sun className="w-3.5 h-3.5" /> {t("settings.general.light")}
                    </button>
                  </div>
                  <div className="text-[11px] text-[#66645F] px-2 mt-1">{t("topbar.profile.customThemesHint")}</div>
                </div>
                <div className="h-px bg-[#3B3A36]/60 mx-1" />
                <button onClick={() => { setShowProfileMenu(false); nav("/settings") }} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[6px] text-[13px] font-medium text-[#B7B5B0] hover:bg-[#1D1C1A] hover:text-[#F0EFEC] border border-transparent hover:border-[#3B3A36] transition-colors text-left">
                  <Settings className="w-4 h-4" /> {t("topbar.profile.settings")}
                  <span className="ml-auto text-[11px] text-[#66645F]">⌘ ,</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Disconnect dialogue */}
      {showDisconnectConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" onClick={() => !disconnecting && setShowDisconnectConfirm(false)} />
          <div className="relative w-full max-w-[420px] bg-[#292824] border border-[#3B3A36] rounded-[12px] overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
            <div className="p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[#7f1d1d]/20 border border-[#7f1d1d]/30 flex items-center justify-center shrink-0">
                  <LogOut className="w-5 h-5 text-[#EF4444]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[15px] font-semibold text-[#F0EFEC]">{t("topbar.disconnectDialog.title")}</h3>
                  <p className="text-[13px] text-[#B7B5B0] mt-1.5 leading-relaxed">
                    {t("topbar.disconnectDialog.desc")} <span className="font-mono font-medium text-[#F0EFEC]">{dbName}</span>. {t("topbar.disconnectDialog.desc2")}
                  </p>
                  {config && (
                    <div className="mt-3 bg-[#1D1C1A] border border-[#3B3A36] rounded-[6px] px-3 py-2.5 flex items-center gap-2.5">
                      <PostgreSQL className="w-4 h-4 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-[12px] font-medium text-[#F0EFEC] truncate">{config.host}:{config.port}/{config.database}</div>
                        <div className="text-[11px] text-[#85837E]">{t("topbar.disconnectDialog.as")} {config.user}</div>
                      </div>
                      <span className="ml-auto w-2 h-2 rounded-full bg-[#22C55E] shrink-0" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="px-5 py-3 bg-[#1D1C1A] border-t border-[#3B3A36] flex items-center justify-end gap-2">
              <button
                onClick={() => setShowDisconnectConfirm(false)}
                disabled={disconnecting}
                className="h-8 px-4 bg-transparent border border-[#3B3A36] rounded-[6px] text-[13px] font-medium text-[#B7B5B0] hover:bg-[#292824] hover:text-[#F0EFEC] disabled:opacity-50"
              >
                {t("topbar.disconnectDialog.cancel")}
              </button>
              <button
                onClick={handleDisconnect}
                disabled={disconnecting}
                className="h-8 px-4 bg-[#EF4444] hover:bg-[#dc2626] disabled:opacity-50 text-white rounded-[6px] text-[13px] font-medium flex items-center gap-1.5"
              >
                {disconnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                {disconnecting ? t("topbar.disconnectDialog.disconnecting") : t("topbar.disconnectDialog.disconnect")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
