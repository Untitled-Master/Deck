import { useEffect, useState, useRef } from "react"
import { useLocation } from "react-router-dom"
import {
  Code2, Table2, Copy, Check, Play, Copy as CopyIcon, BookOpen, Key, Search, AlertCircle,
  Terminal, FileCode, Braces, Sparkles, Globe, Layers, ChevronDown, ExternalLink, Zap,
  Database, Clock, Shield, ArrowRight, Hash, Filter, ArrowUpDown, Boxes
} from "lucide-react"
import { api, API_BASE } from "@/lib/api"
import { useConnection } from "@/context/ConnectionContext"
import TopBar from "@/components/layout/TopBar"
import LeftNav from "@/components/layout/LeftNav"
import Sidebar from "@/components/layout/Sidebar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const MOCK_TABLES = [
  { name: "orders", columns: ["id","user_id","product_id","total"] },
  { name: "products", columns: ["id","name","price","stock"] },
  { name: "test", columns: ["id","num"] },
  { name: "users", columns: ["_id","name","email","role"] },
]

export default function ApiPage() {
  const { connected } = useConnection()
  const loc = useLocation()
  const [tables, setTables] = useState(MOCK_TABLES)
  const [selected, setSelected] = useState("test")
  const [sidebarSearch, setSidebarSearch] = useState("")
  const [crudTab, setCrudTab] = useState("read") // read | readOne | create | update | del
  const [codeLang, setCodeLang] = useState("curl") // curl | node | python
  const [copied, setCopied] = useState("")
  const [tryResult, setTryResult] = useState(null)
  const [tryLoading, setTryLoading] = useState(false)
  const [tableDropdownOpen, setTableDropdownOpen] = useState(false)
  const mainScrollRef = useRef(null)

  // handle hash scroll on mount / hash change
  useEffect(()=>{
    if(loc.hash){
      const id = loc.hash.replace("#","")
      setTimeout(()=>{
        const el = document.getElementById(id)
        if(el && mainScrollRef.current){
          // scroll inside main container
          const top = el.offsetTop - 12
          mainScrollRef.current.scrollTo({ top, behavior:"smooth" })
        } else if(el){
          el.scrollIntoView({ behavior:"smooth", block:"start" })
        }
      }, 100)
    }
  },[loc.hash])

  useEffect(()=>{
    if(!connected){ setTables(MOCK_TABLES); return }
    api.tables().then(r=>{
      const mapped = r.tables.map(t=> ({ name: t.name, columns: [] }))
      if(mapped.length) setTables(mapped)
      const target = mapped.find(t=> t.name===selected) ? selected : mapped[0]?.name
      if(target) setSelected(target)
    }).catch(()=> setTables(MOCK_TABLES))
  },[connected])

  useEffect(()=>{
    if(!connected) return
    api.columns(selected).then(r=>{
      setTables(ts=> ts.map(t=> t.name===selected ? { ...t, columns: r.columns.map(c=> c.column) } : t))
    }).catch(()=>{})
  },[selected, connected])

  const base = `${API_BASE}/api/rest`
  const table = tables.find(t=> t.name===selected) || tables[0]
  const cols = table?.columns || ["id","num"]
  const primaryCol = cols[0] || "id"
  const sampleCol = cols[1] || cols[0] || "num"

  const copy = async (text, key)=>{
    try { await navigator.clipboard.writeText(text); setCopied(key); setTimeout(()=> setCopied(""), 1600) } catch {}
  }

  const tryFetch = async (method, path, body)=>{
    setTryLoading(true)
    setTryResult(null)
    try{
      const url = `${API_BASE}${path}`
      const opts = { method, headers: {"Content-Type":"application/json"} }
      if(body) opts.body = JSON.stringify(body)
      const res = await fetch(url, opts)
      const data = await res.json().catch(()=> ({}))
      setTryResult({ status: res.status, ok: res.ok, data })
    }catch(e){
      setTryResult({ status: 0, ok: false, data: { error: e.message } })
    }finally{ setTryLoading(false) }
  }

  const crudTabs = [
    { id:"read", label:"List rows", shortLabel:"Read", method:"GET", path:`/api/rest/${selected}`, desc:"List rows with filtering, pagination and ordering. Supabase-compatible query params." },
    { id:"readOne", label:"Get one", shortLabel:"Read one", method:"GET", path:`/api/rest/${selected}/:id`, desc:"Get a single row by primary key. Returns 404 if not found." },
    { id:"create", label:"Create", shortLabel:"Create", method:"POST", path:`/api/rest/${selected}`, desc:"Insert one or many rows. Returns inserted rows with 201." },
    { id:"update", label:"Update", shortLabel:"Update", method:"PATCH", path:`/api/rest/${selected}/:id`, desc:"Update a row by primary key. Only provided fields are patched." },
    { id:"del", label:"Delete", shortLabel:"Delete", method:"DELETE", path:`/api/rest/${selected}/:id`, desc:"Delete a row by primary key. Returns deleted row." },
  ]
  const activeCrud = crudTabs.find(c=> c.id===crudTab) || crudTabs[0]

  // ── code generators ──
  const curlFor = (tab)=>{
    switch(tab.id){
      case "read": return `curl "${base}/${selected}?select=${cols.slice(0,3).join(",")}&limit=10&order=${primaryCol}.desc"`
      case "readOne": return `curl "${base}/${selected}/1" \\\n  -H "Accept: application/json"`
      case "create": return `curl -X POST "${base}/${selected}" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "${sampleCol}": 123,\n    "${cols[2]||sampleCol}": "hello"\n  }'`
      case "update": return `curl -X PATCH "${base}/${selected}/1" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "${sampleCol}": 999\n  }'`
      case "del": return `curl -X DELETE "${base}/${selected}/1"`
      default: return ""
    }
  }
  const nodeFor = (tab)=>{
    switch(tab.id){
      case "read": return `// Node.js 18+ — native fetch (no install)\nconst base = "${base}"\nconst params = new URLSearchParams({\n  select: "${cols.slice(0,3).join(",")}",\n  limit: "10",\n  order: "${primaryCol}.desc"\n})\n\nconst res = await fetch(\`\${base}/${selected}?\${params}\`)\nconst { data, count } = await res.json()\nconsole.log(\`got \${data.length} rows\`, data)\n// filter: ?${primaryCol}=eq.1  pagination: ?limit=10&offset=20\n`
      case "readOne": return `const res = await fetch("${base}/${selected}/1")\nif (!res.ok) throw new Error("Not found")\nconst { data } = await res.json()\nconsole.log(data)\n`
      case "create": return `const res = await fetch("${base}/${selected}", {\n  method: "POST",\n  headers: { "Content-Type": "application/json" },\n  body: JSON.stringify({\n    ${sampleCol}: 123,\n    ${cols[2] ? `${cols[2]}: "hello"` : `"name": "example"`}\n  })\n})\nconst { data } = await res.json()\nconsole.log("created:", data[0])\n// bulk: body can be an array [{...},{...}]\n`
      case "update": return `const res = await fetch("${base}/${selected}/1", {\n  method: "PATCH",\n  headers: { "Content-Type": "application/json" },\n  body: JSON.stringify({ ${sampleCol}: 999 })\n})\nconst { data } = await res.json()\nconsole.log("updated:", data)\n`
      case "del": return `const res = await fetch("${base}/${selected}/1", {\n  method: "DELETE"\n})\nconst { data } = await res.json()\nconsole.log("deleted:", data)\n// bulk delete: DELETE ${base}/${selected}?${primaryCol}=eq.1\n`
      default: return ""
    }
  }
  const pythonFor = (tab)=>{
    switch(tab.id){
      case "read": return `import requests\n\nbase = "${base}"\nparams = {\n    "select": "${cols.slice(0,3).join(",")}",\n    "limit": 10,\n    "order": "${primaryCol}.desc",\n    # "filter": "${primaryCol}=eq.1"  # add any column filter\n}\nresp = requests.get(f"{base}/${selected}", params=params)\nresp.raise_for_status()\ndata = resp.json()\nprint(f"got {len(data['data'])} rows")\nprint(data["data"][:2])\n`
      case "readOne": return `import requests\n\nresp = requests.get("${base}/${selected}/1")\nif resp.status_code == 404:\n    print("not found")\nelse:\n    resp.raise_for_status()\n    print(resp.json()["data"])\n`
      case "create": return `import requests\n\npayload = {\n    "${sampleCol}": 123,\n    "${cols[2]||"name"}": "hello"\n}\nresp = requests.post("${base}/${selected}", json=payload)\nresp.raise_for_status()\nprint(resp.json())  # {"data": [...], "count": 1}\n# bulk: payload = [{...}, {...}]\n`
      case "update": return `import requests\n\nresp = requests.patch(\n    "${base}/${selected}/1",\n    json={"${sampleCol}": 999}\n)\nresp.raise_for_status()\nprint(resp.json()["data"])\n`
      case "del": return `import requests\n\nresp = requests.delete("${base}/${selected}/1")\nresp.raise_for_status()\nprint(resp.json())\n# with filter: requests.delete("${base}/${selected}", params={"${primaryCol}": "eq.1"})\n`
      default: return ""
    }
  }

  const snippet = codeLang === "curl" ? curlFor(activeCrud) : codeLang === "node" ? nodeFor(activeCrud) : pythonFor(activeCrud)
  const snippetIcon = codeLang === "curl" ? Terminal : codeLang === "node" ? FileCode : Braces
  const snippetLabel = codeLang === "curl" ? "cURL" : codeLang === "node" ? "Node.js" : "Python"

  const responseExample = (() => {
    switch(activeCrud.id){
      case "read": return JSON.stringify({ data: [{ [primaryCol]: 1, [sampleCol]: 123 }, { [primaryCol]: 2, [sampleCol]: 456 }], count: 42, limit: 10, offset: 0 }, null, 2)
      case "readOne": return JSON.stringify({ data: { [primaryCol]: 1, [sampleCol]: 123, [cols[2]||"name"]: "example" } }, null, 2)
      case "create": return JSON.stringify({ data: [{ [primaryCol]: 101, [sampleCol]: 123 }], count: 1 }, null, 2)
      case "update": return JSON.stringify({ data: { [primaryCol]: 1, [sampleCol]: 999 } }, null, 2)
      case "del": return JSON.stringify({ data: { [primaryCol]: 1, [sampleCol]: 123 }, count: 1 }, null, 2)
      default: return "{}"
    }
  })()

  return (
    <div className="h-screen flex flex-col bg-[#292824] overflow-hidden">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <LeftNav />
        <Sidebar selectedTable={selected} onSelectTable={setSelected} search={sidebarSearch} setSearch={setSidebarSearch} />
        <div className="flex-1 flex flex-col bg-[#1D1C1A] overflow-hidden">
          {/* ── header ── */}
          <div className="h-[52px] px-4 flex items-center justify-between border-b border-[#3B3A36] bg-[#1D1C1A] shrink-0 gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-[7px] bg-[#4A90E2] flex items-center justify-center shrink-0">
                <Code2 className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[15px] font-semibold tracking-tight text-[#F0EFEC]">API</span>
                  <span className="hidden sm:inline-flex text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#4A90E2] text-white leading-none">REST</span>
                  <span className={`hidden md:inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border font-medium shrink-0 ${connected ? "bg-[rgba(34,197,94,0.08)] border-[#16803A] text-[#22C55E]" : "bg-[#292824] border-[#3B3A36] text-[#85837E]"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-[#22C55E] animate-pulse" : "bg-[#85837E]"}`} /> {connected ? "Live" : "Mock"}
                  </span>
                </div>
                <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono text-[#85837E] truncate">
                  <Globe className="w-3 h-3 shrink-0" /> {base}
                  <button onClick={()=> copy(base, "baseHeader")} className="ml-1 w-5 h-5 flex items-center justify-center hover:bg-[#292824] rounded-[4px] border border-transparent hover:border-[#3B3A36] text-[#66645F] hover:text-[#B7B5B0]">
                    {copied==="baseHeader" ? <Check className="w-3 h-3 text-[#22C55E]" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* table dropdown — visible on all sizes, replaces left panel table list for quick switch */}
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-[11px] tracking-widest text-[#66645F] hidden xl:inline">TABLE</span>
                <Select value={selected} onValueChange={setSelected}>
                  <SelectTrigger className="h-8 w-[148px] bg-[#292824] border-[#3B3A36] text-[#F0EFEC] text-[13px] font-mono">
                    <SelectValue placeholder="Select table" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#292824] border-[#3B3A36] text-[#F0EFEC]">
                    {tables.map(t=> (
                      <SelectItem key={t.name} value={t.name} className="font-mono text-[13px] focus:bg-[#3B3935] focus:text-[#F0EFEC] data-[state=checked]:bg-[#3B3935]">
                        <span className="flex items-center gap-2"><Table2 className="w-3.5 h-3.5 text-[#85837E]" />{t.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* mobile table picker fallback */}
              <div className="sm:hidden">
                <select value={selected} onChange={e=> setSelected(e.target.value)} className="h-8 px-2 pr-6 bg-[#292824] border border-[#3B3A36] rounded-[6px] text-[13px] font-mono text-[#F0EFEC] focus:outline-none focus:border-[#4A90E2]">
                  {tables.map(t=> <option key={t.name} value={t.name}>{t.name}</option>)}
                </select>
              </div>

              <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full bg-[#292824] border border-[#3B3A36] text-[#B7B5B0]">
                <Boxes className="w-3 h-3" /> {tables.length} tables
              </span>
            </div>
          </div>

          {/* ── scrollable content ── */}
          <div ref={mainScrollRef} id="api-main-scroll" className="flex-1 overflow-auto bg-[#1D1C1A] scroll-smooth">
            <div className="max-w-[980px] mx-auto px-4 md:px-6 py-6 space-y-8">

              {/* ── hero / overview ── */}
              <section id="overview" className="scroll-mt-6">
                <div className="rounded-[12px] border border-[#3B3A36] bg-gradient-to-br from-[#292824] via-[#292824] to-[#1D1C1A] overflow-hidden">
                  <div className="p-5 md:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-widest text-[#4A90E2]"><Sparkles className="w-3.5 h-3.5" /> SUPABASE-LIKE REST API</div>
                        <h1 className="mt-2 text-[22px] md:text-[24px] font-semibold tracking-tight text-[#F0EFEC] leading-none">Every table, instantly an API.</h1>
                        <p className="mt-2 text-[13px] leading-relaxed text-[#B7B5B0] max-w-[560px]">Deck auto-generates a typed REST endpoint for each Postgres table in <span className="font-mono text-[#F0EFEC]">public</span>. Filtering, pagination and ordering work out-of-the-box — just <span className="font-mono text-[#F0EFEC]">fetch</span> it.</p>
                      </div>
                      <div className="hidden md:flex flex-col items-end gap-2 shrink-0">
                        <div className="flex items-center gap-1.5 text-[11px] font-mono px-3 py-1.5 rounded-full bg-[#1D1C1A] border border-[#3B3A36] text-[#B7B5B0]">
                          <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" /> {base}/{selected}
                        </div>
                        <a href="#playground" className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#4A90E2] hover:text-[#6aa8f0]">Open playground <ArrowRight className="w-3.5 h-3.5" /></a>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="rounded-[9px] bg-[#1D1C1A] border border-[#3B3A36] p-3">
                        <div className="flex items-center gap-2 text-[11px] tracking-widest text-[#85837E]"><Database className="w-3.5 h-3.5" /> TABLES</div>
                        <div className="mt-1 text-[20px] font-semibold font-mono text-[#F0EFEC]">{tables.length}</div>
                        <div className="text-[11px] text-[#66645F] truncate">{tables.map(t=>t.name).slice(0,3).join(", ")}{tables.length>3?" +":""}</div>
                      </div>
                      <div className="rounded-[9px] bg-[#1D1C1A] border border-[#3B3A36] p-3">
                        <div className="flex items-center gap-2 text-[11px] tracking-widest text-[#85837E]"><Layers className="w-3.5 h-3.5" /> ENDPOINTS</div>
                        <div className="mt-1 text-[20px] font-semibold font-mono text-[#F0EFEC]">5</div>
                        <div className="text-[11px] text-[#66645F]">GET POST PATCH DELETE</div>
                      </div>
                      <div className="rounded-[9px] bg-[#1D1C1A] border border-[#3B3A36] p-3">
                        <div className="flex items-center gap-2 text-[11px] tracking-widest text-[#85837E]"><Shield className="w-3.5 h-3.5" /> AUTH</div>
                        <div className="mt-1 text-[13px] font-medium text-[#F0EFEC]">Open</div>
                        <div className="text-[11px] text-[#66645F]">Add middleware for prod</div>
                      </div>
                      <div className="rounded-[9px] bg-[#1D1C1A] border border-[#3B3A36] p-3">
                        <div className="flex items-center gap-2 text-[11px] tracking-widest text-[#85837E]"><Clock className="w-3.5 h-3.5" /> LATENCY</div>
                        <div className="mt-1 text-[13px] font-medium text-[#22C55E]">~12ms</div>
                        <div className="text-[11px] text-[#66645F]">p50 on local pg</div>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2 text-[12px]">
                      <span className="text-[#85837E]">Quick start:</span>
                      <code className="px-2 py-1 rounded-[6px] bg-[#1D1C1A] border border-[#3B3A36] font-mono text-[#B7B5B0] text-[12px]">fetch("{base}/{selected}?limit=5")</code>
                      <span className="text-[#66645F]">→ JSON</span>
                    </div>
                  </div>
                  <div className="h-px bg-[#3B3A36]" />
                  <div className="px-5 md:px-6 py-3 flex flex-wrap items-center gap-2 text-[11px] bg-[#1D1C1A]/60">
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#4A90E2]/15 border border-[#4A90E2]/25 text-[#4A90E2] font-medium"><Hash className="w-3 h-3" /> select</span>
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#292824] border border-[#3B3A36] text-[#85837E]"><Filter className="w-3 h-3" /> filter ?{primaryCol}=eq.1</span>
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#292824] border border-[#3B3A36] text-[#85837E]"><ArrowUpDown className="w-3 h-3" /> order</span>
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#292824] border border-[#3B3A36] text-[#85837E]">limit & offset</span>
                    <span className="ml-auto hidden sm:inline text-[#66645F]">Base is <span className="font-mono text-[#B7B5B0]">/api/rest/:table</span> — no SDK needed.</span>
                  </div>
                </div>
              </section>

              {/* ── endpoints ── */}
              <section id="endpoints" className="scroll-mt-6 space-y-4">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <h2 className="text-[14px] font-semibold tracking-wide text-[#F0EFEC] flex items-center gap-2"><Layers className="w-4 h-4 text-[#4A90E2]" /> Endpoints</h2>
                    <p className="text-[12px] text-[#85837E] mt-1">Pick a table and an operation — code updates instantly for all languages.</p>
                  </div>
                  <div className="hidden md:flex items-center gap-1.5 text-[11px] font-mono text-[#66645F] border border-[#3B3A36] bg-[#292824] rounded-[6px] px-2.5 py-1">
                    <span className="w-2 h-2 rounded-full bg-[#4A90E2]" /> {selected} <span className="text-[#3B3A36]">·</span> {cols.join(", ")}
                  </div>
                </div>

                {/* endpoint selector — pills + dropdown fallback */}
                <div className="rounded-[10px] border border-[#3B3A36] bg-[#292824] p-2">
                  {/* desktop pills */}
                  <div className="hidden sm:grid grid-cols-5 gap-1.5">
                    {crudTabs.map(c=> (
                      <button key={c.id} onClick={()=> setCrudTab(c.id)} className={`relative flex flex-col items-start gap-1 px-2.5 py-2.5 rounded-[8px] border text-left transition-all ${crudTab===c.id ? "bg-[#1D1C1A] border-[#4A90E2] shadow-[0_0_0_1px_rgba(74,144,226,0.15)]" : "bg-[#1D1C1A]/40 border-[#3B3A36]/60 hover:bg-[#1D1C1A] hover:border-[#3B3A36] hover:text-[#F0EFEC]"}`}>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-[4px] tracking-wide ${c.method==="GET"?"bg-[#4A90E2]/20 text-[#4A90E2] border border-[#4A90E2]/20":c.method==="POST"?"bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/20":c.method==="PATCH"?"bg-[#EAB308]/20 text-[#EAB308] border border-[#EAB308]/20":"bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/20"}`}>{c.method}</span>
                        <span className={`text-[12px] font-medium leading-none truncate w-full ${crudTab===c.id ? "text-[#F0EFEC]" : "text-[#B7B5B0]"}`}>{c.shortLabel}</span>
                        <span className="text-[11px] font-mono text-[#66645F] truncate w-full">{c.path.split("/").slice(-2).join("/")}</span>
                        {crudTab===c.id && <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#4A90E2] animate-pulse" />}
                      </button>
                    ))}
                  </div>
                  {/* mobile dropdown */}
                  <div className="sm:hidden">
                    <Select value={crudTab} onValueChange={setCrudTab}>
                      <SelectTrigger className="h-10 bg-[#1D1C1A] border-[#3B3A36] text-[#F0EFEC]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#292824] border-[#3B3A36] text-[#F0EFEC]">
                        {crudTabs.map(c=> (
                          <SelectItem key={c.id} value={c.id} className="focus:bg-[#3B3935] focus:text-[#F0EFEC]">
                            <span className="flex items-center gap-2"><span className={`text-[10px] font-bold px-1 py-0.5 rounded ${c.method==="GET"?"bg-[#4A90E2]/20 text-[#4A90E2]":c.method==="POST"?"bg-[#22C55E]/20 text-[#22C55E]":c.method==="PATCH"?"bg-[#EAB308]/20 text-[#EAB308]":"bg-[#EF4444]/20 text-[#EF4444]"}`}>{c.method}</span> {c.label} — <span className="font-mono text-[11px] text-[#85837E]">{c.path}</span></span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* active endpoint detail */}
                <div className="rounded-[10px] border border-[#3B3A36] bg-[#292824] overflow-hidden">
                  <div className="p-4 md:p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-[7px] border tracking-wide ${activeCrud.method==="GET"?"bg-[#4A90E2]/15 border-[#4A90E2]/30 text-[#4A90E2]":activeCrud.method==="POST"?"bg-[#22C55E]/15 border-[#22C55E]/30 text-[#22C55E]":activeCrud.method==="PATCH"?"bg-[#EAB308]/15 border-[#EAB308]/30 text-[#EAB308]":"bg-[#EF4444]/15 border-[#EF4444]/30 text-[#EF4444]"}`}>{activeCrud.method}</span>
                      <code className="text-[13px] font-mono text-[#F0EFEC] break-all">{activeCrud.path}</code>
                      <button onClick={()=> copy(`${API_BASE}${activeCrud.path}`, "path")} className="ml-1 w-6 h-6 flex items-center justify-center rounded-[5px] border border-[#3B3A36] bg-[#1D1C1A] text-[#85837E] hover:text-[#F0EFEC] hover:border-[#4A4944]">
                        {copied==="path" ? <Check className="w-3 h-3 text-[#22C55E]" /> : <Copy className="w-3 h-3" />}
                      </button>
                      <span className="hidden md:inline-flex ml-auto text-[11px] px-2.5 py-1 rounded-full bg-[#1D1C1A] border border-[#3B3A36] text-[#85837E] font-mono max-w-[260px] truncate">{selected} • {cols.join(", ")}</span>
                    </div>
                    <p className="text-[13px] text-[#B7B5B0] mt-3 leading-relaxed">{activeCrud.desc}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-[6px] bg-[#1D1C1A] border border-[#3B3A36] text-[#85837E]"><span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" /> JSON in & out</span>
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-[6px] bg-[#1D1C1A] border border-[#3B3A36] text-[#85837E]">No auth — public</span>
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-[6px] bg-[#1D1C1A] border border-[#3B3A36] text-[#85837E]">CORS enabled</span>
                    </div>
                  </div>

                  {/* code + response */}
                  <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_0.9fr] gap-0 border-t border-[#3B3A36]">
                    {/* code */}
                    <div className="bg-[#1D1C1A] border-r-0 lg:border-r border-b lg:border-b-0 border-[#3B3A36] flex flex-col min-w-0">
                      <div className="h-10 px-3 flex items-center gap-1 border-b border-[#3B3A36] bg-[#1D1C1A] shrink-0">
                        <div className="flex items-center gap-1 p-1 rounded-[7px] bg-[#292824] border border-[#3B3A36]">
                          {[
                            { id:"curl", label:"cURL", icon: Terminal },
                            { id:"node", label:"Node.js", icon: FileCode },
                            { id:"python", label:"Python", icon: Braces },
                          ].map(lang => {
                            const Icon = lang.icon
                            const active = codeLang===lang.id
                            return (
                              <button key={lang.id} onClick={()=> setCodeLang(lang.id)} className={`h-6 px-2.5 flex items-center gap-1.5 rounded-[6px] text-[12px] font-medium transition-colors ${active ? "bg-[#4A90E2] text-white shadow" : "text-[#85837E] hover:text-[#F0EFEC] hover:bg-[#3B3935]"}`}>
                                <Icon className="w-3.5 h-3.5" /> {lang.label}
                              </button>
                            )
                          })}
                        </div>
                        <span className="hidden md:inline-flex ml-2 text-[11px] px-2 py-1 rounded-full bg-[#292824] border border-[#3B3A36] text-[#85837E] font-mono">{snippetLabel}</span>
                        <button onClick={()=> copy(snippet, `code-${codeLang}`)} className="ml-auto h-7 px-2.5 flex items-center gap-1.5 border border-[#3B3A36] bg-[#292824] hover:bg-[#3B3935] rounded-[6px] text-[11px] font-medium text-[#B7B5B0] hover:text-[#F0EFEC]">
                          {copied===`code-${codeLang}` ? <><Check className="w-3 h-3 text-[#22C55E]" /> Copied</> : <><CopyIcon className="w-3 h-3" /> Copy</>}
                        </button>
                      </div>
                      <div className="flex-1 relative overflow-hidden bg-[#121110]">
                        <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-black/20 to-transparent pointer-events-none" />
                        <pre className="p-4 text-[12.5px] leading-[1.6] font-mono text-[#D6D4CF] whitespace-pre-wrap break-words overflow-auto max-h-[320px]">{snippet}</pre>
                        <div className="absolute bottom-2 right-2 flex items-center gap-1">
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#292824] border border-[#3B3A36] text-[#66645F]">{codeLang === "curl" ? "sh" : codeLang === "node" ? "js" : "py"}</span>
                        </div>
                      </div>
                      <div className="px-3 py-2 flex items-center gap-2 border-t border-[#3B3A36] bg-[#1D1C1A] text-[11px] text-[#66645F]">
                        <Zap className="w-3 h-3 text-[#EAB308]" /> Tip: copy, paste, run — no SDK install needed.
                        <span className="ml-auto hidden md:inline text-[#85837E]">Base: <span className="font-mono text-[#B7B5B0]">{base}</span></span>
                      </div>
                    </div>
                    {/* response */}
                    <div className="bg-[#121110] flex flex-col min-w-0">
                      <div className="h-10 px-3 flex items-center justify-between border-b border-[#3B3A36] bg-[#1D1C1A] shrink-0">
                        <span className="text-[11px] tracking-widest font-semibold text-[#85837E] flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-[#4A90E2]" /> RESPONSE</span>
                        <span className="text-[11px] font-mono px-2 py-1 rounded-[5px] bg-[#22C55E]/15 border border-[#22C55E]/30 text-[#22C55E] font-bold">200 OK</span>
                      </div>
                      <pre className="p-4 text-[12px] leading-[1.6] font-mono text-[#D6D4CF] whitespace-pre-wrap break-words overflow-auto max-h-[320px] flex-1 bg-[#121110]">{responseExample}</pre>
                      <div className="px-3 py-2 border-t border-[#3B3A36] bg-[#1D1C1A] text-[11px] text-[#66645F] flex items-center gap-1.5">
                        <Boxes className="w-3 h-3" /> {activeCrud.method} {activeCrud.path} → <span className="font-mono text-[#85837E]">application/json</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* ── examples: all languages at a glance + query params ── */}
              <section id="examples" className="scroll-mt-6 space-y-4">
                <div>
                  <h2 className="text-[14px] font-semibold tracking-wide text-[#F0EFEC] flex items-center gap-2"><Terminal className="w-4 h-4 text-[#22C55E]" /> Code examples</h2>
                  <p className="text-[12px] text-[#85837E] mt-1">Same request, three ecosystems. Switch the tab above or browse these per-language guides.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { id:"curl", title:"cURL", icon: Terminal, color:"#4A90E2", desc:"For terminals & scripts. Works everywhere.", cmd: `curl "${base}/${selected}?limit=5"` },
                    { id:"node", title:"Node.js", icon: FileCode, color:"#22C55E", desc:"Fetch in Next.js / Express / any JS runtime.", cmd: `await fetch("${base}/${selected}")` },
                    { id:"python", title:"Python", icon: Braces, color:"#EAB308", desc:"Requests or httpx — ideal for ETL & scripts.", cmd: `requests.get("${base}/${selected}")` },
                  ].map(card => {
                    const Icon = card.icon
                    return (
                      <button key={card.id} onClick={()=> { setCodeLang(card.id); document.getElementById("endpoints")?.scrollIntoView({behavior:"smooth"})}} className={`text-left rounded-[10px] border p-3 transition-all bg-[#292824] hover:bg-[#302E2B] ${codeLang===card.id ? "border-[#4A90E2] shadow-[0_0_0_1px_rgba(74,144,226,0.2)]" : "border-[#3B3A36]"}`}>
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-[7px] flex items-center justify-center text-white" style={{background:card.color}}><Icon className="w-3.5 h-3.5" /></span>
                          <span className="text-[13px] font-semibold text-[#F0EFEC]">{card.title}</span>
                          {codeLang===card.id && <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#4A90E2] text-white">ACTIVE</span>}
                        </div>
                        <div className="text-[12px] text-[#85837E] mt-1.5 leading-relaxed">{card.desc}</div>
                        <code className="mt-2 block text-[11px] font-mono p-2 rounded-[6px] bg-[#1D1C1A] border border-[#3B3A36] text-[#B7B5B0] truncate">{card.cmd}</code>
                      </button>
                    )
                  })}
                </div>

                <div className="rounded-[10px] border border-[#3B3A36] bg-[#292824] overflow-hidden">
                  <div className="px-4 py-3 border-b border-[#3B3A36] flex items-center gap-2">
                    <Key className="w-4 h-4 text-[#B7B5B0]" />
                    <span className="text-[13px] font-semibold text-[#F0EFEC]">Query params — Supabase style</span>
                    <span className="ml-auto hidden sm:inline text-[11px] px-2 py-1 rounded-full bg-[#1D1C1A] border border-[#3B3A36] text-[#85837E] font-mono">?select & ?filter & ?order</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#3B3A36]">
                    {[
                      { code:"?select=id,name", desc:"Pick columns — comma separated", ex:`curl "${base}/${selected}?select=id,${sampleCol}"` },
                      { code:"?limit=10&offset=20", desc:"Paginate — max 500 per request", ex:`fetch("${base}/${selected}?limit=10&offset=20")` },
                      { code:"?order=name.desc", desc:"Order — .asc (default) or .desc", ex:`?order=${primaryCol}.desc` },
                      { code:"?id=eq.1  •  ?name=Ahmed", desc:"Filter — eq, neq, gt, lt  (or ?col=value)", ex:`requests.get(url, params={"${primaryCol}": "eq.1"})` },
                    ].map(item=> (
                      <div key={item.code} className="p-3.5 flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <code className="text-[12px] font-mono px-2 py-1 rounded-[6px] bg-[#1D1C1A] border border-[#3B3A36] text-[#4A90E2]">{item.code}</code>
                          <span className="text-[12px] text-[#B7B5B0]">— {item.desc}</span>
                        </div>
                        <code className="text-[11px] font-mono text-[#66645F] truncate">{item.ex}</code>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2.5 flex items-center gap-2 bg-[#1D1C1A] border-t border-[#3B3A36] text-[11px] text-[#85837E]">
                    <AlertCircle className="w-3.5 h-3.5" /> Combine them: <span className="font-mono text-[#B7B5B0]">?select=id,name&{primaryCol}=eq.1&order={primaryCol}.desc&limit=5</span>
                    <button onClick={()=> copy(`${base}/${selected}?select=id,${sampleCol}&limit=5&order=${primaryCol}.desc`, "combo")} className="ml-auto h-6 px-2 flex items-center gap-1 border border-[#3B3A36] rounded-[6px] bg-[#292824] hover:bg-[#3B3935] text-[#B7B5B0] hover:text-[#F0EFEC]">{copied==="combo" ? <Check className="w-3 h-3 text-[#22C55E]" /> : <Copy className="w-3 h-3" />} {copied==="combo" ? "Copied" : "Copy"}</button>
                  </div>
                </div>

                <div className="rounded-[10px] border border-[#3B3A36] bg-gradient-to-br from-[#292824] to-[#1D1C1A] p-4">
                  <div className="text-[13px] font-semibold text-[#F0EFEC] flex items-center gap-2"><Shield className="w-4 h-4 text-[#EAB308]" /> Production checklist</div>
                  <ul className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-1.5 text-[12px] text-[#B7B5B0] list-disc list-inside marker:text-[#66645F]">
                    <li>Add auth middleware (e.g. check <span className="font-mono text-[#85837E]">Authorization</span> header).</li>
                    <li>Whitelist tables — don't expose internal ones.</li>
                    <li>Rate-limit <span className="font-mono text-[#85837E]">/api/rest/*</span>.</li>
                    <li>Validate column names server-side (already done via <span className="font-mono text-[#85837E]">isValidTable</span>).</li>
                  </ul>
                </div>
              </section>

              {/* ── playground ── */}
              <section id="playground" className="scroll-mt-6">
                <div className="rounded-[10px] border border-[#3B3A36] bg-[#292824] overflow-hidden">
                  <div className="h-10 px-4 flex items-center gap-2 border-b border-[#3B3A36] bg-[#292824]">
                    <div className="w-7 h-7 rounded-[6px] bg-[#4A90E2] flex items-center justify-center"><Play className="w-3.5 h-3.5 text-white" /></div>
                    <span className="text-[13px] font-semibold text-[#F0EFEC]">Playground</span>
                    <span className="text-[11px] text-[#85837E] hidden sm:inline">— live against your DB (read-safe demo)</span>
                    <div className="ml-auto flex items-center gap-2">
                      <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] font-mono px-2 py-1 rounded-[6px] bg-[#1D1C1A] border border-[#3B3A36] text-[#85837E]"><span className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-[#22C55E]" : "bg-[#EAB308]"}`} />{connected ? "connected" : "mock"}</span>
                      <button onClick={()=> tryFetch(activeCrud.method, activeCrud.path.replace(":id","1"), activeCrud.method==="POST" ? {[sampleCol]:123} : activeCrud.method==="PATCH" ? {[sampleCol]:999} : undefined)} disabled={tryLoading} className="h-7 px-3.5 flex items-center gap-1.5 bg-[#4A90E2] hover:bg-[#3a7bc8] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-[7px] text-[12px] font-semibold shadow">
                        {tryLoading ? <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Play className="w-3 h-3" />} Try {activeCrud.method}
                      </button>
                    </div>
                  </div>
                  <div className="p-4 bg-[#1D1C1A]">
                    {!tryResult ? (
                      <div className="rounded-[8px] border border-dashed border-[#3B3A36] bg-[#292824]/40 p-6 text-center">
                        <div className="mx-auto w-10 h-10 rounded-full bg-[#292824] border border-[#3B3A36] flex items-center justify-center"><Zap className="w-5 h-5 text-[#EAB308]" /></div>
                        <div className="text-[13px] font-medium text-[#F0EFEC] mt-3">Run a live request</div>
                        <div className="text-[12px] text-[#85837E] mt-1 max-w-[420px] mx-auto leading-relaxed">
                          Click <span className="font-mono text-[#F0EFEC]">Try {activeCrud.method}</span> to execute <span className="font-mono text-[#B7B5B0]">{activeCrud.method} {activeCrud.path}</span> against <span className="font-mono text-[#F0EFEC]">{selected}</span> using your current connection.
                        </div>
                        <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded-full bg-[#1D1C1A] border border-[#3B3A36] text-[#85837E]">{activeCrud.method} {activeCrud.path.replace(":id","1")}</div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-[12px]">
                          <span className={`px-2 py-1 rounded-[6px] border text-[11px] font-bold font-mono ${tryResult.ok ? "bg-[rgba(34,197,94,0.10)] border-[#16803A] text-[#22C55E]" : "bg-[rgba(239,68,68,0.10)] border-[#991b1b] text-[#EF4444]"}`}>{tryResult.status} {tryResult.ok ? "OK" : "ERR"}</span>
                          <span className="font-mono text-[#B7B5B0] text-[12px]">{activeCrud.method} {activeCrud.path}</span>
                          <span className={`ml-auto text-[11px] px-2 py-1 rounded-full border ${tryResult.ok ? "bg-[rgba(34,197,94,0.08)] border-[#16803A] text-[#22C55E]" : "bg-[#292824] border-[#3B3A36] text-[#85837E]"}`}>{tryResult.ok ? "Success" : "Failed"}</span>
                        </div>
                        <pre className="p-3.5 bg-[#121110] border border-[#3B3A36] rounded-[8px] text-[12px] font-mono text-[#D6D4CF] whitespace-pre-wrap break-all max-h-[340px] overflow-auto">{JSON.stringify(tryResult.data, null, 2)}</pre>
                        <div className="flex items-center gap-2">
                          <button onClick={()=> copy(JSON.stringify(tryResult.data, null, 2), "tryCopy")} className="h-7 px-2.5 flex items-center gap-1.5 border border-[#3B3A36] bg-[#292824] hover:bg-[#3B3935] rounded-[6px] text-[11px] font-medium text-[#B7B5B0] hover:text-[#F0EFEC]">
                            {copied==="tryCopy" ? <Check className="w-3 h-3 text-[#22C55E]" /> : <Copy className="w-3 h-3" />} {copied==="tryCopy" ? "Copied response" : "Copy response"}
                          </button>
                          <button onClick={()=> setTryResult(null)} className="h-7 px-2.5 border border-[#3B3A36] bg-transparent hover:bg-[#292824] rounded-[6px] text-[11px] font-medium text-[#85837E] hover:text-[#F0EFEC]">Clear</button>
                          <span className="ml-auto text-[11px] text-[#66645F]">No writes are persisted unless you confirm — read-only demo for PATCH/DELETE uses id 1.</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="px-4 py-2.5 bg-[#292824] border-t border-[#3B3A36] flex items-center gap-2 text-[11px] text-[#85837E]">
                    <BookOpen className="w-3.5 h-3.5" /> Need programmatic access? Copy any snippet above — it hits <span className="font-mono text-[#B7B5B0]">{base}</span> directly.
                    <a href="#examples" className="ml-auto inline-flex items-center gap-1 text-[#4A90E2] hover:text-[#6aa8f0] font-medium">See examples <ExternalLink className="w-3 h-3" /></a>
                  </div>
                </div>
              </section>

              <div className="pt-2 pb-6 text-center text-[11px] text-[#66645F]">
                Deck API • Supabase-style • Built on Postgres • <span className="font-mono">/api/rest/:table</span> • <span className="text-[#85837E]">Add auth before exposing publicly.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
