import { Search, ChevronDown, LogOut, PlugZap, Loader2 } from "lucide-react"
import { useConnection } from "@/context/ConnectionContext"
import { useTranslation } from "@/context/I18nContext"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { toast } from "sonner"
import { PostgreSQL } from "@/components/PostgreSQL"
import DeckLogo from "@/components/DeckLogo"

export default function TopBar() {
  const { t } = useTranslation()
  const nav = useNavigate()
  const { config, connected, disconnect } = useConnection()
  const [disconnecting, setDisconnecting] = useState(false)
  const dbName = config?.database ?? "my-project"

  const handleDisconnect = async () => {
    if (disconnecting) return
    setDisconnecting(true)
    try {
      await disconnect()
      toast.success(t("toasts.disconnected") || "Disconnected")
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
            onClick={handleDisconnect}
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
        <img src="https://i.pravatar.cc/100?img=12" alt="avatar" className="w-8 h-8 rounded-full border border-[#3B3A36] object-cover" />
      </div>
    </div>
  )
}
