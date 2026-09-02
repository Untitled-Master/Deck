import Editor from "@monaco-editor/react"
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

export default function ApiCodeBlock({ code = "", language = "javascript", minHeight = 80, maxHeight = 340, editable = false, onChange }) {
  const [monacoTheme, setMonacoTheme] = useState(() => getInitialTheme())
  const [fontSize, setFontSize] = useState(() => getEditorSettings().fontSize ?? 13)
  const monacoRef = useRef(null)

  useEffect(() => {
    const sync = () => {
      const s = getEditorSettings()
      const t = s.monacoTheme && MONACO_THEMES.some(x=>x.id===s.monacoTheme) ? s.monacoTheme : "deck-dark"
      setMonacoTheme(prev => prev !== t ? t : prev)
      setFontSize(s.fontSize ?? 13)
    }
    sync()
    const onStorage = (e) => { if (!e.key || e.key === "deck:settings") sync() }
    window.addEventListener("storage", onStorage)
    const id = setInterval(sync, 700)
    const onCustom = () => sync()
    window.addEventListener("deck:settings:update", onCustom)
    return () => { window.removeEventListener("storage", onStorage); window.removeEventListener("deck:settings:update", onCustom); clearInterval(id) }
  }, [])

  useEffect(() => {
    if (monacoRef.current) {
      try {
        const th = MONACO_THEMES.find(t=>t.id===monacoTheme)
        if (th && !["vs","vs-dark","hc-black","hc-light"].includes(th.id)) defineDeckThemes(monacoRef.current)
        monacoRef.current.editor.setTheme(monacoTheme)
      } catch {}
    }
  }, [monacoTheme])

  const handleBeforeMount = (monaco) => {
    defineDeckThemes(monaco)
    monacoRef.current = monaco
  }
  const handleMount = (editor, monaco) => {
    monacoRef.current = monaco
    try { monaco.editor.setTheme(monacoTheme) } catch {}
  }

  const lines = code ? code.split("\n").length : 1
  // estimate line height ~19px at 13px fontSize, plus padding
  const lineH = Math.round(fontSize * 1.5)
  const computed = Math.min(maxHeight, Math.max(minHeight, lines * lineH + 24))
  const height = `${computed}px`

  return (
    <div className="overflow-hidden rounded-[7px] border border-[#3B3A36] bg-[#1D1C1A]" style={{ height }}>
      <Editor
        height={height}
        language={language}
        theme={monacoTheme}
        value={code}
        beforeMount={handleBeforeMount}
        onMount={handleMount}
        onChange={editable ? (v) => onChange?.(v ?? "") : undefined}
        options={{
          readOnly: !editable,
          domReadOnly: !editable,
          minimap: { enabled: false },
          lineNumbers: editable ? "on" : "off",
          glyphMargin: false,
          folding: editable,
          lineDecorationsWidth: editable ? 10 : 0,
          lineNumbersMinChars: editable ? 3 : 0,
          scrollBeyondLastLine: false,
          wordWrap: "on",
          wrappingIndent: "indent",
          fontSize,
          fontFamily: "Geist Mono, JetBrains Mono, ui-monospace, monospace",
          padding: { top: 12, bottom: 12 },
          automaticLayout: true,
          scrollbar: { vertical: "auto", horizontal: "auto", verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
          overviewRulerLanes: 0,
          overviewRulerBorder: false,
          hideCursorInOverviewRuler: true,
          renderLineHighlight: editable ? "line" : "none",
          occurrencesHighlight: "off",
          selectionHighlight: false,
          quickSuggestions: false,
          suggestOnTriggerCharacters: false,
          wordBasedSuggestions: "off",
          parameterHints: { enabled: false },
          contextmenu: editable,
        }}
      />
    </div>
  )
}
