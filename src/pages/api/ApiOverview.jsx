import { useState } from "react"
import { Copy, Check, Globe, Database, Layers, Shield, Clock, Boxes, BookOpen, Hash, Filter, ArrowUpDown, Terminal, FileCode, Braces, ChevronRight, ExternalLink } from "lucide-react"
import TopBar from "@/components/layout/TopBar"
import LeftNav from "@/components/layout/LeftNav"
import ApiDocsSidebar from "@/components/api/ApiDocsSidebar"
import ApiCodeBlock from "@/components/api/ApiCodeBlock"
import { API_BASE } from "@/lib/api"
import { useApiTables } from "@/hooks/useApiTables"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ApiOverview() {
  const { tables, selected, setSelected, base, cols, primaryCol, sampleCol, connected } = useApiTables()
  const [copied, setCopied] = useState("")
  const copy = async (t,k)=>{ try{ await navigator.clipboard.writeText(t); setCopied(k); setTimeout(()=>setCopied(""),1400)}catch{} }

  return (
    <div className="h-screen flex flex-col bg-[#292824] overflow-hidden">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <LeftNav />
        <div className="flex-1 flex overflow-hidden bg-[#1D1C1A]">
          <ApiDocsSidebar selected={selected} tables={tables} onSelectTable={setSelected} />
          <main className="flex-1 overflow-auto bg-[#1D1C1A]">
            <div className="max-w-[860px] mx-auto px-6 md:px-8 py-8">
              {/* breadcrumb */}
              <div className="flex items-center gap-1.5 text-[12px] text-[#85837E]">
                <span>Docs</span><ChevronRight className="w-3 h-3" /><span className="text-[#B7B5B0]">API</span><ChevronRight className="w-3 h-3" /><span className="text-[#F0EFEC] font-medium">Overview</span>
              </div>

              <div className="mt-6">
                <h1 className="text-[28px] font-semibold tracking-tight text-[#F0EFEC]">API overview</h1>
                <p className="mt-3 text-[14px] leading-relaxed text-[#B7B5B0] max-w-[640px]">
                  Deck exposes every table in <span className="font-mono text-[#F0EFEC] bg-[#292824] border border-[#3B3A36] px-1.5 py-0.5 rounded text-[13px]">public</span> as a REST endpoint.
                  No SDK required — use <span className="font-mono text-[#F0EFEC]">fetch</span> from any runtime. Filtering, pagination and ordering are Supabase-compatible.
                </p>
              </div>

              {/* base url */}
              <div className="mt-8 rounded-[9px] border border-[#3B3A36] bg-[#292824] overflow-hidden">
                <div className="px-4 py-3 flex items-center justify-between border-b border-[#3B3A36]">
                  <span className="text-[11px] tracking-widest font-semibold text-[#85837E] flex items-center gap-2"><Globe className="w-3.5 h-3.5" /> BASE URL</span>
                  <span className={`text-[11px] px-2 py-1 rounded-full border font-medium flex items-center gap-1.5 ${connected ? "bg-[#1D1C1A] border-[#3B3A36] text-[#B7B5B0]" : "bg-[#1D1C1A] border-[#3B3A36] text-[#85837E]"}`}><span className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-[#22C55E]" : "bg-[#85837E]"}`} />{connected ? "Live" : "Mock"}</span>
                </div>
                <div className="p-4 flex flex-col md:flex-row md:items-center gap-3">
                  <code className="flex-1 text-[13px] font-mono text-[#F0EFEC] break-all bg-[#1D1C1A] border border-[#3B3A36] rounded-[7px] px-3 py-2.5">{base}/<span className="text-[#B7B5B0]">{selected}</span></code>
                  <button onClick={()=> copy(`${base}/${selected}`, "base")} className="h-9 px-3.5 flex items-center gap-2 bg-[#1D1C1A] border border-[#3B3A36] rounded-[7px] text-[13px] font-medium text-[#B7B5B0] hover:text-[#F0EFEC] hover:bg-[#232220]">
                    {copied==="base" ? <Check className="w-4 h-4 text-[#22C55E]" /> : <Copy className="w-4 h-4" />} {copied==="base" ? "Copied" : "Copy"}
                  </button>
                </div>
                <div className="px-4 pb-3 flex flex-wrap items-center gap-2 text-[11px]">
                  <code className="px-2 py-1 rounded bg-[#1D1C1A] border border-[#3B3A36] font-mono text-[#B7B5B0]">/api/rest/:table</code>
                  <code className="px-2 py-1 rounded bg-[#1D1C1A] border border-[#3B3A36] font-mono text-[#B7B5B0]">/api/rest/:table/:id</code>
                  <span className="text-[#66645F] ml-1">CORS enabled • JSON in/out • no auth (add middleware for prod)</span>
                </div>
              </div>

              {/* table picker + stats */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-[1.2fr_1.8fr] gap-4">
                <div className="rounded-[9px] border border-[#3B3A36] bg-[#292824] p-4">
                  <div className="text-[11px] tracking-widest font-semibold text-[#85837E]">SELECTED TABLE</div>
                  <div className="mt-2">
                    <Select value={selected} onValueChange={setSelected}>
                      <SelectTrigger className="h-9 bg-[#1D1C1A] border-[#3B3A36] text-[#F0EFEC] font-mono text-[13px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#292824] border-[#3B3A36] text-[#F0EFEC]">
                        {tables.map(t=> <SelectItem key={t.name} value={t.name} className="font-mono focus:bg-[#3B3935] focus:text-[#F0EFEC]">{t.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="mt-3 text-[12px] font-mono text-[#85837E]">columns: <span className="text-[#B7B5B0]">{cols.join(", ")}</span></div>
                  <div className="mt-1 text-[12px] text-[#66645F]">primary: <span className="font-mono text-[#B7B5B0]">{primaryCol}</span></div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-[9px] border border-[#3B3A36] bg-[#292824] p-4">
                    <div className="text-[11px] tracking-widest text-[#85837E] flex items-center gap-1.5"><Database className="w-3.5 h-3.5" /> TABLES</div>
                    <div className="text-[22px] font-semibold font-mono text-[#F0EFEC] mt-1">{tables.length}</div>
                    <div className="text-[11px] text-[#66645F] truncate">{tables.map(t=>t.name).slice(0,3).join(", ")}{tables.length>3?" …":""}</div>
                  </div>
                  <div className="rounded-[9px] border border-[#3B3A36] bg-[#292824] p-4">
                    <div className="text-[11px] tracking-widest text-[#85837E] flex items-center gap-1.5"><Layers className="w-3.5 h-3.5" /> ENDPOINTS</div>
                    <div className="text-[22px] font-semibold font-mono text-[#F0EFEC] mt-1">5</div>
                    <div className="text-[11px] text-[#66645F]">GET POST PATCH DELETE</div>
                  </div>
                  <div className="rounded-[9px] border border-[#3B3A36] bg-[#292824] p-4">
                    <div className="text-[11px] tracking-widest text-[#85837E] flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> AUTH</div>
                    <div className="text-[13px] font-medium text-[#F0EFEC] mt-1">Open</div>
                    <div className="text-[11px] text-[#66645F]">Add middleware</div>
                  </div>
                  <div className="rounded-[9px] border border-[#3B3A36] bg-[#292824] p-4">
                    <div className="text-[11px] tracking-widest text-[#85837E] flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> LATENCY</div>
                    <div className="text-[13px] font-medium text-[#F0EFEC] mt-1">~12 ms</div>
                    <div className="text-[11px] text-[#66645F]">p50 local pg</div>
                  </div>
                </div>
              </div>

              {/* quick start docs style */}
              <div className="mt-8 space-y-6">
                <div>
                  <h2 className="text-[15px] font-semibold text-[#F0EFEC] flex items-center gap-2"><BookOpen className="w-4 h-4 text-[#B7B5B0]" /> Quick start</h2>
                  <p className="text-[13px] text-[#85837E] mt-1">Three lines to read your table. All examples update when you switch the table above.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                  {[
                    { lang:"cURL", title:"cURL", icon: Terminal, language:"shell", code:`curl "${base}/${selected}?select=${cols.slice(0,2).join(",")}&limit=5"` },
                    { lang:"Node.js", title:"Node.js", icon: FileCode, language:"javascript", code:`const res = await fetch("${base}/${selected}?limit=5")\nconst { data } = await res.json()` },
                    { lang:"Python", title:"Python", icon: Braces, language:"python", code:`import requests\nresp = requests.get("${base}/${selected}", params={"limit":5})\nprint(resp.json())` },
                  ].map(card=>{
                    const Icon = card.icon
                    return (
                      <div key={card.lang} className="rounded-[9px] border border-[#3B3A36] bg-[#292824] overflow-hidden">
                        <div className="h-8 px-3 flex items-center gap-2 border-b border-[#3B3A36] bg-[#1D1C1A]">
                          <Icon className="w-3.5 h-3.5 text-[#B7B5B0]" />
                          <span className="text-[12px] font-medium text-[#F0EFEC]">{card.lang}</span>
                          <button onClick={()=> copy(card.code, card.lang)} className="ml-auto h-6 px-2 flex items-center gap-1 border border-[#3B3A36] rounded-[5px] text-[11px] text-[#B7B5B0] hover:text-[#F0EFEC] hover:bg-[#292824]">{copied===card.lang ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} {copied===card.lang?"Copied":"Copy"}</button>
                        </div>
                        <ApiCodeBlock code={card.code} language={card.language} minHeight={88} maxHeight={160} />
                      </div>
                    )
                  })}
                </div>

                <div className="rounded-[9px] border border-[#3B3A36] bg-[#292824] p-4">
                  <div className="text-[13px] font-medium text-[#F0EFEC]">What you get</div>
                  <ul className="mt-2 space-y-1.5 text-[13px] text-[#B7B5B0] list-disc list-inside marker:text-[#66645F]">
                    <li>Auto-generated CRUD for each table: <span className="font-mono text-[#F0EFEC] text-[12px]">GET /:table</span>, <span className="font-mono text-[#F0EFEC] text-[12px]">GET /:table/:id</span>, <span className="font-mono text-[#F0EFEC] text-[12px]">POST /:table</span>, <span className="font-mono text-[#F0EFEC] text-[12px]">PATCH /:table/:id</span>, <span className="font-mono text-[#F0EFEC] text-[12px]">DELETE /:table/:id</span>.</li>
                    <li>Query params: <span className="font-mono text-[#F0EFEC] text-[12px]">select</span>, <span className="font-mono text-[#F0EFEC] text-[12px]">limit/offset</span>, <span className="font-mono text-[#F0EFEC] text-[12px]">order</span>, <span className="font-mono text-[#F0EFEC] text-[12px]">eq / neq / gt / lt</span> filters.</li>
                    <li>Responses are <span className="font-mono text-[#F0EFEC] text-[12px]">{"{ data, count }"}</span>. Errors are <span className="font-mono text-[#F0EFEC] text-[12px]">{"{ error }"}</span> with status 400/404.</li>
                  </ul>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#3B3A36]">
                  <span className="text-[12px] text-[#66645F]">Next</span>
                  <a href="/api/endpoints" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#F0EFEC] hover:text-white">Endpoints <ChevronRight className="w-4 h-4" /></a>
                </div>
              </div>

              <div className="mt-10 pt-6 border-t border-[#3B3A36] text-[11px] text-[#66645F] text-center">
                Deck API • <span className="font-mono">/api/rest/:table</span> • built on Postgres
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
