import { useEffect, useState } from "react"
import { api, API_BASE } from "@/lib/api"
import { useConnection } from "@/context/ConnectionContext"
import { FAKE_API_TABLES } from "@/lib/fakeData"

const MOCK_TABLES = FAKE_API_TABLES

export function useApiTables() {
  const { connected } = useConnection()
  const [tables, setTables] = useState(MOCK_TABLES)
  const [selected, setSelected] = useState("test")

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

  return { tables, selected, setSelected, base, cols, primaryCol, sampleCol, connected }
}

export function getCrudTabs(selected){
  return [
    { id:"read", label:"List rows", shortLabel:"List", method:"GET", path:`/api/rest/${selected}`, desc:"List rows with filtering, pagination and ordering. Supabase-compatible query params." },
    { id:"readOne", label:"Get one", shortLabel:"Get one", method:"GET", path:`/api/rest/${selected}/:id`, desc:"Get a single row by primary key. Returns 404 if not found." },
    { id:"create", label:"Create", shortLabel:"Create", method:"POST", path:`/api/rest/${selected}`, desc:"Insert one or many rows. Returns inserted rows with 201." },
    { id:"update", label:"Update", shortLabel:"Update", method:"PATCH", path:`/api/rest/${selected}/:id`, desc:"Update a row by primary key. Only provided fields are patched." },
    { id:"del", label:"Delete", shortLabel:"Delete", method:"DELETE", path:`/api/rest/${selected}/:id`, desc:"Delete a row by primary key. Returns deleted row." },
  ]
}

export function curlFor(tab, base, selected, cols, primaryCol, sampleCol){
  switch(tab.id){
    case "read": return `curl "${base}/${selected}?select=${cols.slice(0,3).join(",")}&limit=10&order=${primaryCol}.desc"`
    case "readOne": return `curl "${base}/${selected}/1" \\\n  -H "Accept: application/json"`
    case "create": return `curl -X POST "${base}/${selected}" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "${sampleCol}": 123,\n    "${cols[2]||sampleCol}": "hello"\n  }'`
    case "update": return `curl -X PATCH "${base}/${selected}/1" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "${sampleCol}": 999\n  }'`
    case "del": return `curl -X DELETE "${base}/${selected}/1"`
    default: return ""
  }
}
export function nodeFor(tab, base, selected, cols, primaryCol, sampleCol){
  switch(tab.id){
    case "read": return `// Node.js 18+ — native fetch (no install)\nconst base = "${base}"\nconst params = new URLSearchParams({\n  select: "${cols.slice(0,3).join(",")}",\n  limit: "10",\n  order: "${primaryCol}.desc"\n})\n\nconst res = await fetch(\`\${base}/${selected}?\${params}\`)\nconst { data, count } = await res.json()\nconsole.log(\`got \${data.length} rows\`, data)\n// filter: ?${primaryCol}=eq.1  pagination: ?limit=10&offset=20\n`
    case "readOne": return `const res = await fetch("${base}/${selected}/1")\nif (!res.ok) throw new Error("Not found")\nconst { data } = await res.json()\nconsole.log(data)\n`
    case "create": return `const res = await fetch("${base}/${selected}", {\n  method: "POST",\n  headers: { "Content-Type": "application/json" },\n  body: JSON.stringify({\n    ${sampleCol}: 123,\n    ${cols[2] ? `${cols[2]}: "hello"` : `"name": "example"`}\n  })\n})\nconst { data } = await res.json()\nconsole.log("created:", data[0])\n// bulk: body can be an array [{...},{...}]\n`
    case "update": return `const res = await fetch("${base}/${selected}/1", {\n  method: "PATCH",\n  headers: { "Content-Type": "application/json" },\n  body: JSON.stringify({ ${sampleCol}: 999 })\n})\nconst { data } = await res.json()\nconsole.log("updated:", data)\n`
    case "del": return `const res = await fetch("${base}/${selected}/1", {\n  method: "DELETE"\n})\nconst { data } = await res.json()\nconsole.log("deleted:", data)\n// bulk delete: DELETE ${base}/${selected}?${primaryCol}=eq.1\n`
    default: return ""
  }
}
export function pythonFor(tab, base, selected, cols, primaryCol, sampleCol){
  switch(tab.id){
    case "read": return `import requests\n\nbase = "${base}"\nparams = {\n    "select": "${cols.slice(0,3).join(",")}",\n    "limit": 10,\n    "order": "${primaryCol}.desc",\n    # "filter": "${primaryCol}=eq.1"  # add any column filter\n}\nresp = requests.get(f"{base}/${selected}", params=params)\nresp.raise_for_status()\ndata = resp.json()\nprint(f"got {len(data['data'])} rows")\nprint(data["data"][:2])\n`
    case "readOne": return `import requests\n\nresp = requests.get("${base}/${selected}/1")\nif resp.status_code == 404:\n    print("not found")\nelse:\n    resp.raise_for_status()\n    print(resp.json()["data"])\n`
    case "create": return `import requests\n\npayload = {\n    "${sampleCol}": 123,\n    "${cols[2]||"name"}": "hello"\n}\nresp = requests.post("${base}/${selected}", json=payload)\nresp.raise_for_status()\nprint(resp.json())  # {"data": [...], "count": 1}\n# bulk: payload = [{...}, {...}]\n`
    case "update": return `import requests\n\nresp = requests.patch(\n    "${base}/${selected}/1",\n    json={"${sampleCol}": 999}\n)\nresp.raise_for_status()\nprint(resp.json()["data"])\n`
    case "del": return `import requests\n\nresp = requests.delete("${base}/${selected}/1")\nresp.raise_for_status()\nprint(resp.json())\n# with filter: requests.delete("${base}/${selected}", params={"${primaryCol}": "eq.1"})\n`
    default: return ""
  }
}
