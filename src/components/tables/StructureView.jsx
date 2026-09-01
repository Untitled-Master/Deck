import { useEffect, useState } from "react"
import { Key, Hash, Loader2, AlertCircle } from "lucide-react"
import { useConnection } from "@/context/ConnectionContext"
import { api } from "@/lib/api"

const MOCK_STRUCTURE = {
  favorites: [
    { column: "_id", type: "string", nullable: false, def: "auto", pk: true },
    { column: "addedAt", type: "timestamp", nullable: false, def: "—" },
    { column: "mediaType", type: "text", nullable: false, def: "—" },
    { column: "posterPath", type: "text", nullable: false, def: "—" },
    { column: "title", type: "text", nullable: false, def: "—" },
    { column: "tmdbId", type: "integer", nullable: false, def: "—" },
    { column: "userId", type: "uuid", nullable: false, def: "—", fk: "users._id" },
  ],
  users: [
    { column: "_id", type: "uuid", nullable: false, def: "auto", pk: true },
    { column: "createdAt", type: "timestamp", nullable: false, def: "now()" },
    { column: "email", type: "text", nullable: false, def: "—", unique: true },
    { column: "name", type: "text", nullable: false, def: "—" },
  ],
}

export default function StructureView({ table }) {
  const { connected } = useConnection()
  const [cols, setCols] = useState(MOCK_STRUCTURE[table] ?? MOCK_STRUCTURE.favorites)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  useEffect(() => {
    if (!connected) { setCols(MOCK_STRUCTURE[table] ?? MOCK_STRUCTURE.favorites); setError(""); return }
    let c=false; setLoading(true); setError("")
    api.columns(table).then(res=>{
      if(c) return
      const mapped=res.columns.map(col=>({ column:col.column, type:col.type, nullable:col.nullable, def:col.default??"—", pk:col.isPrimary, unique:col.isUnique, fk:col.foreignKey?`${col.foreignKey.foreign_table}.${col.foreignKey.foreign_column}`:null }))
      setCols(mapped)
    }).catch(e=>{ if(!c){ setError(e.message); setCols(MOCK_STRUCTURE[table] ?? MOCK_STRUCTURE.favorites)}}).finally(()=>!c&&setLoading(false))
    return()=>{c=true}
  },[table,connected])

  return (
    <div className="border border-[#3B3A36] rounded-[9px] bg-[#1D1C1A] overflow-hidden">
      <div className="h-10 px-4 flex items-center gap-3 border-b border-[#3B3A36] bg-[#292824]">
        <span className="text-[13px] font-semibold tracking-widest text-[#B7B5B0]">STRUCTURE</span>
        <span className="text-[12px] text-[#85837E]">— {table} • {cols.length} columns {connected && !loading ? <span className="text-[#22C55E]">• LIVE</span> : <span className="text-[#85837E]">• MOCK</span>}</span>
        {loading && <Loader2 className="w-4 h-4 animate-spin text-[#85837E] ml-auto" />}
      </div>
      {error && <div className="flex items-center gap-2 px-4 py-2 bg-[#1D1C1A] border-b border-[#3B3A36] text-[13px] text-[#EF4444]"><AlertCircle className="w-4 h-4" />{error}</div>}
      <div className="overflow-auto">
        <table className="w-full text-left">
          <thead className="bg-[#292824] border-b border-[#3B3A36]">
            <tr className="h-10 text-[13px] font-semibold text-[#B7B5B0]">
              <th className="px-4 font-semibold">COLUMN</th>
              <th className="px-4 font-semibold">TYPE</th>
              <th className="px-4 font-semibold">NULLABLE</th>
              <th className="px-4 font-semibold">DEFAULT</th>
              <th className="px-4 font-semibold">CONSTRAINTS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#3B3A36]">
            {cols.map(c=>(
              <tr key={c.column} className="h-10 hover:bg-[#232220] transition-colors">
                <td className="px-4 text-[13px] font-mono flex items-center gap-2 h-10">
                  {c.pk ? <Key className="w-3 h-3 text-[#85837E]" /> : <Hash className="w-3 h-3 text-[#66645F]" />}
                  <span className={c.pk?"text-[#F0EFEC] font-medium":"text-[#D6D4CF]"}>{c.column}</span>
                </td>
                <td className="px-4 text-[12px] font-mono text-[#B7B5B0]">{c.type}</td>
                <td className="px-4"><span className={`px-2 py-1 rounded-[6px] border text-[11px] font-medium ${!c.nullable?"border-[#4A4944] bg-[#232220] text-[#F0EFEC]":"border-[#3B3A36] text-[#85837E]"}`}>{!c.nullable?"NOT NULL":"NULL"}</span></td>
                <td className="px-4 text-[12px] font-mono text-[#85837E]">{c.def}</td>
                <td className="px-4"><div className="flex gap-1.5">{c.pk&&<span className="px-2 py-1 bg-[#232220] border border-[#3B3A36] rounded-[6px] text-[11px] font-medium text-[#F0EFEC]">PRIMARY</span>}{c.unique&&<span className="px-2 py-1 bg-[#232220] border border-[#3B3A36] rounded-[6px] text-[11px] text-[#F0EFEC]">UNIQUE</span>}{c.fk&&<span className="px-2 py-1 bg-[#232220] border border-[#3B3A36] rounded-[6px] text-[11px] text-[#B7B5B0]">FK → {c.fk}</span>}{!c.pk&&!c.unique&&!c.fk&&<span className="text-[#66645F] text-[12px]">—</span>}</div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
