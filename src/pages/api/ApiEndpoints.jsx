import { useState } from "react"
import { Copy, Check, Table2, Key, Search, Hash, Filter, ArrowUpDown, Terminal, FileCode, Braces, ChevronRight, Boxes } from "lucide-react"
import TopBar from "@/components/layout/TopBar"
import LeftNav from "@/components/layout/LeftNav"
import ApiDocsSidebar from "@/components/api/ApiDocsSidebar"
import ApiCodeBlock from "@/components/api/ApiCodeBlock"
import { API_BASE } from "@/lib/api"
import { useApiTables, getCrudTabs, curlFor, nodeFor, pythonFor } from "@/hooks/useApiTables"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ApiEndpoints() {
  const { tables, selected, setSelected, base, cols, primaryCol, sampleCol, connected } = useApiTables()
  const [crudTab, setCrudTab] = useState("read")
  const [codeLang, setCodeLang] = useState("curl")
  const [copied, setCopied] = useState("")
  const copy = async (t,k)=>{ try{ await navigator.clipboard.writeText(t); setCopied(k); setTimeout(()=>setCopied(""),1400)}catch{} }

  const crudTabs = getCrudTabs(selected)
  const active = crudTabs.find(c=> c.id===crudTab) || crudTabs[0]
  const snippet = codeLang==="curl" ? curlFor(active, base, selected, cols, primaryCol, sampleCol) : codeLang==="node" ? nodeFor(active, base, selected, cols, primaryCol, sampleCol) : pythonFor(active, base, selected, cols, primaryCol, sampleCol)

  const responseExample = (() => {
    switch(active.id){
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
        <div className="flex-1 flex overflow-hidden bg-[#1D1C1A]">
          <ApiDocsSidebar selected={selected} tables={tables} onSelectTable={setSelected} />
          <main className="flex-1 overflow-auto bg-[#1D1C1A]">
            <div className="max-w-[900px] mx-auto px-6 md:px-8 py-8">
              <div className="flex items-center gap-1.5 text-[12px] text-[#85837E]">
                <span>Docs</span><ChevronRight className="w-3 h-3" /><span className="text-[#B7B5B0]">API</span><ChevronRight className="w-3 h-3" /><span className="text-[#F0EFEC] font-medium">Endpoints</span>
              </div>

              <h1 className="mt-6 text-[28px] font-semibold tracking-tight text-[#F0EFEC]">Endpoints</h1>
              <p className="mt-2 text-[14px] leading-relaxed text-[#B7B5B0] max-w-[640px]">Five operations per table. Pick a table, pick an operation — snippets update for <span className="font-mono text-[#F0EFEC]">cURL</span>, <span className="font-mono text-[#F0EFEC]">Node.js</span> and <span className="font-mono text-[#F0EFEC]">Python</span>.</p>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] tracking-widest text-[#66645F]">TABLE</span>
                  <Select value={selected} onValueChange={setSelected}>
                    <SelectTrigger className="h-8 w-[160px] bg-[#292824] border-[#3B3A36] text-[#F0EFEC] font-mono text-[13px]"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#292824] border-[#3B3A36] text-[#F0EFEC]">
                      {tables.map(t=> <SelectItem key={t.name} value={t.name} className="font-mono focus:bg-[#3B3935]">{t.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded-[6px] bg-[#292824] border border-[#3B3A36] text-[#85837E] self-center"><Boxes className="w-3 h-3" />{selected} • {cols.join(", ")}</span>
              </div>

              {/* endpoint picker — docs style tabs */}
              <div className="mt-6 border border-[#3B3A36] rounded-[9px] bg-[#292824] p-1.5">
                <div className="hidden sm:grid grid-cols-5 gap-1">
                  {crudTabs.map(c=> (
                    <button key={c.id} onClick={()=> setCrudTab(c.id)} className={`flex flex-col items-start gap-1 px-3 py-2.5 rounded-[7px] border text-left ${crudTab===c.id ? "bg-[#1D1C1A] border-[#3B3A36] text-[#F0EFEC]" : "bg-transparent border-transparent text-[#B7B5B0] hover:bg-[#1D1C1A] hover:border-[#3B3A36]/60 hover:text-[#F0EFEC]"}`}>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${c.method==="GET"?"bg-[#1D1C1A] border-[#3B3A36] text-[#B7B5B0]":c.method==="POST"?"bg-[#1D1C1A] border-[#3B3A36] text-[#B7B5B0]":c.method==="PATCH"?"bg-[#1D1C1A] border-[#3B3A36] text-[#B7B5B0]":"bg-[#1D1C1A] border-[#3B3A36] text-[#B7B5B0]"}`}>{c.method}</span>
                      <span className="text-[12px] font-medium leading-none">{c.shortLabel}</span>
                      <span className="text-[11px] font-mono text-[#66645F] truncate w-full">{c.path.split("/").slice(-1)[0].replace(":id","{id}")}</span>
                    </button>
                  ))}
                </div>
                <div className="sm:hidden">
                  <Select value={crudTab} onValueChange={setCrudTab}>
                    <SelectTrigger className="h-9 bg-[#1D1C1A] border-[#3B3A36] text-[#F0EFEC]"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#292824] border-[#3B3A36] text-[#F0EFEC]">
                      {crudTabs.map(c=> <SelectItem key={c.id} value={c.id} className="focus:bg-[#3B3935]">{c.method} {c.label} — {c.path}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* endpoint detail docs */}
              <div className="mt-6 rounded-[9px] border border-[#3B3A36] bg-[#292824] overflow-hidden">
                <div className="px-5 py-4 border-b border-[#3B3A36]">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold px-2 py-1 rounded-[6px] border bg-[#1D1C1A] border-[#3B3A36] text-[#B7B5B0] tracking-wide">{active.method}</span>
                    <code className="text-[13px] font-mono text-[#F0EFEC] break-all">{active.path}</code>
                    <button onClick={()=> copy(`${API_BASE}${active.path}`, "path")} className="ml-1 w-6 h-6 flex items-center justify-center rounded border border-[#3B3A36] bg-[#1D1C1A] text-[#85837E] hover:text-[#F0EFEC]">{copied==="path" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}</button>
                  </div>
                  <p className="text-[13px] text-[#B7B5B0] mt-2 leading-relaxed">{active.desc}</p>
                  <div className="mt-2 flex gap-1.5 text-[11px]">
                    <span className="px-2 py-1 rounded bg-[#1D1C1A] border border-[#3B3A36] text-[#85837E]">JSON</span>
                    <span className="px-2 py-1 rounded bg-[#1D1C1A] border border-[#3B3A36] text-[#85837E]">CORS</span>
                    <span className="px-2 py-1 rounded bg-[#1D1C1A] border border-[#3B3A36] text-[#85837E]">public</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.9fr] gap-0">
                  <div className="bg-[#1D1C1A] border-r-0 lg:border-r border-b lg:border-b-0 border-[#3B3A36] flex flex-col">
                    <div className="h-9 px-3 flex items-center gap-1 border-b border-[#3B3A36] bg-[#1D1C1A]">
                      <div className="flex items-center gap-1 p-1 rounded-[7px] bg-[#292824] border border-[#3B3A36]">
                        {[
                          { id:"curl", label:"cURL", icon: Terminal },
                          { id:"node", label:"Node.js", icon: FileCode },
                          { id:"python", label:"Python", icon: Braces },
                        ].map(l=>{
                          const Icon=l.icon
                          return <button key={l.id} onClick={()=> setCodeLang(l.id)} className={`h-6 px-2.5 flex items-center gap-1.5 rounded-[6px] text-[12px] font-medium ${codeLang===l.id ? "bg-[#3B3935] text-[#F0EFEC] border border-[#3B3A36]" : "text-[#85837E] hover:text-[#F0EFEC]"}`}><Icon className="w-3.5 h-3.5" />{l.label}</button>
                        })}
                      </div>
                      <button onClick={()=> copy(snippet, `code-${codeLang}`)} className="ml-auto h-7 px-2.5 flex items-center gap-1.5 border border-[#3B3A36] bg-[#292824] rounded-[6px] text-[11px] text-[#B7B5B0] hover:text-[#F0EFEC]">{copied===`code-${codeLang}` ? <><Check className="w-3 h-3" />Copied</> : <><Copy className="w-3 h-3" />Copy</>}</button>
                    </div>
                    <div className="p-2 bg-[#1D1C1A]">
                      <ApiCodeBlock code={snippet} language={codeLang==="curl" ? "shell" : codeLang==="node" ? "javascript" : "python"} minHeight={220} maxHeight={320} />
                    </div>
                  </div>
                  <div className="bg-[#1D1C1A] flex flex-col">
                    <div className="h-9 px-3 flex items-center justify-between border-b border-[#3B3A36] bg-[#1D1C1A]">
                      <span className="text-[11px] tracking-widest font-semibold text-[#85837E]">RESPONSE</span>
                      <span className="text-[11px] font-mono px-2 py-1 rounded bg-[#292824] border border-[#3B3A36] text-[#B7B5B0]">200 OK</span>
                    </div>
                    <div className="p-2 bg-[#1D1C1A] flex-1">
                      <ApiCodeBlock code={responseExample} language="json" minHeight={220} maxHeight={320} />
                    </div>
                  </div>
                </div>
              </div>

              {/* query params docs */}
              <div className="mt-8">
                <h2 className="text-[15px] font-semibold text-[#F0EFEC]">Query parameters</h2>
                <p className="text-[13px] text-[#85837E] mt-1">Supabase-style. Combine freely.</p>
                <div className="mt-3 rounded-[9px] border border-[#3B3A36] bg-[#292824] overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#3B3A36]">
                    {[
                      { code:"?select=id,name", desc:"Pick columns", ex:`select=${cols.slice(0,2).join(",")}` },
                      { code:"?limit=10&offset=20", desc:"Paginate (max 500)", ex:"limit=10 offset=20" },
                      { code:"?order=name.desc", desc:"Order .asc / .desc", ex:`order=${primaryCol}.desc` },
                      { code:"?id=eq.1", desc:"Filter eq / neq / gt / lt", ex:`${primaryCol}=eq.1` },
                    ].map(i=> (
                      <div key={i.code} className="p-4">
                        <code className="text-[12px] font-mono px-2 py-1 rounded bg-[#1D1C1A] border border-[#3B3A36] text-[#B7B5B0]">{i.code}</code>
                        <span className="text-[12px] text-[#B7B5B0] ml-2">— {i.desc}</span>
                        <div className="text-[11px] font-mono text-[#66645F] mt-1">{i.ex}</div>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2.5 bg-[#1D1C1A] border-t border-[#3B3A36] flex items-center gap-2 text-[11px] text-[#85837E]">
                    <span>Combine:</span><code className="font-mono text-[#B7B5B0]">?select=id,{sampleCol}&{primaryCol}=eq.1&order={primaryCol}.desc&limit=5</code>
                    <button onClick={()=> copy(`${base}/${selected}?select=id,${sampleCol}&limit=5&order=${primaryCol}.desc`, "combo")} className="ml-auto h-6 px-2 flex items-center gap-1 border border-[#3B3A36] rounded-[6px] bg-[#292824] text-[#B7B5B0] hover:text-[#F0EFEC]">{copied==="combo"?<Check className="w-3 h-3"/>:<Copy className="w-3 h-3" />}{copied==="combo"?"Copied":"Copy"}</button>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between pt-4 border-t border-[#3B3A36]">
                <a href="/api" className="inline-flex items-center gap-1 text-[13px] text-[#85837E] hover:text-[#F0EFEC]"><ChevronRight className="w-4 h-4 rotate-180" /> Overview</a>
                <a href="/api/examples" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#F0EFEC] hover:text-white">Examples <ChevronRight className="w-4 h-4" /></a>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
