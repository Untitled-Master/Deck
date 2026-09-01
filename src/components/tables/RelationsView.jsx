import { useEffect, useState } from "react"
import { Share2, ArrowRight, ArrowLeft, Loader2, AlertCircle, Link2, Plus, Table2, Key } from "lucide-react"
import { useConnection } from "@/context/ConnectionContext"
import { api } from "@/lib/api"

const MOCK_RELATIONS = {
  users: {
    outgoing: [],
    incoming: [
      { table: "posts", column: "author_id", foreignColumn: "id", constraintName: "posts_author_id_fkey", deleteRule: "CASCADE", updateRule: "NO ACTION" },
      { table: "orders", column: "user_id", foreignColumn: "id", constraintName: "orders_user_id_fkey", deleteRule: "CASCADE", updateRule: "NO ACTION" },
      { table: "audit_logs", column: "actor_id", foreignColumn: "id", constraintName: "audit_logs_actor_id_fkey", deleteRule: "SET NULL", updateRule: "NO ACTION" },
    ],
  },
  posts: {
    outgoing: [
      { column: "author_id", foreignTable: "users", foreignColumn: "id", constraintName: "posts_author_id_fkey", deleteRule: "CASCADE", updateRule: "NO ACTION" },
    ],
    incoming: [
      { table: "comments", column: "post_id", foreignColumn: "id", constraintName: "comments_post_id_fkey", deleteRule: "CASCADE", updateRule: "NO ACTION" },
    ],
  },
  orders: {
    outgoing: [
      { column: "user_id", foreignTable: "users", foreignColumn: "id", constraintName: "orders_user_id_fkey", deleteRule: "CASCADE", updateRule: "NO ACTION" },
      { column: "product_id", foreignTable: "products", foreignColumn: "id", constraintName: "orders_product_id_fkey", deleteRule: "RESTRICT", updateRule: "NO ACTION" },
    ],
    incoming: [],
  },
  products: {
    outgoing: [],
    incoming: [
      { table: "orders", column: "product_id", foreignColumn: "id", constraintName: "orders_product_id_fkey", deleteRule: "RESTRICT", updateRule: "NO ACTION" },
    ],
  },
  audit_logs: {
    outgoing: [
      { column: "actor_id", foreignTable: "users", foreignColumn: "id", constraintName: "audit_logs_actor_id_fkey", deleteRule: "SET NULL", updateRule: "NO ACTION" },
    ],
    incoming: [],
  },
}

