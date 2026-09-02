import { useEffect, useRef, useState } from "react"
import TopBar from "@/components/layout/TopBar"
import LeftNav from "@/components/layout/LeftNav"
import Google from "@/components/icons/Google"
import {
  Settings, Shield, Palette, Code2, Database, Bell, Trash2,
  Download, Upload, LogOut, Check, X, RefreshCw, Lock, Eye, EyeOff,
  Globe, Monitor, Moon, Sun, Languages, SlidersHorizontal, KeyRound, History, Info, Loader2, Sparkles, Zap, FileJson, BadgeCheck, CheckCircle, ChevronDown, RotateCcw, Search, Paintbrush, Layers, Github
} from "lucide-react"
import { toast } from "sonner"
import { MONACO_THEMES, getThemeBg, getThemeLabel } from "@/lib/monacoThemes"
import { useTranslation } from "@/context/I18nContext"
import { APP_VERSION } from "@/lib/version"

// ---------- localStorage keys ----------
const LS_SETTINGS = "deck:settings"
const LS_GOOGLE = "deck:googleAccount"
const LS_LAST_SYNC = "deck:lastSyncAt"
const LS_CLOUD = "deck:cloudBackup"
const LS_TABLE = "deck:selectedTable"
const LS_TAB = "deck:activeTab"

// ---------- defaults ----------
const DEFAULT_SETTINGS = {
  language: "en",
  theme: "dark",
  compactMode: false,
  density: "comfortable",
  editor: {
    defaultLimit: 100,
    fontSize: 13,
    wordWrap: true,
    autocomplete: true,
    confirmDestructive: true,
    showGridLines: true,
    showRowNumbers: true,
    minimap: false,
    monacoTheme: "deck-dark",
  },
  sync: {
    autoSync: true,
    includeQueries: true,
    includeConnections: false,
    includeSchemaLayout: true,
  },
  notifications: {
    queries: true,
    sync: true,
    connection: true,
    desktop: false,
  },
  privacy: {
    telemetry: false,
    crashReports: false,
    analytics: false,
  },
  navigation: {
    showApi: true,
  },
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(LS_SETTINGS)
    if (!raw) return DEFAULT_SETTINGS
    const parsed = JSON.parse(raw)
    const normalizedLang = ["en", "fr"].includes(parsed.language) ? parsed.language : DEFAULT_SETTINGS.language
    const rawTheme = parsed.editor?.monacoTheme
    const normalizedTheme = MONACO_THEMES.some(t=>t.id===rawTheme) ? rawTheme : DEFAULT_SETTINGS.editor.monacoTheme
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      language: normalizedLang,
      editor: { ...DEFAULT_SETTINGS.editor, ...(parsed.editor || {}), monacoTheme: normalizedTheme },
      sync: { ...DEFAULT_SETTINGS.sync, ...(parsed.sync || {}) },
      notifications: { ...DEFAULT_SETTINGS.notifications, ...(parsed.notifications || {}) },
      privacy: { ...DEFAULT_SETTINGS.privacy, ...(parsed.privacy || {}) },
      navigation: { ...DEFAULT_SETTINGS.navigation, ...(parsed.navigation || {}) },
    }
  } catch { return DEFAULT_SETTINGS }
}

