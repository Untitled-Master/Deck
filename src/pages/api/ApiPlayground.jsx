import { useEffect, useMemo, useState } from "react"
import { Copy, Check, Play, ChevronRight, Boxes, BookOpen, Plus, Trash2, Settings2, Braces, FileCode, Terminal, Hash, ArrowUpDown, Filter } from "lucide-react"
import TopBar from "@/components/layout/TopBar"
import LeftNav from "@/components/layout/LeftNav"
import ApiDocsSidebar from "@/components/api/ApiDocsSidebar"
import ApiCodeBlock from "@/components/api/ApiCodeBlock"
import { API_BASE } from "@/lib/api"
import { useApiTables, getCrudTabs } from "@/hooks/useApiTables"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ApiPlayground() {
  const { tables, selected, setSelected, base, cols, primaryCol, sampleCol, connected } = useApiTables()
  const [crudTab, setCrudTab] = useState("read")
  const [copied, setCopied] = useState("")
  const [tryResult, setTryResult] = useState(null)
  const [tryLoading, setTryLoading] = useState(false)

  // ── params state ──
  const [selectStr, setSelectStr] = useState("")
  const [limit, setLimit] = useState("10")
  const [offset, setOffset] = useState("0")
  const [orderCol, setOrderCol] = useState("__none__")
  const [orderDir, setOrderDir] = useState("desc")
  const [filters, setFilters] = useState([]) // {col, op, val}
  const [idValue, setIdValue] = useState("1")
  const [bodyText, setBodyText] = useState('{\n  "name": "hello"\n}')
  const [headersText, setHeadersText] = useState('{\n  "Content-Type": "application/json"\n}')

  const copy = async (t,k)=>{ try{ await navigator.clipboard.writeText(t); setCopied(k); setTimeout(()=>setCopied(""),1400)}catch{} }

  const crudTabs = getCrudTabs(selected)
  const active = crudTabs.find(c=> c.id===crudTab) || crudTabs[0]

  // init defaults when table/columns change
  useEffect(()=>{
    if(cols.length){
      setSelectStr(cols.slice(0,3).join(","))
      setOrderCol(primaryCol || "__none__")
    }
  }, [selected, cols.join(","), primaryCol])

  useEffect(()=>{
    // reset body when table changes or tab switches to create/update
    if(crudTab==="create"){
      const init = {}
      init[sampleCol] = 123
      if(cols[2] && cols[2]!==sampleCol) init[cols[2]] = "hello"
      setBodyText(JSON.stringify(init, null, 2))
    } else if(crudTab==="update"){
      setBodyText(JSON.stringify({ [sampleCol]: 999 }, null, 2))
    }
  }, [crudTab, sampleCol, cols.join(",")])

  useEffect(()=>{
    setFilters([])
    setIdValue("1")
    setLimit("10")
    setOffset("0")
    setOrderDir("desc")
  }, [selected, crudTab])

  // build URL + query
  const built = useMemo(()=>{
    const encode = (s)=> encodeURIComponent(s)
    if(crudTab==="read"){
      const p = new URLSearchParams()
      if(selectStr.trim()) p.set("select", selectStr.trim())
      if(limit) p.set("limit", String(limit))
      if(offset && offset!=="0") p.set("offset", String(offset))
      if(orderCol && orderCol !== "__none__") p.set("order", `${orderCol}.${orderDir}`)
      filters.forEach(f=>{
        if(!f.col || f.val==="") return
        const op = f.op || "eq"
        p.set(f.col, `${op}.${f.val}`)
      })
      const qs = p.toString()
      return `${API_BASE}/api/rest/${selected}${qs?`?${qs}`:""}`
    }
    if(crudTab==="readOne"){
      const id = idValue || "1"
      const p = new URLSearchParams()
      if(selectStr.trim()) p.set("select", selectStr.trim())
      const qs = p.toString()
      return `${API_BASE}/api/rest/${selected}/${encode(id)}${qs?`?${qs}`:""}`
    }
    if(crudTab==="create"){
      return `${API_BASE}/api/rest/${selected}`
    }
    if(crudTab==="update" || crudTab==="del"){
      const id = idValue || "1"
      return `${API_BASE}/api/rest/${selected}/${encode(id)}`
    }
    return `${API_BASE}/api/rest/${selected}`
  }, [crudTab, selected, selectStr, limit, offset, orderCol, orderDir, filters, idValue])

  const builtCurl = useMemo(()=>{
    const m = active.method
    if(m==="GET"){
      return `curl "${built}"`
    }
    if(m==="POST"){
      let body = bodyText.trim() || "{}"
      try { JSON.parse(body); } catch { body = '{"error":"invalid json"}' }
      const oneLine = body.replace(/\n/g, " ")
      return `curl -X POST "${built}" \\\n  -H "Content-Type: application/json" \\\n  -d '${body}'`
    }
    if(m==="PATCH"){
      let body = bodyText.trim() || "{}"
      return `curl -X PATCH "${built}" \\\n  -H "Content-Type: application/json" \\\n  -d '${body}'`
    }
    if(m==="DELETE"){
      return `curl -X DELETE "${built}"`
    }
    return `curl "${built}"`
  }, [active.method, built, bodyText])

  const builtNode = useMemo(()=>{
    const urlVar = `const url = "${built}"`
    if(active.method==="GET"){
      return `${urlVar}\nconst res = await fetch(url)\nconst { data, count } = await res.json()\nconsole.log(data)`
    }
    if(active.method==="POST"){
      return `${urlVar}\nconst res = await fetch(url, {\n  method: "POST",\n  headers: { "Content-Type": "application/json" },\n  body: JSON.stringify(${bodyText.trim() || "{}"}, null, 2)\n})\nconst { data } = await res.json()`
    }
    if(active.method==="PATCH"){
      return `${urlVar}\nconst res = await fetch(url, {\n  method: "PATCH",\n  headers: { "Content-Type": "application/json" },\n  body: JSON.stringify(${bodyText.trim() || "{}"}, null, 2)\n})\nconst { data } = await res.json()`
    }
    return `${urlVar}\nconst res = await fetch(url, { method: "DELETE" })\nconst { data } = await res.json()`
  }, [built, bodyText, active.method])

  const tryFetch = async ()=>{
    setTryLoading(true)
    setTryResult(null)
    try{
      const opts = { method: active.method, headers: { "Content-Type": "application/json" } }
      // try parse headersText if user edited it? for now keep json header
      let extraHeaders = {}
      try { const h = JSON.parse(headersText); if(h && typeof h==="object") extraHeaders = h } catch {}
      opts.headers = { ...opts.headers, ...extraHeaders }
      if(active.method==="POST" || active.method==="PATCH"){
        const t = bodyText.trim()
        if(t){
          try { opts.body = JSON.stringify(JSON.parse(t)) } catch { throw new Error("Body is not valid JSON") }
        }
      }
      const url = built
      const res = await fetch(url, opts)
      const data = await res.json().catch(()=> ({}))
      setTryResult({ status: res.status, ok: res.ok, data, url, method: active.method })
    }catch(e){ setTryResult({ status:0, ok:false, data:{ error:e.message }, url: built, method: active.method }) } finally{ setTryLoading(false) }
  }

  const addFilter = ()=> setFilters(f=> [...f, { col: primaryCol, op: "eq", val: "" }])
  const updateFilter = (i, patch)=> setFilters(f=> f.map((r,idx)=> idx===i ? { ...r, ...patch } : r))
  const removeFilter = (i)=> setFilters(f=> f.filter((_,idx)=> idx!==i))

  return (
    <div className="h-screen flex flex-col bg-[#292824] overflow-hidden">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <LeftNav />
        <div className="flex-1 flex overflow-hidden bg-[#1D1C1A]">
          <ApiDocsSidebar selected={selected} tables={tables} onSelectTable={setSelected} />
          <main className="flex-1 overflow-auto bg-[#1D1C1A]">
            <div className="max-w-[860px] mx-auto px-6 md:px-8 py-8">
              <div className="flex items-center gap-1.5 text-[12px] text-[#85837E]">
                <span>Docs</span><ChevronRight className="w-3 h-3" /><span className="text-[#B7B5B0]">API</span><ChevronRight className="w-3 h-3" /><span className="text-[#F0EFEC] font-medium">Playground</span>
              </div>

              <h1 className="mt-6 text-[28px] font-semibold tracking-tight text-[#F0EFEC]">Playground</h1>
              <p className="mt-2 text-[14px] leading-relaxed text-[#B7B5B0] max-w-[640px]">Build a request with params, headers and body — then run it live. URL and snippets update as you type.</p>

              {/* selectors */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Select value={selected} onValueChange={setSelected}>
                  <SelectTrigger className="h-9 w-[160px] bg-[#292824] border-[#3B3A36] text-[#F0EFEC] font-mono text-[13px]"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#292824] border-[#3B3A36] text-[#F0EFEC]">
                    {tables.map(t=> <SelectItem key={t.name} value={t.name} className="font-mono focus:bg-[#3B3935]">{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={crudTab} onValueChange={setCrudTab}>
                  <SelectTrigger className="h-9 w-[200px] bg-[#292824] border-[#3B3A36] text-[#F0EFEC] text-[13px]"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#292824] border-[#3B3A36] text-[#F0EFEC]">
                    {crudTabs.map(c=> <SelectItem key={c.id} value={c.id} className="focus:bg-[#3B3935]">{c.method} {c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded-[6px] bg-[#292824] border border-[#3B3A36] text-[#85837E] self-center"><span className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-[#22C55E]" : "bg-[#85837E]"}`} />{connected ? "connected" : "mock"}</span>
              </div>

              {/* ── parameters card ── */}
              <div className="mt-6 rounded-[9px] border border-[#3B3A36] bg-[#292824] overflow-hidden">
                <div className="px-4 py-3 border-b border-[#3B3A36] flex items-center gap-2 bg-[#292824]">
                  <Settings2 className="w-4 h-4 text-[#B7B5B0]" />
                  <span className="text-[13px] font-semibold text-[#F0EFEC]">Parameters</span>
                  <span className="text-[11px] px-2 py-1 rounded bg-[#1D1C1A] border border-[#3B3A36] text-[#85837E] font-mono">{active.method} {active.path}</span>
                  <span className="ml-auto hidden sm:inline text-[11px] text-[#66645F]">{selected} • {cols.join(", ")}</span>
                </div>

                <div className="p-4 space-y-5 bg-[#1D1C1A]">
                  {/* READ */}
                  {crudTab==="read" && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                        <div className="md:col-span-6">
                          <label className="text-[11px] tracking-widest font-semibold text-[#85837E] flex items-center gap-1.5"><Hash className="w-3 h-3" /> SELECT</label>
                          <input value={selectStr} onChange={e=> setSelectStr(e.target.value)} placeholder={cols.slice(0,3).join(",")} className="mt-1.5 w-full h-9 px-3 bg-[#292824] border border-[#3B3A36] rounded-[7px] text-[13px] font-mono text-[#F0EFEC] placeholder:text-[#66645F] focus:outline-none focus:border-[#4A4944]" />
                          <div className="text-[11px] text-[#66645F] mt-1">Comma separated — leave empty for <span className="font-mono text-[#85837E]">*</span></div>
                        </div>
                        <div className="md:col-span-3">
                          <label className="text-[11px] tracking-widest font-semibold text-[#85837E]">LIMIT</label>
                          <input value={limit} onChange={e=> setLimit(e.target.value.replace(/[^0-9]/g,""))} className="mt-1.5 w-full h-9 px-3 bg-[#292824] border border-[#3B3A36] rounded-[7px] text-[13px] font-mono text-[#F0EFEC] focus:outline-none focus:border-[#4A4944]" />
                        </div>
                        <div className="md:col-span-3">
                          <label className="text-[11px] tracking-widest font-semibold text-[#85837E]">OFFSET</label>
                          <input value={offset} onChange={e=> setOffset(e.target.value.replace(/[^0-9]/g,""))} className="mt-1.5 w-full h-9 px-3 bg-[#292824] border border-[#3B3A36] rounded-[7px] text-[13px] font-mono text-[#F0EFEC] focus:outline-none focus:border-[#4A4944]" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                        <div className="md:col-span-6">
                          <label className="text-[11px] tracking-widest font-semibold text-[#85837E] flex items-center gap-1.5"><ArrowUpDown className="w-3 h-3" /> ORDER BY</label>
                          <Select value={orderCol} onValueChange={setOrderCol}>
                            <SelectTrigger className="mt-1.5 h-9 bg-[#292824] border-[#3B3A36] text-[#F0EFEC] font-mono text-[13px]"><SelectValue placeholder="— none —" /></SelectTrigger>
                            <SelectContent className="bg-[#292824] border-[#3B3A36] text-[#F0EFEC]">
                              <SelectItem value="__none__" className="focus:bg-[#3B3935]">— none —</SelectItem>
                              {cols.map(c=> <SelectItem key={c} value={c} className="font-mono focus:bg-[#3B3935]">{c}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="md:col-span-3">
                          <label className="text-[11px] tracking-widest font-semibold text-[#85837E]">DIRECTION</label>
                          <Select value={orderDir} onValueChange={setOrderDir}>
                            <SelectTrigger className="mt-1.5 h-9 bg-[#292824] border-[#3B3A36] text-[#F0EFEC] text-[13px]"><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-[#292824] border-[#3B3A36] text-[#F0EFEC]">
                              <SelectItem value="asc" className="focus:bg-[#3B3935]">asc</SelectItem>
                              <SelectItem value="desc" className="focus:bg-[#3B3935]">desc</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="md:col-span-3 flex items-end">
                          <span className="text-[11px] font-mono px-2.5 py-2 rounded bg-[#292824] border border-[#3B3A36] text-[#85837E] w-full text-center">{orderCol && orderCol !== "__none__" ? `order=${orderCol}.${orderDir}` : "no ordering"}</span>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <label className="text-[11px] tracking-widest font-semibold text-[#85837E] flex items-center gap-1.5"><Filter className="w-3 h-3" /> FILTERS</label>
                          <span className="text-[11px] text-[#66645F]">— adds ?col=op.value</span>
                          <button onClick={addFilter} className="ml-auto h-7 px-2.5 flex items-center gap-1 border border-[#3B3A36] bg-[#292824] hover:bg-[#3B3935] rounded-[6px] text-[11px] font-medium text-[#B7B5B0] hover:text-[#F0EFEC]"><Plus className="w-3 h-3" /> Add filter</button>
                        </div>
                        {filters.length===0 ? (
                          <div className="mt-2 text-[12px] text-[#66645F] border border-dashed border-[#3B3A36] rounded-[7px] bg-[#292824]/50 px-3 py-2.5">No filters — click Add filter to add <span className="font-mono text-[#85837E]">?{primaryCol}=eq.1</span></div>
                        ) : (
                          <div className="mt-2 space-y-2">
                            {filters.map((f,i)=> (
                              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                                <div className="col-span-4">
                                  <Select value={f.col} onValueChange={v=> updateFilter(i,{col:v})}>
                                    <SelectTrigger className="h-8 bg-[#292824] border-[#3B3A36] text-[#F0EFEC] font-mono text-[12px]"><SelectValue /></SelectTrigger>
                                    <SelectContent className="bg-[#292824] border-[#3B3A36] text-[#F0EFEC]">
                                      {cols.map(c=> <SelectItem key={c} value={c} className="font-mono focus:bg-[#3B3935]">{c}</SelectItem>)}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="col-span-3">
                                  <Select value={f.op} onValueChange={v=> updateFilter(i,{op:v})}>
                                    <SelectTrigger className="h-8 bg-[#292824] border-[#3B3A36] text-[#F0EFEC] text-[12px]"><SelectValue /></SelectTrigger>
                                    <SelectContent className="bg-[#292824] border-[#3B3A36] text-[#F0EFEC]">
                                      {["eq","neq","gt","lt","gte","lte","like","ilike"].map(op=> <SelectItem key={op} value={op} className="focus:bg-[#3B3935]">{op}</SelectItem>)}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="col-span-4">
                                  <input value={f.val} onChange={e=> updateFilter(i,{val:e.target.value})} placeholder="value" className="w-full h-8 px-2.5 bg-[#292824] border border-[#3B3A36] rounded-[6px] text-[13px] font-mono text-[#F0EFEC] placeholder:text-[#66645F] focus:outline-none focus:border-[#4A4944]" />
                                </div>
                                <button onClick={()=> removeFilter(i)} className="col-span-1 h-8 w-8 flex items-center justify-center border border-[#3B3A36] bg-[#1D1C1A] hover:bg-[#292824] rounded-[6px] text-[#85837E] hover:text-[#EF4444]"><Trash2 className="w-3.5 h-3.5" /></button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {crudTab==="readOne" && (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                      <div className="md:col-span-4">
                        <label className="text-[11px] tracking-widest font-semibold text-[#85837E]">ID — primary key ({primaryCol})</label>
                        <input value={idValue} onChange={e=> setIdValue(e.target.value)} className="mt-1.5 w-full h-9 px-3 bg-[#292824] border border-[#3B3A36] rounded-[7px] text-[13px] font-mono text-[#F0EFEC] focus:outline-none focus:border-[#4A4944]" />
                      </div>
                      <div className="md:col-span-8">
                        <label className="text-[11px] tracking-widest font-semibold text-[#85837E] flex items-center gap-1.5"><Hash className="w-3 h-3" /> SELECT (optional)</label>
                        <input value={selectStr} onChange={e=> setSelectStr(e.target.value)} placeholder={cols.slice(0,3).join(",")} className="mt-1.5 w-full h-9 px-3 bg-[#292824] border border-[#3B3A36] rounded-[7px] text-[13px] font-mono text-[#F0EFEC] placeholder:text-[#66645F] focus:outline-none focus:border-[#4A4944]" />
                      </div>
                    </div>
                  )}

                  {crudTab==="create" && (
                    <div>
                      <label className="text-[11px] tracking-widest font-semibold text-[#85837E] flex items-center gap-1.5"><Braces className="w-3 h-3" /> BODY — JSON object or array</label>
                      <div className="mt-2">
                        <ApiCodeBlock code={bodyText} language="json" minHeight={140} maxHeight={260} editable onChange={setBodyText} />
                      </div>
                      <div className="text-[11px] text-[#66645F] mt-1.5">Will be sent as <span className="font-mono text-[#85837E]">POST {`/api/rest/${selected}`}</span> with <span className="font-mono text-[#85837E]">Content-Type: application/json</span></div>
                    </div>
                  )}

                  {crudTab==="update" && (
                    <>
                      <div>
                        <label className="text-[11px] tracking-widest font-semibold text-[#85837E]">ID — {primaryCol}</label>
                        <input value={idValue} onChange={e=> setIdValue(e.target.value)} className="mt-1.5 w-full md:w-[200px] h-9 px-3 bg-[#292824] border border-[#3B3A36] rounded-[7px] text-[13px] font-mono text-[#F0EFEC] focus:outline-none focus:border-[#4A4944]" />
                      </div>
                      <div>
                        <label className="text-[11px] tracking-widest font-semibold text-[#85837E] flex items-center gap-1.5"><Braces className="w-3 h-3" /> PATCH BODY</label>
                        <div className="mt-2">
                          <ApiCodeBlock code={bodyText} language="json" minHeight={120} maxHeight={220} editable onChange={setBodyText} />
                        </div>
                      </div>
                    </>
                  )}

                  {crudTab==="del" && (
                    <div>
                      <label className="text-[11px] tracking-widest font-semibold text-[#85837E]">ID — {primaryCol}</label>
                      <input value={idValue} onChange={e=> setIdValue(e.target.value)} className="mt-1.5 w-full md:w-[200px] h-9 px-3 bg-[#292824] border border-[#3B3A36] rounded-[7px] text-[13px] font-mono text-[#F0EFEC] focus:outline-none focus:border-[#4A4944]" />
                      <div className="text-[11px] text-[#66645F] mt-1.5">DELETE <span className="font-mono text-[#85837E]">{`/api/rest/${selected}/${idValue || "1"}`}</span> — for bulk delete use filter query like <span className="font-mono text-[#85837E]">?{primaryCol}=eq.1</span> (switch to GET filters above as reference).</div>
                    </div>
                  )}

                  {/* headers row for all */}
                  <div>
                    <label className="text-[11px] tracking-widest font-semibold text-[#85837E] flex items-center gap-1.5"><FileCode className="w-3 h-3" /> HEADERS — JSON</label>
                    <div className="mt-2">
                      <ApiCodeBlock code={headersText} language="json" minHeight={70} maxHeight={120} editable onChange={setHeadersText} />
                    </div>
                    <div className="text-[11px] text-[#66645F] mt-1">Additional headers merged with <span className="font-mono text-[#85837E]">Content-Type</span>. Edit as JSON.</div>
                  </div>
                </div>
              </div>

              {/* request preview */}
              <div className="mt-6 rounded-[9px] border border-[#3B3A36] bg-[#292824] overflow-hidden">
                <div className="px-4 py-3 border-b border-[#3B3A36] flex items-center gap-2 bg-[#292824]">
                  <Terminal className="w-4 h-4 text-[#B7B5B0]" />
                  <span className="text-[13px] font-semibold text-[#F0EFEC]">Request</span>
                  <span className="text-[11px] font-mono px-2 py-1 rounded bg-[#1D1C1A] border border-[#3B3A36] text-[#B7B5B0]">{active.method}</span>
                  <button onClick={()=> copy(built, "url")} className="ml-auto h-7 px-2.5 flex items-center gap-1.5 border border-[#3B3A36] bg-[#1D1C1A] rounded-[6px] text-[11px] text-[#B7B5B0] hover:text-[#F0EFEC]">{copied==="url"?<Check className="w-3 h-3"/>:<Copy className="w-3 h-3" />}{copied==="url"?"Copied":"Copy URL"}</button>
                </div>
                <div className="p-3 bg-[#1D1C1A] space-y-3">
                  <div className="rounded-[7px] border border-[#3B3A36] bg-[#292824] px-3 py-2.5">
                    <div className="text-[11px] tracking-widest font-semibold text-[#85837E]">URL</div>
                    <code className="text-[12px] font-mono text-[#B7B5B0] break-all">{built}</code>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <div className="text-[11px] tracking-widest font-semibold text-[#85837E] mb-1.5">cURL</div>
                      <ApiCodeBlock code={builtCurl} language="shell" minHeight={80} maxHeight={160} />
                    </div>
                    <div>
                      <div className="text-[11px] tracking-widest font-semibold text-[#85837E] mb-1.5">Node.js</div>
                      <ApiCodeBlock code={builtNode} language="javascript" minHeight={80} maxHeight={160} />
                    </div>
                  </div>
                </div>
                <div className="px-4 py-3 bg-[#1D1C1A] border-t border-[#3B3A36] flex items-center gap-3">
                  <button onClick={tryFetch} disabled={tryLoading} className="h-9 px-4 flex items-center gap-2 bg-[#F0EFEC] hover:bg-white disabled:opacity-50 text-[#1D1C1A] rounded-[7px] text-[13px] font-semibold">
                    {tryLoading ? <span className="w-3 h-3 border-2 border-[#1D1C1A]/30 border-t-[#1D1C1A] rounded-full animate-spin" /> : <Play className="w-4 h-4" />} Try {active.method}
                  </button>
                  <span className="text-[11px] text-[#66645F]">No auth • CORS enabled</span>
                  <span className="ml-auto hidden sm:inline text-[11px] font-mono text-[#66645F]">Press Try to execute against {connected ? "live DB" : "mock"}</span>
                </div>
              </div>

              <div className="mt-6 rounded-[9px] border border-[#3B3A36] bg-[#292824] overflow-hidden">
                <div className="h-9 px-4 flex items-center justify-between border-b border-[#3B3A36] bg-[#1D1C1A]">
                  <span className="text-[11px] tracking-widest font-semibold text-[#85837E]">RESPONSE</span>
                  {tryResult && <span className="text-[11px] font-mono px-2 py-1 rounded border bg-[#1D1C1A] border-[#3B3A36] text-[#B7B5B0]">{tryResult.status} {tryResult.ok ? "OK" : "ERROR"}</span>}
                </div>
                <div className="bg-[#1D1C1A] min-h-[240px] p-4">
                  {!tryResult ? (
                    <div className="h-[240px] flex flex-col items-center justify-center text-center border border-dashed border-[#3B3A36] rounded-[8px] bg-[#292824]/40 p-6">
                      <div className="text-[13px] font-medium text-[#F0EFEC]">No request yet</div>
                      <div className="text-[12px] text-[#85837E] mt-1 max-w-[420px]">Configure params above, then click <span className="font-mono text-[#F0EFEC]">Try {active.method}</span> to run against <span className="font-mono text-[#F0EFEC]">{selected}</span>.</div>
                      <code className="mt-3 text-[11px] font-mono px-2.5 py-1 rounded bg-[#1D1C1A] border border-[#3B3A36] text-[#85837E]">{active.method} {active.path}</code>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-[11px] font-mono text-[#85837E]">→ {tryResult.method} {tryResult.url}</div>
                      <ApiCodeBlock code={JSON.stringify(tryResult.data, null, 2)} language="json" minHeight={160} maxHeight={380} />
                      <div className="flex items-center gap-2">
                        <button onClick={()=> copy(JSON.stringify(tryResult.data, null, 2), "resp")} className="h-7 px-2.5 flex items-center gap-1.5 border border-[#3B3A36] bg-[#292824] rounded-[6px] text-[11px] text-[#B7B5B0] hover:text-[#F0EFEC]">{copied==="resp"?<Check className="w-3 h-3"/>:<Copy className="w-3 h-3" />}{copied==="resp"?"Copied":"Copy response"}</button>
                        <button onClick={()=> setTryResult(null)} className="h-7 px-2.5 border border-[#3B3A36] bg-transparent rounded-[6px] text-[11px] text-[#85837E] hover:text-[#F0EFEC]">Clear</button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="px-4 py-2.5 bg-[#292824] border-t border-[#3B3A36] flex items-center gap-2 text-[11px] text-[#85837E]">
                  <BookOpen className="w-3.5 h-3.5" /> Snippets in <a href="/api/examples" className="text-[#B7B5B0] hover:text-[#F0EFEC] underline">Examples</a> hit the same endpoint.
                  <span className="ml-auto font-mono text-[#B7B5B0] hidden sm:inline">{base}/{selected}</span>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between pt-4 border-t border-[#3B3A36]">
                <a href="/api/examples" className="inline-flex items-center gap-1 text-[13px] text-[#85837E] hover:text-[#F0EFEC]"><ChevronRight className="w-4 h-4 rotate-180" /> Examples</a>
                <a href="/api" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#F0EFEC]">Overview <ChevronRight className="w-4 h-4" /></a>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
