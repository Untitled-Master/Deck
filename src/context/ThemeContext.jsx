import { createContext, useContext, useEffect, useState, useCallback } from "react"

const ThemeContext = createContext(null)

function getStoredTheme() {
  try {
    const raw = localStorage.getItem("deck:settings")
    if (raw) {
      const j = JSON.parse(raw)
      const t = j?.theme
      if (t === "light" || t === "dark" || t === "system") return t
    }
  } catch {}
  return "dark"
}

function getSystemTheme() {
  try {
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"
    }
  } catch {}
  return "dark"
}

function getEffectiveTheme(stored) {
  if (stored === "system") return getSystemTheme()
  return stored === "light" ? "light" : "dark"
}

export function ThemeProvider({ children }) {
  const [stored, setStored] = useState(getStoredTheme)
  const [effective, setEffective] = useState(() => getEffectiveTheme(getStoredTheme()))

  const sync = useCallback(() => {
    const s = getStoredTheme()
    setStored(s)
    setEffective(getEffectiveTheme(s))
  }, [])

  useEffect(() => {
    sync()
    const onStorage = (e) => { if (!e.key || e.key === "deck:settings") sync() }
    window.addEventListener("storage", onStorage)
    window.addEventListener("deck:settings:update", sync)
    const id = setInterval(sync, 500)

    // listen to system changes when in system mode
    let mql
    try {
      mql = window.matchMedia("(prefers-color-scheme: light)")
      const onSystem = () => {
        if (getStoredTheme() === "system") sync()
      }
      mql.addEventListener?.("change", onSystem)
      return () => {
        window.removeEventListener("storage", onStorage)
        window.removeEventListener("deck:settings:update", sync)
        clearInterval(id)
        mql.removeEventListener?.("change", onSystem)
      }
    } catch {
      return () => {
        window.removeEventListener("storage", onStorage)
        window.removeEventListener("deck:settings:update", sync)
        clearInterval(id)
      }
    }
  }, [sync])

  useEffect(() => {
    try {
      const root = document.documentElement
      root.classList.remove("light", "dark")
      root.classList.add(effective)
      root.setAttribute("data-theme", effective)
      // also set color-scheme for native UI
      root.style.colorScheme = effective
    } catch {}
  }, [effective])

  const value = { stored, effective, isLight: effective === "light", isDark: effective === "dark" }
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider")
  return ctx
}
