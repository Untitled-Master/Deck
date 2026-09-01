import { createContext, useContext, useEffect, useState } from "react"
import { api } from "@/lib/api"

const Ctx = createContext(null)

export function ConnectionProvider({ children }) {
  const [connected, setConnected] = useState(false)
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.status()
      .then(s => {
        setConnected(s.connected)
        setConfig(s.config)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const connect = async (form) => {
    const res = await api.connect(form)
    setConnected(true)
    setConfig(res.config)
    return res
  }

  const disconnect = async () => {
    await api.disconnect()
    setConnected(false)
    setConfig(null)
  }

  const refresh = async () => {
    const s = await api.status()
    setConnected(s.connected)
    setConfig(s.config)
    return s
  }

  return (
    <Ctx.Provider value={{ connected, config, loading, connect, disconnect, refresh, setConnected }}>
      {children}
    </Ctx.Provider>
  )
}

export function useConnection() {
  const v = useContext(Ctx)
  if (!v) throw new Error("useConnection must be used inside ConnectionProvider")
  return v
}
