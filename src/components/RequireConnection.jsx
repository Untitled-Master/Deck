import { Navigate } from "react-router-dom"
import { useConnection } from "@/context/ConnectionContext"

export default function RequireConnection({ children }) {
  const { connected, loading } = useConnection()
  if (loading) {
    return (
      <div className="min-h-screen bg-[#1D1C1A] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#3B3A36] border-t-white rounded-full animate-spin" />
      </div>
    )
  }
  if (!connected) return <Navigate to="/connect" replace />
  return children
}