function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0 ${checked ? "bg-[#4A90E2]" : "bg-[#3B3A36]"} ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      aria-pressed={checked}
    >
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${checked ? "translate-x-4" : "translate-x-0.5"}`} />
    </button>
  )
}

function SectionCard({ icon: Icon, title, desc, children, action }) {
  return (
    <div className="border border-[#3B3A36] rounded-[10px] bg-[#292824] overflow-visible">
      <div className="px-5 py-4 flex items-start justify-between gap-4 border-b border-[#3B3A36] bg-[#292824] rounded-t-[10px]">
        <div className="flex gap-3">
          <div className="w-9 h-9 rounded-[8px] bg-[#1D1C1A] border border-[#3B3A36] flex items-center justify-center shrink-0 mt-0.5">
            <Icon className="w-4 h-4 text-[#B7B5B0]" />
          </div>
          <div>
            <h3 className="text-[14px] font-semibold text-[#F0EFEC] leading-none">{title}</h3>
            <p className="text-[12.5px] text-[#85837E] mt-1.5 leading-relaxed max-w-[560px]">{desc}</p>
          </div>
        </div>
        {action}
      </div>
      <div className="p-5 space-y-5 bg-[#292824] rounded-b-[10px]">{children}</div>
    </div>
  )
}

function Row({ label, hint, children }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <div className="min-w-0">
        <div className="text-[13px] font-medium text-[#F0EFEC]">{label}</div>
        {hint && <div className="text-[12px] text-[#85837E] mt-0.5">{hint}</div>}
      </div>
      <div className="shrink-0 flex items-center gap-2">{children}</div>
    </div>
  )
}

function CustomSelect({ value, onChange, options, width = "w-[176px]" }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const current = options.find(o => String(o.value) === String(value))
  useEffect(() => {
    const handle = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener("mousedown", handle)
    return () => document.removeEventListener("mousedown", handle)
  }, [])
  return (
    <div ref={ref} className={`relative ${width}`}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full h-8 px-3 flex items-center justify-between gap-2 bg-[#1D1C1A] border border-[#3B3A36] rounded-[6px] text-[13px] text-[#F0EFEC] hover:border-[#4A4944] hover:bg-[#232220] focus:outline-none focus:border-[#4A90E2] focus:ring-1 focus:ring-[#4A90E2]/30 transition-colors"
      >
        <span className="truncate">{current?.label ?? value}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-[#85837E] shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute z-20 top-[calc(100%+6px)] left-0 w-full bg-[#1D1C1A] border border-[#3B3A36] rounded-[8px] shadow-[0_8px_24px_rgba(0,0,0,0.55)] overflow-hidden py-1 max-h-[220px] overflow-y-auto">
          {options.map(opt => {
            const active = String(opt.value) === String(value)
            return (
              <button
                key={String(opt.value)}
                onClick={() => { onChange(opt.value); setOpen(false) }}
                className={`w-full text-left px-3 py-[7px] text-[13px] flex items-center justify-between gap-2 hover:bg-[#292824] transition-colors ${active ? "bg-[#292824] text-[#F0EFEC]" : "text-[#B7B5B0] hover:text-[#F0EFEC]"}`}
              >
                <span>{opt.label}</span>
                {active && <Check className="w-3.5 h-3.5 text-[#4A90E2] shrink-0" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function SettingsPage() {
  const { t } = useTranslation()
  const [settings, setSettings] = useState(() => loadSettings())
  const [googleAccount, setGoogleAccount] = useState(() => {
    try { const v = localStorage.getItem(LS_GOOGLE); return v ? JSON.parse(v) : null } catch { return null }
  })
  const [linking, setLinking] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [lastSynced, setLastSynced] = useState(() => {
    try { return localStorage.getItem(LS_LAST_SYNC) } catch { return null }
  })
  const [cloudMeta, setCloudMeta] = useState(() => {
    try { const v = localStorage.getItem(LS_CLOUD); return v ? JSON.parse(v) : null } catch { return null }
  })
  const [showUnlink, setShowUnlink] = useState(false)
  const [themeSearch, setThemeSearch] = useState("")
  const [resetEditorOpen, setResetEditorOpen] = useState(false)
  const fileRef = useRef(null)
  const importRef = useRef(null)

  // persist settings
  useEffect(() => {
    try { localStorage.setItem(LS_SETTINGS, JSON.stringify(settings)) } catch {}
    try { window.dispatchEvent(new Event("deck:settings:update")) } catch {}
    // auto-sync if linked & enabled
    if (googleAccount && settings.sync.autoSync) {
      const t = setTimeout(() => doSync(false), 800)
      return () => clearTimeout(t)
    }
  }, [settings])

  useEffect(() => {
    try {
      if (googleAccount) localStorage.setItem(LS_GOOGLE, JSON.stringify(googleAccount))
      else localStorage.removeItem(LS_GOOGLE)
    } catch {}
  }, [googleAccount])

  const update = (path, value) => {
    setSettings(s => {
      const next = structuredClone ? structuredClone(s) : JSON.parse(JSON.stringify(s))
      const parts = path.split(".")
      let cur = next
      for (let i = 0; i < parts.length - 1; i++) cur = cur[parts[i]]
      cur[parts[parts.length - 1]] = value
      return next
    })
    // toast for any change
    try {
      const labelMap = {
        "language": t("settings.general.languageLabel"),
        "theme": t("settings.general.themeLabel"),
        "editor.defaultLimit": t("settings.editor.defaultLimitLabel"),
        "editor.monacoTheme": t("settings.editor.themeLabel"),
        "editor.fontSize": t("settings.editor.fontSizeLabel"),
        "editor.wordWrap": t("settings.editor.wordWrapLabel"),
        "editor.autocomplete": t("settings.editor.autocompleteLabel"),
        "editor.confirmDestructive": t("settings.editor.confirmLabel"),
        "editor.showGridLines": t("settings.editor.gridLinesLabel"),
        "editor.showRowNumbers": t("settings.appearance.rowNumbersLabel"),
        "editor.minimap": t("settings.appearance.minimapLabel"),
        "notifications.queries": t("settings.notifications.queryFinished"),
        "notifications.sync": t("settings.notifications.syncCompleted"),
        "notifications.connection": t("settings.notifications.connectionLost"),
        "notifications.desktop": t("settings.notifications.desktop"),
        "privacy.telemetry": t("settings.privacy.telemetryLabel"),
        "privacy.crashReports": t("settings.privacy.crashLabel"),
        "privacy.analytics": t("settings.privacy.analyticsLabel"),
        "navigation.showApi": "Show API section",
      }
      const label = labelMap[path] || path
      let valueLabel = String(value)
      if (path === "language") valueLabel = value === "fr" ? t("settings.general.french") : t("settings.general.english")
      else if (path === "theme") valueLabel = value === "dark" ? t("settings.general.dark") : value === "light" ? t("settings.general.light") : value === "vercel" ? "Vercel" : value === "github" ? "GitHub" : value === "pink" ? "Pink" : value === "supabase" ? "Supabase" : value === "claude" ? "Claude Code" : value === "oled" ? "OLED" : t("settings.general.system")
      else if (path === "editor.defaultLimit") valueLabel = `${value} ${t("settings.editor.rowsSuffix")}`
      else if (path === "editor.monacoTheme") { try { valueLabel = getThemeLabel(value) } catch { valueLabel = String(value) } }
      else if (path === "editor.fontSize") valueLabel = `${value}px`
      else if (typeof value === "boolean") valueLabel = value ? t("common.enabled") : t("common.disabled")
      const msg = `${label} → ${valueLabel}`
      toast.success(msg, { id: `setting-${path}`, description: t("toasts.settingUpdated"), duration: 1800 })
    } catch {}
  }

  const doSync = async (showToast = true) => {
    if (!googleAccount) {
      if (showToast) toast.error(t("toasts.linkFirst"))
      return
    }
    setSyncing(true)
    await new Promise(r => setTimeout(r, 1100))
    try {
      const payload = {
        settings,
        selectedTable: localStorage.getItem(LS_TABLE),
        activeTab: localStorage.getItem(LS_TAB),
        schema: (() => { try { return { zoom: localStorage.getItem("deck:schema:zoom"), offset: localStorage.getItem("deck:schema:offset"), positions: localStorage.getItem("deck:schema:positions") } } catch { return null } })(),
        logsCount: (() => { try { const v = localStorage.getItem("deck:api:logs"); return v ? JSON.parse(v).length : 0 } catch { return 0 } })(),
      }
      const meta = { payload, syncedAt: new Date().toISOString(), bytes: JSON.stringify(payload).length, account: googleAccount.email }
      localStorage.setItem(LS_CLOUD, JSON.stringify(meta))
      localStorage.setItem(LS_LAST_SYNC, meta.syncedAt)
      setCloudMeta(meta)
      setLastSynced(meta.syncedAt)
      if (showToast) toast.success(t("toasts.syncedToDrive"))
    } catch (e) {
      if (showToast) toast.error(t("toasts.syncFailed") + ": " + e.message)
    } finally { setSyncing(false) }
  }

  const handleLink = async () => {
    setLinking(true)
    await new Promise(r => setTimeout(r, 900))
    const mock = {
      id: "google_" + Math.random().toString(36).slice(2, 8),
      name: "Alex Morgan",
      email: "alex.morgan@gmail.com",
      avatar: "https://i.pravatar.cc/150?img=12",
      linkedAt: new Date().toISOString(),
      provider: "google",
    }
    setGoogleAccount(mock)
    setLinking(false)
    toast.success(t("toasts.googleLinked"))
    // initial sync
    setTimeout(() => doSync(false), 400)
  }

  const handleUnlink = () => {
    setGoogleAccount(null)
    localStorage.removeItem(LS_CLOUD)
    localStorage.removeItem(LS_LAST_SYNC)
    setCloudMeta(null)
    setLastSynced(null)
    setShowUnlink(false)
    toast.success(t("toasts.googleUnlinked"))
  }

  const handleExport = () => {
    try {
      const data = {
        deck: "export",
        exportedAt: new Date().toISOString(),
        version: 1,
        settings,
        googleAccount,
        state: {
          selectedTable: localStorage.getItem(LS_TABLE),
          activeTab: localStorage.getItem(LS_TAB),
        },
        cloud: cloudMeta,
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `deck-settings-${new Date().toISOString().slice(0,10)}.json`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      toast.success(t("toasts.settingsExported"))
    } catch (e) { toast.error(e.message) }
  }

  const handleImport = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const j = JSON.parse(String(reader.result))
        if (j.settings) setSettings({ ...DEFAULT_SETTINGS, ...j.settings, editor: { ...DEFAULT_SETTINGS.editor, ...(j.settings.editor||{}) }, sync: { ...DEFAULT_SETTINGS.sync, ...(j.settings.sync||{}) }, notifications: { ...DEFAULT_SETTINGS.notifications, ...(j.settings.notifications||{}) }, privacy: { ...DEFAULT_SETTINGS.privacy, ...(j.settings.privacy||{}) } })
        if (j.googleAccount) setGoogleAccount(j.googleAccount)
        if (j.state?.selectedTable) localStorage.setItem(LS_TABLE, j.state.selectedTable)
        if (j.state?.activeTab) localStorage.setItem(LS_TAB, j.state.activeTab)
        toast.success(t("toasts.settingsImported"))
      } catch (err) { toast.error(t("toasts.invalidFile") + ": " + err.message) }
      e.target.value = ""
    }
    reader.readAsText(f)
  }

  const handleClear = () => {
    if (!confirm("Clear all Deck local data? This removes tables cache, tabs, schema layout and settings (keeps connection).")) return
    const keepKeys = []
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k && k.startsWith("deck:")) keepKeys.push(k)
      }
      keepKeys.forEach(k => localStorage.removeItem(k))
      localStorage.removeItem(LS_CLOUD)
      localStorage.removeItem(LS_LAST_SYNC)
      localStorage.removeItem(LS_GOOGLE)
      setSettings(DEFAULT_SETTINGS)
      setGoogleAccount(null)
      setCloudMeta(null)
      setLastSynced(null)
      toast.success(t("toasts.localCleared"))
    } catch (e) { toast.error(e.message) }
  }

  const handleReset = () => {
    if (!confirm("Reset settings to defaults?")) return
    setSettings(DEFAULT_SETTINGS)
    toast.success(t("toasts.resetDefaults"))
  }

  const handleResetEditor = () => {
    setSettings(s => ({ ...s, editor: { ...DEFAULT_SETTINGS.editor } }))
    setResetEditorOpen(false)
    toast.success(t("toasts.editorReset"))
  }

  const lastSyncedStr = lastSynced ? new Date(lastSynced).toLocaleString() : "Never"
  const isLinked = !!googleAccount

  return (
    <div className="h-screen flex flex-col bg-[#292824] overflow-hidden">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <LeftNav />
        <div className="flex-1 bg-[#1D1C1A] overflow-auto">
          <div className="max-w-[960px] mx-auto p-6 md:p-7">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-[22px] font-semibold text-[#F0EFEC] flex items-center gap-2.5">
                  <span className="w-9 h-9 rounded-[9px] bg-[#292824] border border-[#3B3A36] flex items-center justify-center"><Settings className="w-4.5 h-4.5 text-[#B7B5B0]" /></span>
                  {t("settings.title")}
                </h1>
                <p className="text-[13px] text-[#85837E] mt-2 max-w-[560px] leading-relaxed">{t("settings.subtitle")}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={handleExport} className="h-9 px-3.5 flex items-center gap-1.5 bg-[#292824] border border-[#3B3A36] rounded-[7px] text-[13px] font-medium text-[#B7B5B0] hover:bg-[#232220] hover:text-[#F0EFEC]">
                  <Download className="w-4 h-4" /> {t("settings.export")}
                </button>
                <button onClick={() => importRef.current?.click()} className="h-9 px-3.5 flex items-center gap-1.5 bg-[#292824] border border-[#3B3A36] rounded-[7px] text-[13px] font-medium text-[#B7B5B0] hover:bg-[#232220] hover:text-[#F0EFEC]">
                  <Upload className="w-4 h-4" /> {t("settings.import")}
                </button>
                <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
              </div>
            </div>

            {/* Google Account — HERO */}
            <div className="mt-7 border border-[#3B3A36] rounded-[12px] overflow-hidden bg-[#292824]">
              <div className="bg-gradient-to-r from-[#1D1C1A] via-[#292824] to-[#1D1C1A] border-b border-[#3B3A36] px-5 py-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center p-1.5 shrink-0"><Google className="w-full h-full" /></div>
                <div>
                  <div className="text-[13px] font-semibold tracking-widest text-[#F0EFEC] flex items-center gap-2">{t("settings.google.title").toUpperCase()} <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${isLinked ? "bg-[rgba(34,197,94,0.12)] border-[#16803A] text-[#22C55E]" : "bg-[#1D1C1A] border-[#3B3A36] text-[#85837E]"}`}>{isLinked ? t("settings.google.linked").toUpperCase() : t("settings.google.notLinked").toUpperCase()}</span></div>
                  <div className="text-[12.5px] text-[#B7B5B0]">{t("settings.google.subtitle")}</div>
                </div>
                {isLinked && (
                  <span className="ml-auto hidden md:flex items-center gap-1.5 text-[11px] font-medium text-[#22C55E] bg-[rgba(34,197,94,0.08)] border border-[#16803A]/40 rounded-full px-2.5 py-1"><CheckCircle className="w-3.5 h-3.5" /> {t("settings.google.autoSyncOn")}</span>
                )}
              </div>

              {!isLinked ? (
                <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-6 p-5 md:p-6">
                  <div>
                    <h3 className="text-[16px] font-semibold text-[#F0EFEC]">{t("settings.google.linkTitle")}</h3>
                    <p className="text-[13px] text-[#B7B5B0] mt-1.5 leading-relaxed">{t("settings.google.linkDesc")}</p>
                    <ul className="mt-4 space-y-2">
                      {[
                        t("settings.google.syncFeature1"),
                        t("settings.google.syncFeature2"),
                        t("settings.google.syncFeature3"),
                        t("settings.google.syncFeature4"),
                      ].map(feat => (
                        <li key={feat} className="flex items-start gap-2 text-[13px] text-[#D6D4CF]"><span className="w-5 h-5 rounded-full bg-[rgba(34,197,94,0.12)] border border-[#16803A]/30 flex items-center justify-center shrink-0 mt-0.5"><Check className="w-3 h-3 text-[#22C55E]" /></span>{feat}</li>
                      ))}
                    </ul>
                    <button
                      onClick={handleLink}
                      disabled={linking}
                      className="mt-5 w-full md:w-auto h-10 px-5 bg-white hover:bg-[#f8f8f8] disabled:opacity-60 text-[#1D1C1A] rounded-[8px] text-[13px] font-semibold flex items-center justify-center gap-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.2)]"
                    >
                      {linking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Google className="w-5 h-5" />}
                      {linking ? t("settings.google.linking") : t("settings.google.continueWithGoogle")}
                    </button>
                    <p className="text-[11px] text-[#66645F] mt-2.5 flex items-center gap-1.5"><Lock className="w-3 h-3" /> {t("settings.google.privacy")}</p>
                  </div>
                  <div className="bg-[#1D1C1A] border border-[#3B3A36] rounded-[10px] p-4">
                    <div className="text-[11px] tracking-widest font-medium text-[#85837E]">{t("settings.google.whatSaved")}</div>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      {[
                        { icon: Database, label: t("settings.google.tablesTabs"), sub: t("settings.google.tablesTabsSub") },
                        { icon: Code2, label: "Editor", sub: t("settings.google.editorSub") },
                        { icon: SlidersHorizontal, label: "Preferences", sub: t("settings.google.preferencesSub") },
                        { icon: History, label: "Schema", sub: t("settings.google.schemaSub") },
                      ].map(c => (
                        <div key={c.label} className="bg-[#292824] border border-[#3B3A36] rounded-[8px] p-3">
                          <c.icon className="w-4 h-4 text-[#B7B5B0]" />
                          <div className="text-[12px] font-medium text-[#F0EFEC] mt-1.5">{c.label}</div>
                          <div className="text-[11px] text-[#85837E]">{c.sub}</div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-[11px] text-[#85837E] bg-[#292824] border border-[#3B3A36] rounded-[6px] px-2.5 py-2"><Info className="w-3.5 h-3.5 shrink-0" /> {t("settings.google.localFirst")}</div>
                  </div>
                </div>
              ) : (
                <div className="p-5 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <img src={googleAccount.avatar} alt="avatar" className="w-12 h-12 rounded-full border border-[#3B3A36] object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="text-[14px] font-semibold text-[#F0EFEC] flex items-center gap-2">{googleAccount.name} <span className="w-4 h-4 rounded-full bg-[#4285F4] flex items-center justify-center"><Check className="w-2.5 h-2.5 text-white" /></span></div>
                      <div className="text-[13px] text-[#B7B5B0] truncate">{googleAccount.email}</div>
                      <div className="text-[11px] text-[#85837E] mt-0.5">{t("settings.google.linked")} {new Date(googleAccount.linkedAt).toLocaleDateString()} • Google Drive appDataFolder</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => doSync(true)} disabled={syncing} className="h-9 px-4 bg-[#4A90E2] hover:bg-[#3a7bc8] disabled:opacity-60 text-white rounded-[7px] text-[13px] font-medium flex items-center gap-1.5">
                        {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} {syncing ? t("settings.google.syncing") : t("settings.google.syncNow")}
                      </button>
                      <button onClick={() => setShowUnlink(true)} className="h-9 px-3.5 bg-[#1D1C1A] border border-[#3B3A36] rounded-[7px] text-[13px] font-medium text-[#B7B5B0] hover:text-[#F0EFEC] flex items-center gap-1.5"><LogOut className="w-4 h-4" /> {t("settings.google.unlink")}</button>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-[#1D1C1A] border border-[#3B3A36] rounded-[8px] p-3">
                      <div className="text-[11px] tracking-widest text-[#85837E]">{t("settings.google.lastSynced").toUpperCase()}</div>
                      <div className="text-[13px] font-medium text-[#F0EFEC] mt-1">{lastSyncedStr}</div>
                      <div className="text-[11px] text-[#85837E] flex items-center gap-1 mt-1"><Zap className="w-3 h-3" /> {cloudMeta ? `${(cloudMeta.bytes/1024).toFixed(1)} ${t("settings.google.pushed")}` : "—"}</div>
                    </div>
                    <div className="bg-[#1D1C1A] border border-[#3B3A36] rounded-[8px] p-3">
                      <div className="text-[11px] tracking-widest text-[#85837E]">{t("settings.google.backupSize").toUpperCase()}</div>
                      <div className="text-[13px] font-medium text-[#F0EFEC] mt-1">{cloudMeta ? (cloudMeta.bytes/1024).toFixed(1) + " KB" : "—"}</div>
                      <div className="text-[11px] text-[#85837E] mt-1">{t("settings.google.drivePath")}</div>
                    </div>
                    <div className="bg-[#1D1C1A] border border-[#3B3A36] rounded-[8px] p-3">
                      <div className="text-[11px] tracking-widest text-[#85837E]">{t("settings.google.itemsSaved").toUpperCase()}</div>
                      <div className="text-[13px] font-medium text-[#F0EFEC] mt-1">6 keys</div>
                      <div className="text-[11px] text-[#85837E] mt-1 truncate">{t("settings.google.keys")}</div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-[#85837E]">
                    <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> {t("settings.google.encrypted")}</span>
                    <span className="w-1 h-1 rounded-full bg-[#3B3A36]" />
                    <a href="https://drive.google.com/drive/my-drive" target="_blank" rel="noreferrer" className="text-[#4A90E2] hover:underline">{t("settings.google.openDrive")}</a>
                  </div>
                </div>
              )}
            </div>

            {/* spacer between Google account and General */}
            <div className="h-8" />

            {/* General */}
            <SectionCard icon={Globe} title={t("settings.general.title")} desc={t("settings.general.desc")} >
              <Row label={t("settings.general.languageLabel")} hint={t("settings.general.languageHint")}>
                <CustomSelect
                  value={settings.language}
                  onChange={v => update("language", v)}
                  options={[
                    { value: "en", label: t("settings.general.english") },
                    { value: "fr", label: t("settings.general.french") },
                  ]}
                  width="w-[160px]"
                />
              </Row>
              <Row label={t("settings.general.themeLabel")} hint={t("settings.general.themeHint")}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <div className="flex items-center gap-1 p-1 bg-[#1D1C1A] border border-[#3B3A36] rounded-[7px]">
                    {[
                      { id: "dark", label: t("settings.general.dark"), icon: Moon },
                      { id: "light", label: t("settings.general.light"), icon: Sun },
                      { id: "system", label: t("settings.general.system"), icon: Monitor },
                    ].map(o => (
                      <button key={o.id} onClick={()=> update("theme", o.id)} className={`h-7 px-3 rounded-[6px] text-[12px] font-medium flex items-center gap-1.5 ${settings.theme===o.id ? "bg-[#292824] border border-[#3B3A36] text-[#F0EFEC]" : "text-[#85837E] hover:text-[#B7B5B0]"}`}>
                        <o.icon className="w-3.5 h-3.5" /> {o.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] tracking-wide text-[#66645F] hidden sm:inline">or</span>
                    <CustomSelect
                      value={["vercel","github","pink","supabase","claude","oled"].includes(settings.theme) ? settings.theme : "__none__"}
                      onChange={v => update("theme", v === "__none__" ? "dark" : v)}
                      options={[
                        { value: "__none__", label: "Custom theme" },
                        { value: "vercel", label: "Vercel" },
                        { value: "github", label: "GitHub" },
                        { value: "pink", label: "Pink" },
                        { value: "supabase", label: "Supabase" },
                        { value: "claude", label: "Claude Code" },
                        { value: "oled", label: "OLED" },
                      ]}
                      width="w-[170px]"
                    />
                  </div>
                </div>
              </Row>
            </SectionCard>

            {/* Navigation */}
            <div className="mt-6">
              <SectionCard icon={Layers} title="Navigation" desc="Control which sections appear in the sidebar.">
                <Row label="Show API section" hint="Show the Developer / API group (Overview, Endpoints, Examples, Playground) in the left navigation.">
                  <Toggle checked={settings.navigation?.showApi ?? true} onChange={v=> update("navigation.showApi", v)} />
                </Row>
              </SectionCard>
            </div>

            {/* Editor */}
            <div className="mt-6">
              <SectionCard icon={Code2} title={t("settings.editor.title")} desc={t("settings.editor.desc")}>
                <Row label={t("settings.editor.defaultLimitLabel")} hint={t("settings.editor.defaultLimitHint")}>
                  <CustomSelect
                    value={settings.editor.defaultLimit}
                    onChange={v => update("editor.defaultLimit", Number(v))}
                    options={[25,50,100,250,500,1000].map(n => ({ value: n, label: `${n} rows` }))}
                    width="w-[132px]"
                  />
                </Row>

                <Row label={t("settings.editor.themeLabel")} hint={t("settings.editor.themeHint").replace("51", String(MONACO_THEMES.length))}>
                  <CustomSelect
                    value={settings.editor.monacoTheme}
                    onChange={v => update("editor.monacoTheme", v)}
                    options={MONACO_THEMES.map(t => ({ value: t.id, label: t.label }))}
                    width="w-[220px]"
                  />
                </Row>

                {/* Theme gallery with search */}
                <div className="space-y-3 border border-[#3B3A36] rounded-[8px] bg-[#1D1C1A] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-[12px] font-medium text-[#B7B5B0]"><Paintbrush className="w-3.5 h-3.5" /> {t("settings.editor.themeGallery")}</div>
                    <span className="text-[11px] text-[#85837E] font-mono">{MONACO_THEMES.length} {t("settings.editor.themeCount")} • {getThemeLabel(settings.editor.monacoTheme)}</span>
                  </div>
                  <div className="relative">
                    <Search className="w-4 h-4 text-[#85837E] absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      value={themeSearch}
                      onChange={e=> setThemeSearch(e.target.value)}
                      placeholder={t("settings.editor.searchPlaceholder")}
                      className="w-full h-8 pl-8 pr-3 bg-[#292824] border border-[#3B3A36] rounded-[6px] text-[13px] placeholder:text-[#85837E] text-[#F0EFEC] focus:outline-none focus:border-[#4A4944]"
                    />
                    {themeSearch && <button onClick={()=> setThemeSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-[4px] hover:bg-[#3B3935] text-[#85837E]"><X className="w-3.5 h-3.5" /></button>}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[380px] overflow-auto pr-1 -mr-1 custom-scrollbar">
                    {(() => {
                      const q = themeSearch.toLowerCase().trim()
                      const filtered = q ? MONACO_THEMES.filter(t => t.label.toLowerCase().includes(q) || t.id.toLowerCase().includes(q)) : MONACO_THEMES
                      if (!filtered.length) return <div className="col-span-2 text-center py-8 text-[13px] text-[#85837E]">{t("settings.editor.noMatch")} “{themeSearch}”</div>
                      return filtered.map(th => {
                        const active = settings.editor.monacoTheme === th.id
                        const bg = getThemeBg(th.id)
                        const isLight = th.base === "vs" || th.base === "hc-light"
                        return (
                          <button
                            key={th.id}
                            onClick={() => update("editor.monacoTheme", th.id)}
                            className={`text-left flex items-center gap-3 p-2.5 rounded-[7px] border transition-colors ${active ? "bg-[#292824] border-[#4A90E2] ring-1 ring-[#4A90E2]/30" : "bg-[#292824] border-[#3B3A36] hover:border-[#4A4944] hover:bg-[#232220]"}`}
                          >
                            <div className="w-10 h-8 rounded-[5px] border border-[#3B3A36] shrink-0 flex flex-col justify-center gap-[3px] px-1.5 py-1 overflow-hidden" style={{ background: bg }}>
                              <div className="h-[2px] w-[70%] rounded-full" style={{ background: isLight ? "#00000022" : "#ffffff33" }} />
                              <div className="h-[2px] w-[90%] rounded-full" style={{ background: isLight ? "#00000015" : "#ffffff22" }} />
                              <div className="h-[2px] w-[55%] rounded-full" style={{ background: isLight ? "#00000018" : "#ffffff18" }} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-[13px] font-medium leading-none truncate" style={{ color: active ? "#F0EFEC" : "#D6D4CF" }}>{th.label}</div>
                              <div className="text-[11px] font-mono text-[#85837E] truncate mt-1">{th.id} • {th.base}</div>
                            </div>
                            <span className="w-3 h-3 rounded-full border shrink-0" style={{ background: bg, borderColor: active ? "#4A90E2" : "#3B3A36" }} />
                            {active && <Check className="w-4 h-4 text-[#4A90E2] shrink-0" />}
                          </button>
                        )
                      })
                    })()}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-[#85837E] bg-[#292824] border border-[#3B3A36] rounded-[6px] px-2.5 py-2"><Sparkles className="w-3.5 h-3.5 text-[#EAB308] shrink-0" /> {t("settings.editor.hintTheme")}</div>
                </div>

                <Row label={t("settings.editor.fontSizeLabel")} hint={t("settings.editor.fontSizeHint")}>
                  <div className="flex items-center gap-2">
                    <button onClick={()=> update("editor.fontSize", Math.max(11, settings.editor.fontSize-1))} className="w-7 h-7 flex items-center justify-center bg-[#1D1C1A] border border-[#3B3A36] rounded-[6px] text-[#B7B5B0] hover:text-[#F0EFEC]">−</button>
                    <span className="w-10 text-center text-[13px] font-mono text-[#F0EFEC]">{settings.editor.fontSize}px</span>
                    <button onClick={()=> update("editor.fontSize", Math.min(18, settings.editor.fontSize+1))} className="w-7 h-7 flex items-center justify-center bg-[#1D1C1A] border border-[#3B3A36] rounded-[6px] text-[#B7B5B0] hover:text-[#F0EFEC]">+</button>
                  </div>
                </Row>
                <Row label={t("settings.editor.wordWrapLabel")} hint={t("settings.editor.wordWrapHint")}>
                  <Toggle checked={settings.editor.wordWrap} onChange={v=> update("editor.wordWrap", v)} />
                </Row>
                <Row label={t("settings.editor.autocompleteLabel")} hint={t("settings.editor.autocompleteHint")}>
                  <Toggle checked={settings.editor.autocomplete} onChange={v=> update("editor.autocomplete", v)} />
                </Row>
                <Row label={t("settings.editor.confirmLabel")} hint={t("settings.editor.confirmHint")}>
                  <Toggle checked={settings.editor.confirmDestructive} onChange={v=> update("editor.confirmDestructive", v)} />
                </Row>
                <Row label={t("settings.editor.gridLinesLabel")} hint={t("settings.editor.gridLinesHint")}>
                  <Toggle checked={settings.editor.showGridLines} onChange={v=> update("editor.showGridLines", v)} />
                </Row>
                <div className="pt-3 mt-1 border-t border-[#3B3A36] flex items-center justify-between">
                  <div className="text-[12px] text-[#85837E]">{t("settings.editor.resetHint")}</div>
                  <button onClick={() => setResetEditorOpen(true)} className="h-8 px-3 flex items-center gap-1.5 bg-[#1D1C1A] border border-[#3B3A36] rounded-[6px] text-[12px] font-medium text-[#B7B5B0] hover:bg-[#232220] hover:text-[#F0EFEC] hover:border-[#4A4944]">
                    <RotateCcw className="w-3.5 h-3.5" /> {t("settings.editor.resetToDefault")}
                  </button>
                </div>
              </SectionCard>
            </div>

            {/* Appearance */}
            <div className="mt-6">
              <SectionCard icon={Palette} title={t("settings.appearance.title")} desc={t("settings.appearance.desc")}>
                <Row label={t("settings.appearance.rowNumbersLabel")} hint={t("settings.appearance.rowNumbersHint")}>
                  <Toggle checked={settings.editor.showRowNumbers ?? true} onChange={v=> update("editor.showRowNumbers", v)} />
                </Row>
                <Row label={t("settings.appearance.minimapLabel")} hint={t("settings.appearance.minimapHint")}>
                  <Toggle checked={settings.editor.minimap} onChange={v=> update("editor.minimap", v)} />
                </Row>
                <div className="flex items-center gap-2 text-[12px] text-[#85837E] bg-[#1D1C1A] border border-[#3B3A36] rounded-[6px] px-3 py-2.5"><Sparkles className="w-4 h-4 text-[#EAB308]" /> {t("settings.appearance.proTip")}</div>
              </SectionCard>
            </div>

            {/* Notifications */}
            <div className="mt-6">
              <SectionCard icon={Bell} title={t("settings.notifications.title")} desc={t("settings.notifications.desc")}>
                <Row label={t("settings.notifications.queryFinished")} hint={t("settings.notifications.queryFinishedHint")}><Toggle checked={settings.notifications.queries} onChange={v=> update("notifications.queries", v)} /></Row>
                <Row label={t("settings.notifications.syncCompleted")} hint={t("settings.notifications.syncCompletedHint")}><Toggle checked={settings.notifications.sync} onChange={v=> update("notifications.sync", v)} /></Row>
                <Row label={t("settings.notifications.connectionLost")} hint={t("settings.notifications.connectionLostHint")}><Toggle checked={settings.notifications.connection} onChange={v=> update("notifications.connection", v)} /></Row>
                <Row label={t("settings.notifications.desktop")} hint={t("settings.notifications.desktopHint")}>
                  <Toggle checked={settings.notifications.desktop} onChange={async v=> {
                    if (v && "Notification" in window) {
                      const perm = await Notification.requestPermission()
                      update("notifications.desktop", perm==="granted")
                      if (perm!=="granted") toast.error(t("toasts.permissionDenied"))
                    } else update("notifications.desktop", v)
                  }} />
                </Row>
              </SectionCard>
            </div>

            {/* Data management */}
            <div className="mt-6">
              <SectionCard icon={FileJson} title={t("settings.data.title")} desc={t("settings.data.desc")}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button onClick={handleExport} className="h-10 flex items-center justify-center gap-2 bg-[#4A90E2] hover:bg-[#3a7bc8] text-white rounded-[7px] text-[13px] font-medium"><Download className="w-4 h-4" /> {t("settings.data.exportBackup")}</button>
                  <button onClick={() => fileRef.current?.click()} className="h-10 flex items-center justify-center gap-2 bg-[#292824] border border-[#3B3A36] hover:bg-[#232220] text-[#F0EFEC] rounded-[7px] text-[13px] font-medium"><Upload className="w-4 h-4" /> {t("settings.data.importBackup")}</button>
                  <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
                  <button onClick={handleClear} className="h-10 flex items-center justify-center gap-2 bg-[#1D1C1A] border border-[#7f1d1d] text-[#fca5a5] hover:bg-[#2a1a1a] rounded-[7px] text-[13px] font-medium"><Trash2 className="w-4 h-4" /> {t("settings.data.clearAll")}</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={handleReset} className="h-8 px-3 bg-[#1D1C1A] border border-[#3B3A36] rounded-[6px] text-[12px] font-medium text-[#B7B5B0] hover:text-[#F0EFEC]">{t("settings.data.resetDefaults")}</button>
                  <span className="text-[11px] text-[#66645F] flex items-center">{t("settings.data.lastExportNever")} • {t("settings.data.storedLocally")} + {isLinked ? t("settings.data.drive") : t("settings.data.notInDrive")}</span>
                </div>
              </SectionCard>
            </div>

            {/* Danger zone footer */}
            <div className="mt-6 border border-[#3B3A36]/60 rounded-[9px] bg-[#1D1C1A]/50 px-4 py-3 flex items-center justify-between">
              <div className="text-[11px] text-[#85837E]">Deck • PostgreSQL on deck • <span className="font-mono text-[#66645F]">v{APP_VERSION}</span> • <a className="text-[#4A90E2] hover:underline" href="#">{t("settings.footer.docs")}</a> • <a className="text-[#4A90E2] hover:underline" href="#">{t("settings.footer.changelog")}</a></div>
              <div className="text-[11px] text-[#66645F] hidden md:block">{t("settings.footer.crafted")}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Reset editor confirm */}
      {resetEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[2px]">
          <div className="w-full max-w-[420px] bg-[#292824] border border-[#3B3A36] rounded-[12px] overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
            <div className="p-5">
              <div className="w-10 h-10 rounded-full bg-[#1D1C1A] border border-[#3B3A36] flex items-center justify-center"><RotateCcw className="w-5 h-5 text-[#B7B5B0]" /></div>
              <h3 className="text-[15px] font-semibold text-[#F0EFEC] mt-3">{t("settings.editor.resetDialogTitle")}</h3>
              <p className="text-[13px] text-[#B7B5B0] mt-1.5 leading-relaxed">{t("settings.editor.resetDialogDesc")} <span className="font-mono text-[#F0EFEC]">{t("settings.editor.resetDialogValues")}</span></p>
              <div className="mt-3 p-2.5 bg-[#1D1C1A] border border-[#3B3A36] rounded-[6px] text-[11px] font-mono text-[#85837E]">{t("settings.editor.resetDialogCurrent")}: {settings.editor.monacoTheme} • {settings.editor.fontSize}px • {settings.editor.wordWrap ? t("settings.editor.wrapOn") : t("settings.editor.wrapOff")} • {settings.editor.autocomplete ? t("settings.editor.autocompleteOn") : t("settings.editor.autocompleteOff")}</div>
            </div>
            <div className="px-5 py-3 bg-[#1D1C1A] border-t border-[#3B3A36] flex items-center justify-end gap-2">
              <button onClick={()=> setResetEditorOpen(false)} className="h-8 px-4 bg-[#292824] border border-[#3B3A36] rounded-[6px] text-[13px] font-medium text-[#B7B5B0] hover:text-[#F0EFEC]">{t("common.cancel")}</button>
              <button onClick={handleResetEditor} className="h-8 px-4 bg-[#4A90E2] hover:bg-[#3a7bc8] text-white rounded-[6px] text-[13px] font-medium">{t("settings.editor.resetToDefault")}</button>
            </div>
          </div>
        </div>
      )}

      {/* Unlink confirm */}
      {showUnlink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[2px]">
          <div className="w-full max-w-[420px] bg-[#292824] border border-[#3B3A36] rounded-[12px] overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
            <div className="p-5">
              <div className="w-10 h-10 rounded-full bg-[#1D1C1A] border border-[#3B3A36] flex items-center justify-center"><LogOut className="w-5 h-5 text-[#EF4444]" /></div>
              <h3 className="text-[15px] font-semibold text-[#F0EFEC] mt-3">{t("settings.google.unlink")}? </h3>
              <p className="text-[13px] text-[#B7B5B0] mt-1.5 leading-relaxed">{t("settings.google.localFirst")}</p>
              <div className="mt-4 bg-[#1D1C1A] border border-[#3B3A36] rounded-[7px] px-3 py-2.5 flex items-center gap-3">
                <img src={googleAccount?.avatar} alt="" className="w-8 h-8 rounded-full" />
                <div><div className="text-[13px] font-medium text-[#F0EFEC]">{googleAccount?.name}</div><div className="text-[12px] text-[#85837E]">{googleAccount?.email}</div></div>
              </div>
            </div>
            <div className="px-5 py-3 bg-[#1D1C1A] border-t border-[#3B3A36] flex items-center justify-end gap-2">
              <button onClick={()=> setShowUnlink(false)} className="h-8 px-4 bg-[#292824] border border-[#3B3A36] rounded-[6px] text-[13px] font-medium text-[#B7B5B0] hover:text-[#F0EFEC]">{t("common.cancel")}</button>
              <button onClick={handleUnlink} className="h-8 px-4 bg-[#EF4444] hover:bg-[#dc2626] text-white rounded-[6px] text-[13px] font-medium">{t("settings.google.unlink")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
