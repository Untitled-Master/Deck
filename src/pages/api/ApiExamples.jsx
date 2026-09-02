import { useState } from "react"
import { Copy, Check, Terminal, FileCode, Braces, ChevronRight, Key, Shield, ExternalLink, Boxes } from "lucide-react"
import TopBar from "@/components/layout/TopBar"
import LeftNav from "@/components/layout/LeftNav"
import ApiDocsSidebar from "@/components/api/ApiDocsSidebar"
import ApiCodeBlock from "@/components/api/ApiCodeBlock"
import { useApiTables } from "@/hooks/useApiTables"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ApiExamples() {
  const { tables, selected, setSelected, base, cols, primaryCol, sampleCol } = useApiTables()
  const [copied, setCopied] = useState("")
  const [lang, setLang] = useState("curl") // curl | node | python
  const copy = async (t,k)=>{ try{ await navigator.clipboard.writeText(t); setCopied(k); setTimeout(()=>setCopied(""),1400)}catch{} }

  const examples = [
    {
      title: "List with select & pagination",
      desc: "Pick columns and paginate. Max 500 rows per request.",
      curl: `curl "${base}/${selected}?select=${cols.slice(0,3).join(",")}&limit=10&offset=20"`,
      node: `const params = new URLSearchParams({ select: "${cols.slice(0,3).join(",")}", limit: "10", offset: "20" })\nconst res = await fetch(\`\${base}/${selected}?\${params}\`)\nconst { data, count } = await res.json()`,
      python: `import requests\nparams = {"select": "${cols.slice(0,3).join(",")}", "limit": 10, "offset": 20}\nresp = requests.get("${base}/${selected}", params=params)\nprint(resp.json())`,
    },
    {
      title: "Filter rows",
      desc: "eq, neq, gt, lt — or plain ?col=value for equality.",
      curl: `curl "${base}/${selected}?${primaryCol}=eq.1"\n# neq, gt, lt\ncurl "${base}/${selected}?${sampleCol}=gt.100&order=${primaryCol}.desc"`,
      node: `// equality\nawait fetch("${base}/${selected}?${primaryCol}=eq.1")\n// gt / lt\nawait fetch("${base}/${selected}?${sampleCol}=gt.100&order=${primaryCol}.desc")`,
      python: `requests.get("${base}/${selected}", params={"${primaryCol}": "eq.1"})\nrequests.get("${base}/${selected}", params={"${sampleCol}": "gt.100", "order": "${primaryCol}.desc"})`,
    },
    {
      title: "Create rows",
      desc: "Single object or array for bulk insert. Returns 201.",
      curl: `curl -X POST "${base}/${selected}" \\\n  -H "Content-Type: application/json" \\\n  -d '{"${sampleCol}": 123}'\n\n# bulk\ncurl -X POST "${base}/${selected}" \\\n  -H "Content-Type: application/json" \\\n  -d '[{"${sampleCol}":1},{"${sampleCol}":2}]'`,
      node: `await fetch("${base}/${selected}", {\n  method: "POST",\n  headers: { "Content-Type": "application/json" },\n  body: JSON.stringify({ ${sampleCol}: 123 })\n})\n// bulk\nawait fetch("${base}/${selected}", {\n  method: "POST",\n  headers: { "Content-Type": "application/json" },\n  body: JSON.stringify([{ ${sampleCol}: 1 }, { ${sampleCol}: 2 }])\n})`,
      python: `import requests\nresp = requests.post("${base}/${selected}", json={"${sampleCol}": 123})\n# bulk\nresp = requests.post("${base}/${selected}", json=[{"${sampleCol}": 1}, {"${sampleCol}": 2}])`,
    },
    {
      title: "Update & delete",
      desc: "Patch by id. Delete by id or by filter.",
      curl: `curl -X PATCH "${base}/${selected}/1" \\\n  -H "Content-Type: application/json" \\\n  -d '{"${sampleCol}": 999}'\n\ncurl -X DELETE "${base}/${selected}/1"\n# bulk delete by filter\ncurl -X DELETE "${base}/${selected}?${primaryCol}=eq.1"`,
      node: `await fetch("${base}/${selected}/1", {\n  method: "PATCH",\n  headers: { "Content-Type": "application/json" },\n  body: JSON.stringify({ ${sampleCol}: 999 })\n})\nawait fetch("${base}/${selected}/1", { method: "DELETE" })`,
      python: `requests.patch("${base}/${selected}/1", json={"${sampleCol}": 999})\nrequests.delete("${base}/${selected}/1")\nrequests.delete("${base}/${selected}", params={"${primaryCol}": "eq.1"})`,
    },
  ]

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
                <span>Docs</span><ChevronRight className="w-3 h-3" /><span className="text-[#B7B5B0]">API</span><ChevronRight className="w-3 h-3" /><span className="text-[#F0EFEC] font-medium">Examples</span>
              </div>

              <h1 className="mt-6 text-[28px] font-semibold tracking-tight text-[#F0EFEC]">Examples</h1>
              <p className="mt-2 text-[14px] leading-relaxed text-[#B7B5B0] max-w-[640px]">Copy-paste snippets for <span className="font-mono text-[#F0EFEC]">cURL</span>, <span className="font-mono text-[#F0EFEC]">Node.js</span> and <span className="font-mono text-[#F0EFEC]">Python</span>. Table selector drives all code.</p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Select value={selected} onValueChange={setSelected}>
                  <SelectTrigger className="h-8 w-[160px] bg-[#292824] border-[#3B3A36] text-[#F0EFEC] font-mono text-[13px]"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#292824] border-[#3B3A36] text-[#F0EFEC]">
                    {tables.map(t=> <SelectItem key={t.name} value={t.name} className="font-mono focus:bg-[#3B3935]">{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <span className="text-[11px] font-mono px-2 py-1 rounded bg-[#292824] border border-[#3B3A36] text-[#85837E]">{selected} • {cols.join(", ")}</span>
                <div className="ml-auto flex items-center gap-1 p-1 rounded-[7px] bg-[#292824] border border-[#3B3A36]">
                  {[
                    { id:"curl", label:"cURL", icon: Terminal },
                    { id:"node", label:"Node.js", icon: FileCode },
                    { id:"python", label:"Python", icon: Braces },
                  ].map(l=>{
                    const Icon=l.icon
                    return <button key={l.id} onClick={()=> setLang(l.id)} className={`h-6 px-2.5 flex items-center gap-1.5 rounded-[6px] text-[12px] font-medium ${lang===l.id ? "bg-[#3B3935] text-[#F0EFEC] border border-[#3B3A36]" : "text-[#85837E] hover:text-[#F0EFEC]"}`}><Icon className="w-3.5 h-3.5" />{l.label}</button>
                  })}
                </div>
              </div>

              <div className="mt-8 space-y-6">
                {examples.map(ex=> (
                  <div key={ex.title} className="rounded-[9px] border border-[#3B3A36] bg-[#292824] overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#3B3A36]">
                      <div className="text-[13px] font-semibold text-[#F0EFEC]">{ex.title}</div>
                      <div className="text-[12px] text-[#85837E] mt-0.5">{ex.desc}</div>
                    </div>
                    <div className="bg-[#1D1C1A] relative p-2">
                      <button onClick={()=> copy(ex[lang], ex.title)} className="absolute top-3 right-3 z-10 h-7 px-2.5 flex items-center gap-1.5 border border-[#3B3A36] bg-[#292824] rounded-[6px] text-[11px] text-[#B7B5B0] hover:text-[#F0EFEC] hover:bg-[#3B3935]">{copied===ex.title ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}{copied===ex.title?"Copied":"Copy"}</button>
                      <ApiCodeBlock code={ex[lang]} language={lang==="curl" ? "shell" : lang==="node" ? "javascript" : "python"} minHeight={90} maxHeight={260} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-[9px] border border-[#3B3A36] bg-[#292824] overflow-hidden">
                <div className="px-4 py-3 border-b border-[#3B3A36] flex items-center gap-2">
                  <Key className="w-4 h-4 text-[#B7B5B0]" />
                  <span className="text-[13px] font-semibold text-[#F0EFEC]">Query params — Supabase style</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#3B3A36]">
                  {[
                    { code:"?select=id,name", desc:"Pick columns", ex:`curl "${base}/${selected}?select=id,${sampleCol}"` },
                    { code:"?limit=10&offset=20", desc:"Paginate", ex:`fetch("${base}/${selected}?limit=10&offset=20")` },
                    { code:"?order=name.desc", desc:"Order", ex:`?order=${primaryCol}.desc` },
                    { code:"?id=eq.1", desc:"Filter", ex:`requests.get(url, params={"${primaryCol}":"eq.1"})` },
                  ].map(i=> (
                    <div key={i.code} className="p-4">
                      <code className="text-[12px] font-mono px-2 py-1 rounded bg-[#1D1C1A] border border-[#3B3A36] text-[#B7B5B0]">{i.code}</code>
                      <span className="text-[12px] text-[#B7B5B0] ml-2">— {i.desc}</span>
                      <div className="text-[11px] font-mono text-[#66645F] mt-1 truncate">{i.ex}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 rounded-[9px] border border-[#3B3A36] bg-[#292824] p-4">
                <div className="text-[13px] font-semibold text-[#F0EFEC] flex items-center gap-2"><Shield className="w-4 h-4 text-[#B7B5B0]" /> Production checklist</div>
                <ul className="mt-2 space-y-1 text-[13px] text-[#B7B5B0] list-disc list-inside marker:text-[#66645F]">
                  <li>Add auth middleware (check <span className="font-mono text-[#B7B5B0] text-[12px]">Authorization</span>).</li>
                  <li>Whitelist tables — don't expose internal ones.</li>
                  <li>Rate-limit <span className="font-mono text-[#B7B5B0] text-[12px]">/api/rest/*</span>.</li>
                </ul>
              </div>

              <div className="mt-8 flex items-center justify-between pt-4 border-t border-[#3B3A36]">
                <a href="/api/endpoints" className="inline-flex items-center gap-1 text-[13px] text-[#85837E] hover:text-[#F0EFEC]"><ChevronRight className="w-4 h-4 rotate-180" /> Endpoints</a>
                <a href="/api/playground" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#F0EFEC]">Playground <ChevronRight className="w-4 h-4" /></a>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
