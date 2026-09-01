import Editor from "@monaco-editor/react"
import { Play, Copy, Wand2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { MONACO_THEMES } from "@/lib/monacoThemes"

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

export default function SqlEditor({ query, setQuery, onRun, isRunning }) {
  const [copied, setCopied] = useState(false)
  const [monacoTheme, setMonacoTheme] = useState(() => getInitialTheme())
  const [fontSize, setFontSize] = useState(() => getEditorSettings().fontSize ?? 13)
  const [wordWrap, setWordWrap] = useState(() => (getEditorSettings().wordWrap ?? true) ? "on" : "off")
  const [minimap, setMinimap] = useState(() => !!getEditorSettings().minimap)
  const [autocomplete, setAutocomplete] = useState(() => getEditorSettings().autocomplete ?? true)
  const monacoRef = useRef(null)
  const editorRef = useRef(null)
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

  const handleBeforeMount = (monaco) => {
    defineDeckThemes(monaco)
    monacoRef.current = monaco
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
  }

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
        <Editor height="320px" defaultLanguage="sql" language="pgsql" theme={monacoTheme} value={query} onChange={v=>setQuery(v??"")} beforeMount={handleBeforeMount} onMount={handleEditorMount} options={{ minimap:{enabled:minimap}, fontSize, fontFamily:"Geist Mono, JetBrains Mono, ui-monospace, monospace", lineNumbers:"on", scrollBeyondLastLine:false, wordWrap, padding:{top:16,bottom:16}, automaticLayout:true, quickSuggestions: autocomplete ? { other: true, comments: false, strings: false } : false, suggestOnTriggerCharacters: autocomplete, wordBasedSuggestions: autocomplete ? "matchingDocuments" : "off", parameterHints: { enabled: autocomplete } }} />
      </div>
      <div className="px-4 h-8 flex items-center gap-2 bg-[#1D1C1A] border-t border-[#3B3A36] text-[12px] text-[#85837E]">
        <span>{query.split("\n").length} lines</span><span className="text-[#3B3A36]">•</span><span>{query.length} chars</span><span className="ml-auto">⌘ + Enter to run • {fontSize}px</span>
      </div>
    </div>
  )
}
