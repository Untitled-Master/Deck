import Editor from "@monaco-editor/react"
import { Play, Copy, Wand2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { MONACO_THEMES } from "@/lib/monacoThemes"
import { api } from "@/lib/api"
import { useConnection } from "@/context/ConnectionContext"

import { FAKE_HOVER_SCHEMAS } from "@/lib/fakeData"

const MOCK_HOVER_SCHEMAS = FAKE_HOVER_SCHEMAS

function getEditorSettings() {
  try {
    const raw = localStorage.getItem("deck:settings")
    if (!raw) return {}
    const j = JSON.parse(raw)
    return j?.editor || {}
  } catch { return {} }
}

function getInitialTheme() {
  const s = getEditorSettings()
  const t = s.monacoTheme
  if (t && MONACO_THEMES.some(x => x.id === t)) return t
  return "deck-dark"
}

function defineDeckThemes(monaco) {
  try {
    MONACO_THEMES.forEach(th => {
      if (th.id === "vs" || th.id === "vs-dark" || th.id.startsWith("hc-")) return
      monaco.editor.defineTheme(th.id, {
        base: th.base || "vs-dark",
        inherit: true,
        rules: th.rules || [],
        colors: th.colors || {},
      })
    })
  } catch {}
}

// Auto-capitalize SQL keywords while preserving strings/comments
const SQL_AUTOCAP_KEYWORDS = [
  "select","from","where","limit","offset","join","left","right","inner","outer","cross","full","on","and","or","not","in","exists","between","like","ilike","is","null","as","asc","desc","order","group","by","having","distinct","union","all","insert","into","values","update","set","delete","create","drop","alter","table","view","index","primary","key","foreign","references","constraint","default","unique","check","with","recursive","case","when","then","else","end","cast","true","false","count","sum","avg","min","max","coalesce","nullif","over","partition","window","rows","range","preceding","following","current","row","only","for","share","nowait","skip","locked","returning","truncate","explain","analyze","begin","commit","rollback","transaction","grant","revoke","serial","bigserial","varchar","integer","int","smallint","bigint","boolean","bool","text","date","timestamp","timestamptz","time","uuid","json","jsonb","numeric","decimal","float","double","precision","char","character","varying"
]
const SQL_AUTOCAP_SET = new Set(SQL_AUTOCAP_KEYWORDS)

function capitalizeSqlText(text) {
  const keywords = SQL_AUTOCAP_SET
  let out = ""
  const n = text.length
  let inSingle = false
  let inDouble = false
  let inLineComment = false
  let inBlockComment = false
  let dollarTag = null

  for (let i = 0; i < n; ) {
    const ch = text[i]
    const next = text[i + 1]

    // dollar quotes $$ or $tag$ — treat as quoted region like strings
    if (!inSingle && !inDouble && !inLineComment && !inBlockComment) {
      if (ch === "$") {
        const m = text.slice(i).match(/^\$[a-zA-Z0-9_]*\$/)
        if (m) {
          const tag = m[0]
          if (dollarTag === null) {
            dollarTag = tag
            out += tag
            i += tag.length
            continue
          } else if (dollarTag === tag) {
            dollarTag = null
            out += tag
            i += tag.length
            continue
          }
        }
      }
      if (dollarTag !== null) {
        out += ch
        i++
        continue
      }
    } else if (dollarTag !== null) {
      // inside dollar quote — copy verbatim until closing tag handled above
      // Check for closing tag at this position (already handled)
      out += ch
      i++
      continue
    }

    if (inLineComment) {
      out += ch
      if (ch === "\n") inLineComment = false
      i++
      continue
    }
    if (inBlockComment) {
      out += ch
      if (ch === "*" && next === "/") {
        out += next
        i += 2
        inBlockComment = false
        continue
      }
      i++
      continue
    }
    if (!inSingle && !inDouble && !inLineComment && !inBlockComment) {
      if (ch === "-" && next === "-") {
        inLineComment = true
        out += ch
        i++
        continue
      }
      if (ch === "/" && next === "*") {
        inBlockComment = true
        out += ch
        i++
        continue
      }
    }
    if (!inLineComment && !inBlockComment) {
      if (ch === "'" && !inDouble && dollarTag === null) {
        if (inSingle && next === "'") {
          out += "''"
          i += 2
          continue
        }
        inSingle = !inSingle
        out += ch
        i++
        continue
      }
      if (ch === '"' && !inSingle && dollarTag === null) {
        if (inDouble && next === '"') {
          out += '""'
          i += 2
          continue
        }
        inDouble = !inDouble
        out += ch
        i++
        continue
      }
    }
    if (inSingle || inDouble || inLineComment || inBlockComment || dollarTag !== null) {
      out += ch
      i++
      continue
    }
    // not in literal/comment: try to match word
    if (/[A-Za-z_]/.test(ch)) {
      let j = i + 1
      while (j < n && /[A-Za-z0-9_$]/.test(text[j])) j++
      const word = text.slice(i, j)
      const lower = word.toLowerCase()
      if (keywords.has(lower)) {
        out += word.toUpperCase()
      } else {
        out += word
      }
      i = j
      continue
    }
    out += ch
    i++
  }
  return out
}

export default function SqlEditor({ query, setQuery, onRun, isRunning }) {
  const [copied, setCopied] = useState(false)
  const [monacoTheme, setMonacoTheme] = useState(() => getInitialTheme())
  const [fontSize, setFontSize] = useState(() => getEditorSettings().fontSize ?? 13)
  const [wordWrap, setWordWrap] = useState(() => (getEditorSettings().wordWrap ?? true) ? "on" : "off")
  const [minimap, setMinimap] = useState(() => !!getEditorSettings().minimap)
  const [autocomplete, setAutocomplete] = useState(() => getEditorSettings().autocomplete ?? true)
  const monacoRef = useRef(null)
  const editorRef = useRef(null)
  const { connected } = useConnection()
  const schemaMapRef = useRef(new Map())
  const hoverDisposablesRef = useRef([])
  const unknownTablesRef = useRef(new Set())
  const isAutoCapitalizingRef = useRef(false)
  const [monacoReady, setMonacoReady] = useState(0)
  const [schemaTick, setSchemaTick] = useState(0)
  const handleCopy = () => { navigator.clipboard.writeText(query); setCopied(true); setTimeout(()=>setCopied(false),1200) }

  useEffect(() => {
    const sync = () => {
      const s = getEditorSettings()
      const t = s.monacoTheme && MONACO_THEMES.some(x=>x.id===s.monacoTheme) ? s.monacoTheme : "deck-dark"
      setMonacoTheme(prev => prev !== t ? t : prev)
      setFontSize(s.fontSize ?? 13)
      setWordWrap((s.wordWrap ?? true) ? "on" : "off")
      setMinimap(!!s.minimap)
      setAutocomplete(s.autocomplete ?? true)
    }
    sync()
    const onStorage = (e) => { if (!e.key || e.key === "deck:settings") sync() }
    window.addEventListener("storage", onStorage)
    const id = setInterval(sync, 600)
    const onCustom = () => sync()
    window.addEventListener("deck:settings:update", onCustom)
    return () => { window.removeEventListener("storage", onStorage); window.removeEventListener("deck:settings:update", onCustom); clearInterval(id) }
  }, [])

  // apply theme immediately when it changes and monaco is ready
  useEffect(() => {
    if (monacoRef.current) {
      try {
        // ensure theme is defined (in case it was added after mount)
        const th = MONACO_THEMES.find(t=>t.id===monacoTheme)
        if (th && !["vs","vs-dark","hc-black","hc-light"].includes(th.id)) {
          defineDeckThemes(monacoRef.current)
        }
        monacoRef.current.editor.setTheme(monacoTheme)
      } catch {}
    }
  }, [monacoTheme])

  // load schema: when connected, fetch from API; otherwise use mock
  useEffect(() => {
    unknownTablesRef.current.clear()
    let cancelled = false
    async function load() {
      if (!connected) {
        const map = new Map()
        MOCK_HOVER_SCHEMAS.forEach(t => {
          map.set(t.name.toLowerCase(), { name: t.name, columns: t.columns })
        })
        if (!cancelled) {
          schemaMapRef.current = map
          setSchemaTick(v => v + 1)
        }
        return
      }
      try {
        const res = await api.schema()
        if (cancelled) return
        if (res.tables && res.tables.length) {
          const map = new Map()
          res.tables.forEach(t => {
            map.set(t.name.toLowerCase(), { name: t.name, columns: t.columns || [] })
          })
          schemaMapRef.current = map
          setSchemaTick(v => v + 1)
          return
        }
      } catch {}
      // fallback: fetch table list and keep empty columns (lazy fetch on hover)
      try {
        const r = await api.tables()
        if (cancelled) return
        const map = new Map()
        r.tables.forEach(t => map.set(t.name.toLowerCase(), { name: t.name, columns: [] }))
        // merge any mock columns that overlap for nicer offline fallback while loading?
        // keep API list as source of truth
        schemaMapRef.current = map
        setSchemaTick(v => v + 1)
      } catch {
        if (!cancelled && schemaMapRef.current.size === 0) {
          const map = new Map()
          MOCK_HOVER_SCHEMAS.forEach(t => map.set(t.name.toLowerCase(), { name: t.name, columns: t.columns }))
          schemaMapRef.current = map
          setSchemaTick(v => v + 1)
        }
      }
    }
    load()
    return () => { cancelled = true }
  }, [connected])

  // register Monaco hover provider for table names -> column preview
  useEffect(() => {
    const monaco = monacoRef.current
    if (!monaco) return
    // dispose previous
    hoverDisposablesRef.current.forEach(d => { try { d.dispose() } catch {} })
    hoverDisposablesRef.current = []

    const SQL_KEYWORDS = new Set([
      "select","from","where","limit","offset","join","left","right","inner","outer","cross","full","on","and","or","not","in","exists","between","like","ilike","is","null","as","asc","desc","order","group","by","having","distinct","union","all","insert","into","values","update","set","delete","create","drop","alter","table","view","index","primary","key","foreign","references","constraint","default","unique","check","with","recursive","case","when","then","else","end","cast","true","false","count","sum","avg","min","max","coalesce","nullif","over","partition","window","rows","range","preceding","following","current","row","only","for","share","nowait","skip","locked","returning"
    ])

    const provider = {
      provideHover: async (model, position) => {
        const wordInfo = model.getWordAtPosition(position)
        if (!wordInfo) return null
        const raw = wordInfo.word
        if (!raw) return null
        const cleaned = raw.replace(/^["'`]+|["'`]+$/g, "").toLowerCase()
        if (!cleaned || cleaned.length < 1) return null
        if (SQL_KEYWORDS.has(cleaned)) return null

        const map = schemaMapRef.current
        // avoid repeated network calls for words already known to be non-tables
        if (unknownTablesRef.current.has(cleaned)) return null
        let entry = map.get(cleaned)

        // If not in map and connected, try to discover table dynamically (handles tables not in initial list, casing, etc.)
        if (!entry && connected) {
          // try strip schema prefix if present: we only have word, but check line for qualified name
          // attempt to fetch columns directly — if table exists API will return columns
          try {
            const tableNameRaw = raw.replace(/^["'`]+|["'`]+$/g, "")
            const colsRes = await api.columns(tableNameRaw)
            if (colsRes && Array.isArray(colsRes.columns)) {
              entry = { name: colsRes.table || tableNameRaw, columns: colsRes.columns }
              map.set(cleaned, entry)
              map.set(entry.name.toLowerCase(), entry)
            } else {
              unknownTablesRef.current.add(cleaned)
              return null
            }
          } catch {
            // not a table — cache negative to avoid churn
            unknownTablesRef.current.add(cleaned)
            return null
          }
        }

        if (!entry) return null

        let cols = entry.columns
        // lazy fetch columns if empty and online
        if ((!cols || cols.length === 0) && connected) {
          try {
            const colsRes = await api.columns(entry.name)
            if (colsRes && Array.isArray(colsRes.columns)) {
              cols = colsRes.columns
              entry.columns = cols
              map.set(cleaned, entry)
              map.set(entry.name.toLowerCase(), entry)
            }
          } catch {}
        }
        if (!cols) cols = []

        const range = new monaco.Range(position.lineNumber, wordInfo.startColumn, position.lineNumber, wordInfo.endColumn)

        if (!cols.length) {
          return {
            range,
            contents: [{ value: `**${entry.name}** — no columns found` }],
          }
        }

        const header = `**${entry.name}** — ${cols.length} column${cols.length !== 1 ? "s" : ""}`
        const mdRows = cols.map(c => {
          const colName = c.column ?? c.name ?? String(c)
          const colType = c.type ?? c.udtName ?? "unknown"
          const badges = []
          if (c.isPrimary) badges.push("PK")
          if (c.isUnique) badges.push("UNIQUE")
          if (c.foreignKey) badges.push(`FK → ${c.foreignKey.foreign_table}.${c.foreignKey.foreign_column}`)
          else if (c.isFK) badges.push("FK")
          if (c.nullable === false) badges.push("NOT NULL")
          const badgeStr = badges.length ? ` _${badges.join(", ")}_` : ""
          const escName = String(colName).replace(/\|/g, "\\|")
          const escType = String(colType).replace(/\|/g, "\\|")
          return `| ${escName} | ${escType}${badgeStr} |`
        })
        const md = [
          header,
          "",
          "| column | type |",
          "|---|---|",
          ...mdRows,
        ].join("\n")

        return {
          range,
          contents: [{ value: md }],
        }
      },
    }

    try {
      const d1 = monaco.languages.registerHoverProvider("sql", provider)
      hoverDisposablesRef.current.push(d1)
    } catch {}
    try {
      const d2 = monaco.languages.registerHoverProvider("pgsql", provider)
      hoverDisposablesRef.current.push(d2)
    } catch {}
    // Fallback generic: Monaco's pgsql often aliases to sql, but ensure both covered
    // Also cover "postgres" id just in case
    try {
      const d3 = monaco.languages.registerHoverProvider("postgres", provider)
      hoverDisposablesRef.current.push(d3)
    } catch {}

    return () => {
      hoverDisposablesRef.current.forEach(d => { try { d.dispose() } catch {} })
      hoverDisposablesRef.current = []
    }
  }, [schemaTick, connected, monacoReady])

  const handleBeforeMount = (monaco) => {
    defineDeckThemes(monaco)
    monacoRef.current = monaco
    setMonacoReady(v => v + 1)
  }

  const handleEditorMount = (editor, monaco) => {
    monacoRef.current = monaco
    editorRef.current = editor
    defineDeckThemes(monaco)
    try { monaco.editor.setTheme(monacoTheme) } catch {}
    // bind Cmd/Ctrl+Enter to run
    try {
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => onRun && onRun())
    } catch {}
    setMonacoReady(v => v + 1)

    // initial auto-capitalize for existing content (ongoing typing is handled via onChange -> capitalizeSqlText)
    try {
      const model = editor.getModel()
      if (model) {
        const cur = model.getValue()
        const nxt = capitalizeSqlText(cur)
        if (nxt !== cur) {
          isAutoCapitalizingRef.current = true
          editor.executeEdits("auto-capitalize-init", [{ range: model.getFullModelRange(), text: nxt }])
          if (nxt !== query) setQuery(nxt)
          setTimeout(() => { isAutoCapitalizingRef.current = false }, 0)
        }
      }
    } catch {}
  }

  // cleanup hover providers on unmount
  useEffect(() => {
    return () => {
      hoverDisposablesRef.current.forEach(d => { try { d.dispose() } catch {} })
    }
  }, [])

  return (
    <div className="flex flex-col border border-[#3B3A36] bg-[#1D1C1A] rounded-[8px] overflow-hidden">
      <div className="flex items-center justify-between px-4 h-[38px] border-b border-[#3B3A36] bg-[#1D1C1A]">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-[#B7B5B0]">Query</span>
          <span className="text-[11px] px-2 py-1 bg-[#292824] border border-[#3B3A36] rounded-[6px] text-[#85837E]">PostgreSQL</span>
          <span className="hidden md:inline text-[11px] px-2 py-1 bg-[#1D1C1A] border border-[#3B3A36] rounded-[6px] text-[#66645F] font-mono truncate max-w-[140px]">{monacoTheme}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleCopy} className="h-8 px-3 flex items-center gap-1.5 border border-[#4A4944] bg-transparent rounded-[6px] text-[13px] text-[#B7B5B0] hover:bg-[#3B3935] hover:text-[#F0EFEC]">{copied?"COPIED":"COPY"} <Copy className="w-4 h-4" /></button>
          <button className="h-8 px-3 flex items-center gap-1.5 border border-[#4A4944] bg-transparent rounded-[6px] text-[13px] text-[#B7B5B0] hover:bg-[#3B3935]">FORMAT <Wand2 className="w-4 h-4" /></button>
          <button onClick={onRun} disabled={isRunning} className="h-8 px-4 bg-[#4A90E2] text-white rounded-[6px] text-[13px] font-medium hover:bg-[#3a7bc8] disabled:opacity-50 flex items-center gap-1.5"><Play className="w-4 h-4 fill-white" />{isRunning?"Running…":"Run"}</button>
        </div>
      </div>
      <div className="h-[320px] bg-[#1D1C1A]">
        <Editor height="320px" defaultLanguage="sql" language="pgsql" theme={monacoTheme} value={query} onChange={v=>setQuery(capitalizeSqlText(v??""))} beforeMount={handleBeforeMount} onMount={handleEditorMount} options={{ minimap:{enabled:minimap}, fontSize, fontFamily:"Geist Mono, JetBrains Mono, ui-monospace, monospace", lineNumbers:"on", scrollBeyondLastLine:false, wordWrap, padding:{top:16,bottom:16}, automaticLayout:true, quickSuggestions: autocomplete ? { other: true, comments: false, strings: false } : false, suggestOnTriggerCharacters: autocomplete, wordBasedSuggestions: autocomplete ? "matchingDocuments" : "off", parameterHints: { enabled: autocomplete } }} />
      </div>
      <div className="px-4 h-8 flex items-center gap-2 bg-[#1D1C1A] border-t border-[#3B3A36] text-[12px] text-[#85837E]">
        <span>{query.split("\n").length} lines</span><span className="text-[#3B3A36]">•</span><span>{query.length} chars</span><span className="ml-auto">⌘ + Enter to run • {fontSize}px</span>
      </div>
    </div>
  )
}