export default function RelationsView({ table, onSelectTable }) {
  const { connected } = useConnection()
  const [data, setData] = useState({ outgoing: [], incoming: [] })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!connected) {
      setData(MOCK_RELATIONS[table] ?? { outgoing: [], incoming: [] })
      setError("")
      return
    }
    let cancelled = false
    setLoading(true)
    setError("")
    api.relations(table)
      .then(res => {
        if (cancelled) return
        setData({ outgoing: res.outgoing ?? [], incoming: res.incoming ?? [] })
      })
      .catch(err => {
        if (cancelled) return
        setError(err.message)
        setData(MOCK_RELATIONS[table] ?? { outgoing: [], incoming: [] })
      })
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [table, connected])

  const outgoing = data.outgoing ?? []
  const incoming = data.incoming ?? []
  const total = outgoing.length + incoming.length

  return (
    <div className="border border-[#3B3A36] bg-[#1D1C1A] rounded-[9px] overflow-hidden">
      <div className="h-10 px-4 flex items-center gap-3 border-b border-[#3B3A36] bg-[#1D1C1A]">
        <Share2 className="w-4 h-4 text-[#85837E]" />
        <span className="text-[13px] font-semibold tracking-widest text-[#B7B5B0]">RELATIONS</span>
        <span className="text-[12px] text-[#85837E]">— {table} • {total} {total===1?"relation":"relations"} {connected && !loading ? <span className="text-[#22C55E]">• LIVE</span> : <span className="text-[#85837E]">• MOCK</span>}</span>
        {loading && <Loader2 className="w-4 h-4 animate-spin text-[#85837E] ml-auto" />}
        <button className="ml-auto hidden md:flex items-center gap-1.5 h-8 px-3 bg-transparent border border-[#4A4944] rounded-[6px] text-[13px] font-medium text-[#B7B5B0] hover:bg-[#3B3935] hover:text-[#F0EFEC]">
          <Plus className="w-4 h-4" /> Add FK
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-[#1D1C1A] border-b border-[#3B3A36] px-4 py-2.5 text-[13px] text-[#EF4444]">
          <AlertCircle className="w-4 h-4" /> {error} — showing mock
        </div>
      )}

      {total === 0 && !loading ? (
        <div className="p-12 text-center bg-[#1D1C1A]">
          <div className="w-12 h-12 mx-auto border border-[#3B3A36] bg-[#292824] flex items-center justify-center rounded-[8px] mb-4">
            <Link2 className="w-6 h-6 text-[#85837E]" />
          </div>
          <div className="text-[15px] font-semibold text-[#F0EFEC]">No foreign keys</div>
          <div className="text-[13px] text-[#85837E] mt-1.5 max-w-md mx-auto">
            <span className="font-mono text-[#B7B5B0]">{table}</span> has no relations. Create a foreign key to link it to other tables.
          </div>
          <button className="mt-5 h-8 px-4 bg-[#4A90E2] text-[#F0EFEC] rounded-[6px] text-[13px] font-medium hover:bg-[#3a7bc8]">
            Create Foreign Key
          </button>
        </div>
      ) : (
        <div className="p-4 bg-[#1D1C1A]">
          {/* Diagram */}
          <div className="relative bg-[#1D1C1A] border border-[#3B3A36] rounded-[8px] p-5 overflow-hidden">
            {/* subtle grid */}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
            <div className="relative grid grid-cols-[1fr_auto_1fr] gap-4 items-start">
              {/* Incoming */}
              <div className="space-y-3">
                <div className="text-[12px] font-medium tracking-widest text-[#85837E] flex items-center gap-1.5">
                  <ArrowLeft className="w-3.5 h-3.5" /> INCOMING • {incoming.length}
                </div>
                {incoming.length === 0 ? (
                  <div className="text-[13px] text-[#85837E] border border-dashed border-[#3B3A36] rounded-[8px] p-4 text-center">No incoming</div>
                ) : (
                  incoming.map((r, i) => (
                    <button
                      key={i}
                      onClick={() => onSelectTable?.(r.table)}
                      className="w-full text-left bg-[#292824] border border-[#3B3A36] rounded-[8px] p-3 hover:bg-[#232220] hover:border-[#4A4944] group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-[6px] bg-[#232220] border border-[#4A4944] flex items-center justify-center">
                          <Table2 className="w-3.5 h-3.5 text-[#85837E] group-hover:text-[#F0EFEC]" />
                        </div>
                        <span className="text-[14px] font-mono text-[#F0EFEC]">{r.table}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#85837E] ml-auto" />
                      </div>
                      <div className="mt-2 text-[12px] font-mono text-[#B7B5B0] flex items-center gap-1.5">
                        <span className="text-[#85837E]">{r.table}.{r.column}</span>
                        <ArrowRight className="w-3 h-3 text-[#5A5852]" />
                        <span className="text-[#F0EFEC]">{table}.{r.foreignColumn}</span>
                      </div>
                      <div className="mt-1.5 text-[11px] text-[#85837E] truncate">{r.constraintName} • {r.deleteRule}</div>
                    </button>
                  ))
                )}
              </div>

              {/* Center */}
              <div className="flex flex-col items-center gap-3 pt-6">
                <div className="w-[160px] bg-[#F0EFEC] text-[#1D1C1A] rounded-[10px] p-4 text-center shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-white">
                  <div className="w-8 h-8 mx-auto bg-[#1D1C1A] rounded-[8px] flex items-center justify-center">
                    <Key className="w-4 h-4 text-[#F0EFEC]" />
                  </div>
                  <div className="mt-2.5 text-[14px] font-mono font-medium">{table}</div>
                  <div className="text-[12px] text-[#5A5852]">public • table</div>
                  <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[11px] text-[#4A4944]">
                    <span className="w-2 h-2 rounded-full bg-[#1D1C1A]" /> current
                  </div>
                </div>
                {/* SVG lines */}
                <div className="hidden lg:block w-[160px] h-6 relative">
                  <svg width="160" height="24" className="absolute inset-0">
                    {incoming.length > 0 && <line x1="0" y1="12" x2="62" y2="12" stroke="#4A4944" strokeWidth="1.5" strokeDasharray="4 3" />}
                    {outgoing.length > 0 && <line x1="98" y1="12" x2="160" y2="12" stroke="#4A4944" strokeWidth="1.5" strokeDasharray="4 3" />}
                    {incoming.length > 0 && <polygon points="62,8 62,16 70,12" fill="#5A5852" />}
                    {outgoing.length > 0 && <polygon points="98,8 98,16 90,12" fill="#5A5852" />}
                  </svg>
                </div>
                <div className="text-[12px] text-[#85837E]">{total} relations</div>
              </div>

              {/* Outgoing */}
              <div className="space-y-3">
                <div className="text-[12px] font-medium tracking-widest text-[#85837E] flex items-center gap-1.5 justify-end">
                  OUTGOING • {outgoing.length} <ArrowRight className="w-3.5 h-3.5" />
                </div>
                {outgoing.length === 0 ? (
                  <div className="text-[13px] text-[#85837E] border border-dashed border-[#3B3A36] rounded-[8px] p-4 text-center">No outgoing</div>
                ) : (
                  outgoing.map((r, i) => (
                    <button
                      key={i}
                      onClick={() => onSelectTable?.(r.foreignTable)}
                      className="w-full text-left bg-[#292824] border border-[#3B3A36] rounded-[8px] p-3 hover:bg-[#232220] hover:border-[#4A4944] group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-[6px] bg-[#232220] border border-[#4A4944] flex items-center justify-center">
                          <Table2 className="w-3.5 h-3.5 text-[#85837E] group-hover:text-[#F0EFEC]" />
                        </div>
                        <span className="text-[14px] font-mono text-[#F0EFEC]">{r.foreignTable}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#85837E] ml-auto" />
                      </div>
                      <div className="mt-2 text-[12px] font-mono text-[#B7B5B0] flex items-center gap-1.5">
                        <span className="text-[#F0EFEC]">{table}.{r.column}</span>
                        <ArrowRight className="w-3 h-3 text-[#5A5852]" />
                        <span className="text-[#85837E]">{r.foreignTable}.{r.foreignColumn}</span>
                      </div>
                      <div className="mt-1.5 text-[11px] text-[#85837E] truncate">{r.constraintName} • {r.deleteRule}</div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Legend */}
            <div className="mt-5 pt-4 border-t border-[#3B3A36] flex items-center gap-4 text-[12px] text-[#85837E]">
              <span className="flex items-center gap-2"><span className="w-2.5 h-0.5 bg-[#5A5852]" /> FK</span>
              <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#F0EFEC]" /> {table}</span>
              <span className="ml-auto">Click table to navigate</span>
            </div>
          </div>

          {/* Details table */}
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
            {outgoing.length > 0 && (
              <div className="bg-[#292824] border border-[#3B3A36] rounded-[8px] overflow-hidden">
                <div className="px-4 py-3 border-b border-[#3B3A36] text-[12px] font-medium tracking-widest text-[#85837E]">OUTGOING DETAILS</div>
                <div className="divide-y divide-[#3B3A36]">
                  {outgoing.map((r,i)=>(
                    <div key={i} className="px-4 py-3 flex items-center justify-between gap-2">
                      <span className="text-[13px] font-mono text-[#F0EFEC]">{r.column} → {r.foreignTable}.{r.foreignColumn}</span>
                      <span className="text-[11px] px-2 py-1 rounded-[6px] bg-[#232220] border border-[#4A4944] text-[#85837E]">{r.deleteRule}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {incoming.length > 0 && (
              <div className="bg-[#292824] border border-[#3B3A36] rounded-[8px] overflow-hidden">
                <div className="px-4 py-3 border-b border-[#3B3A36] text-[12px] font-medium tracking-widest text-[#85837E]">INCOMING DETAILS</div>
                <div className="divide-y divide-[#3B3A36]">
                  {incoming.map((r,i)=>(
                    <div key={i} className="px-4 py-3 flex items-center justify-between gap-2">
                      <span className="text-[13px] font-mono text-[#F0EFEC]">{r.table}.{r.column} → {r.foreignColumn}</span>
                      <span className="text-[11px] px-2 py-1 rounded-[6px] bg-[#232220] border border-[#4A4944] text-[#85837E]">{r.deleteRule}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
