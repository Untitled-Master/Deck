import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useConnection } from "@/context/ConnectionContext"
import { Database, PlugZap, Loader2, Check, AlertCircle, Eye, EyeOff, Terminal, Shield, Boxes, Activity } from "lucide-react"
import DeckLogo from "@/components/DeckLogo"

export default function ConnectPage() {
  const { connect, connected } = useConnection()
  const nav = useNavigate()
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [form, setForm] = useState({
    host: "localhost",
    port: "5432",
    database: "mydb",
    user: "postgres",
    password: "280823",
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)
    try {
      const res = await connect(form)
      setSuccess(`Connected — PostgreSQL ${res.serverVersion ?? ""}`)
      setTimeout(() => nav("/", { replace: true }), 500)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#1D1C1A] flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-[960px] grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
        {/* Left branding */}
        <div className="hidden lg:flex flex-col gap-6">
          <div className="bg-[#292824] border border-[#3B3A36] rounded-[9px] p-6">
            <div className="flex items-center gap-3">
              <DeckLogo className="w-8 h-8 text-[#F0EFEC]" />
              <div>
                <div className="text-[16px] font-semibold tracking-tight text-[#F0EFEC]">Deck</div>
                <div className="text-[11px] tracking-widest text-[#85837E]">Your database, on deck.</div>
              </div>
            </div>
            <p className="text-[13px] leading-relaxed text-[#B7B5B0] mt-4">
              Local PostgreSQL control. Dense, monochrome, developer-first. No gradients, no shadows — just tables, queries and relations.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="text-[11px] px-2 py-1 rounded-[6px] bg-[#1D1C1A] border border-[#3B3A36] text-[#B7B5B0]">npx deck</span>
              <span className="text-[11px] px-2 py-1 rounded-[6px] bg-[#1D1C1A] border border-[#3B3A36] text-[#85837E]">pg@8.23.0</span>
              <span className="text-[11px] px-2 py-1 rounded-[6px] bg-[rgba(34,197,94,0.08)] border border-[#16803A] text-[#22C55E]">● local</span>
            </div>
          </div>

          <div className="bg-[#292824] border border-[#3B3A36] rounded-[9px] overflow-hidden">
            <div className="h-9 px-4 flex items-center gap-2 border-b border-[#3B3A36] bg-[#292824]">
              <Terminal className="w-4 h-4 text-[#85837E]" />
              <span className="text-[12px] font-medium tracking-widest text-[#B7B5B0]">CONNECTION STRING</span>
            </div>
            <div className="p-4">
              <code className="text-[12px] font-mono text-[#D6D4CF] break-all">
                postgres://{form.user}:***@{form.host}:{form.port}/{form.database}
              </code>
              <div className="mt-3 flex items-center gap-2 text-[11px] text-[#85837E]">
                <Shield className="w-3 h-3" /> Stored in memory only — never on disk.
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#292824] border border-[#3B3A36] rounded-[9px] p-3">
              <Boxes className="w-4 h-4 text-[#B7B5B0]" />
              <div className="text-[12px] font-medium text-[#F0EFEC] mt-2">Tables</div>
              <div className="text-[11px] text-[#85837E]">Browse, filter, edit</div>
            </div>
            <div className="bg-[#292824] border border-[#3B3A36] rounded-[9px] p-3">
              <Terminal className="w-4 h-4 text-[#B7B5B0]" />
              <div className="text-[12px] font-medium text-[#F0EFEC] mt-2">SQL</div>
              <div className="text-[11px] text-[#85837E]">Sequential like psql</div>
            </div>
            <div className="bg-[#292824] border border-[#3B3A36] rounded-[9px] p-3">
              <Activity className="w-4 h-4 text-[#B7B5B0]" />
              <div className="text-[12px] font-medium text-[#F0EFEC] mt-2">Health</div>
              <div className="text-[11px] text-[#85837E]">Latency, size, rows</div>
            </div>
          </div>
        </div>

        {/* Right form */}
        <div className="bg-[#292824] border border-[#3B3A36] rounded-[9px] overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-[#3B3A36] bg-[#292824]">
            <div className="lg:hidden flex items-center gap-3 mb-4">
              <DeckLogo className="w-7 h-7 text-[#F0EFEC]" />
              <div>
                <div className="text-[14px] font-semibold text-[#F0EFEC]">Deck</div>
                <div className="text-[11px] tracking-widest text-[#85837E]">Your database, on deck.</div>
              </div>
            </div>
            <h1 className="text-[16px] font-semibold text-[#F0EFEC] flex items-center gap-2">
              <PlugZap className="w-4 h-4 text-[#22C55E]" /> Connect to PostgreSQL
            </h1>
            <p className="text-[13px] text-[#85837E] mt-1">Enter credentials for <span className="font-mono text-[#B7B5B0]">pg.Pool</span> — runs on <span className="font-mono text-[#F0EFEC]">localhost:3001</span>.</p>
            {connected && <div className="mt-3 flex items-center gap-2 text-[13px] text-[#22C55E] bg-[rgba(34,197,94,0.08)] border border-[#16803A] rounded-[6px] px-3 py-2"><Check className="w-4 h-4"/> Already connected — reconnect will replace the pool.</div>}
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4 flex-1">
            <div className="grid grid-cols-[1fr_120px] gap-3">
              <div>
                <label className="text-[11px] font-medium tracking-widest text-[#B7B5B0]">HOST</label>
                <input value={form.host} onChange={e=>set("host", e.target.value)} placeholder="localhost" className="mt-1.5 w-full h-10 bg-[#1D1C1A] border border-[#4A4944] rounded-[6px] px-3 text-[13px] font-mono text-[#F0EFEC] placeholder:text-[#66645F] focus:outline-none focus:border-[#5A5852] focus:bg-[#232220]" />
              </div>
              <div>
                <label className="text-[11px] font-medium tracking-widest text-[#B7B5B0]">PORT</label>
                <input value={form.port} onChange={e=>set("port", e.target.value)} placeholder="5432" className="mt-1.5 w-full h-10 bg-[#1D1C1A] border border-[#4A4944] rounded-[6px] px-3 text-[13px] font-mono text-[#F0EFEC] placeholder:text-[#66645F] focus:outline-none focus:border-[#5A5852]" />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-medium tracking-widest text-[#B7B5B0]">DATABASE</label>
              <input value={form.database} onChange={e=>set("database", e.target.value)} placeholder="mydb" className="mt-1.5 w-full h-10 bg-[#1D1C1A] border border-[#4A4944] rounded-[6px] px-3 text-[13px] font-mono text-[#F0EFEC] placeholder:text-[#66645F] focus:outline-none focus:border-[#5A5852]" />
              <p className="text-[11px] text-[#66645F] mt-1.5">Public schema is used for table listing.</p>
            </div>

            <div>
              <label className="text-[11px] font-medium tracking-widest text-[#B7B5B0]">USER</label>
              <input value={form.user} onChange={e=>set("user", e.target.value)} placeholder="postgres" className="mt-1.5 w-full h-10 bg-[#1D1C1A] border border-[#4A4944] rounded-[6px] px-3 text-[13px] font-mono text-[#F0EFEC] placeholder:text-[#66645F] focus:outline-none focus:border-[#5A5852]" />
            </div>

            <div>
              <label className="text-[11px] font-medium tracking-widest text-[#B7B5B0]">PASSWORD</label>
              <div className="relative mt-1.5">
                <input type={showPw ? "text" : "password"} value={form.password} onChange={e=>set("password", e.target.value)} placeholder="••••••••" className="w-full h-10 bg-[#1D1C1A] border border-[#4A4944] rounded-[6px] pl-3 pr-10 text-[13px] font-mono text-[#F0EFEC] placeholder:text-[#66645F] focus:outline-none focus:border-[#5A5852]" />
                <button type="button" onClick={()=>setShowPw(s=>!s)} className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-[6px] text-[#85837E] hover:text-[#F0EFEC] hover:bg-[#232220]">
                  {showPw ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex gap-2.5 bg-[#1D1C1A] border border-[#7f1d1d] rounded-[6px] px-3 py-2.5 text-[13px] text-[#fca5a5]">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="break-all font-mono text-[12px]">{error}</span>
              </div>
            )}
            {success && (
              <div className="flex gap-2.5 bg-[rgba(34,197,94,0.08)] border border-[#16803A] rounded-[6px] px-3 py-2.5 text-[13px] text-[#22C55E]">
                <Check className="w-4 h-4 shrink-0" /> <span className="font-medium">{success}</span>
              </div>
            )}

            <div className="pt-2 flex gap-3">
              <button type="submit" disabled={loading} className="flex-1 h-10 bg-[#F0EFEC] text-[#1D1C1A] rounded-[6px] text-[13px] font-semibold hover:bg-white disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin"/> Connecting…</> : <><PlugZap className="w-4 h-4"/> Connect</>}
              </button>
              <button type="button" onClick={()=> nav("/")} className="h-10 px-4 border border-[#4A4944] bg-transparent rounded-[6px] text-[13px] font-medium text-[#B7B5B0] hover:bg-[#3B3935] hover:text-[#F0EFEC]">Use mock</button>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-[#66645F] justify-center pt-1">
              <span>Backend</span>
              <span className="w-1 h-1 rounded-full bg-[#3B3A36]" />
              <span className="font-mono text-[#85837E]">POST http://localhost:3001/api/connect</span>
              <span className="w-1 h-1 rounded-full bg-[#3B3A36]" />
              <span>pg.Pool</span>
            </div>
          </form>

          <div className="px-6 py-3 bg-[#1D1C1A] border-t border-[#3B3A36] flex items-center justify-between text-[11px] text-[#66645F]">
            <span>Default: localhost:5432 / mydb • postgres</span>
            <span className="hidden sm:inline font-mono">Deck • npx deck</span>
          </div>
        </div>
      </div>
    </div>
  )
}
