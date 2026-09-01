import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { en } from "@/locales/en"
import { fr } from "@/locales/fr"

const dictionaries = { en, fr }

function getNested(obj, path) {
  return path.split(".").reduce((acc, key) => (acc && acc[key] != null ? acc[key] : undefined), obj)
}

const I18nContext = createContext(null)

function getInitialLang() {
  try {
    const raw = localStorage.getItem("deck:settings")
    if (raw) {
      const j = JSON.parse(raw)
      const l = j?.language
      if (l === "fr" || l === "en") return l
    }
  } catch {}
  return "en"
}

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(getInitialLang)

  const sync = useCallback(() => {
    try {
      const raw = localStorage.getItem("deck:settings")
      if (raw) {
        const j = JSON.parse(raw)
        const l = j?.language
        if ((l === "en" || l === "fr") && l !== lang) {
          setLangState(l)
          return
        }
      }
    } catch {}
  }, [lang])

  useEffect(() => {
    sync()
    const onStorage = (e) => { if (!e.key || e.key === "deck:settings") sync() }
    window.addEventListener("storage", onStorage)
    window.addEventListener("deck:settings:update", sync)
    const id = setInterval(sync, 500)
    return () => {
      window.removeEventListener("storage", onStorage)
      window.removeEventListener("deck:settings:update", sync)
      clearInterval(id)
    }
  }, [sync])

  useEffect(() => {
    try { document.documentElement.lang = lang } catch {}
  }, [lang])

  const t = useCallback((key, fallback) => {
    const dict = dictionaries[lang] || en
    let val = getNested(dict, key)
    if (val == null) val = getNested(en, key)
    return val ?? fallback ?? key
  }, [lang])

  const setLang = useCallback((newLang) => {
    if (newLang !== "en" && newLang !== "fr") return
    setLangState(newLang)
    try {
      const raw = localStorage.getItem("deck:settings")
      const j = raw ? JSON.parse(raw) : {}
      j.language = newLang
      localStorage.setItem("deck:settings", JSON.stringify({ ...j, language: newLang }))
      window.dispatchEvent(new Event("deck:settings:update"))
    } catch {}
  }, [])

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider")
  return ctx
}

export function useTranslation() {
  return useI18n()
}
