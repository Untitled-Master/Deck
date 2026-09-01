import { useEffect, useState, useRef } from "react"
import { Search, ZoomIn, ZoomOut, Maximize2, RotateCcw, Loader2, AlertCircle, Box, Key, Link2 } from "lucide-react"
import { api } from "@/lib/api"
import { useConnection } from "@/context/ConnectionContext"
import TopBar from "@/components/layout/TopBar"
import LeftNav from "@/components/layout/LeftNav"
import Sidebar from "@/components/layout/Sidebar"

const IMAGE_MOCK = {
  tables: [
    {
      name: "watchHistory",
      columns: [
        { column: "_id", type: "string", isPrimary: true },
        { column: "duration", type: "number" },
        { column: "episode", type: "number" },
        { column: "isCompleted", type: "boolean" },
        { column: "mediaType", type: "string" },
        { column: "posterPath", type: "string" },
        { column: "season", type: "number" },
        { column: "status", type: "string" },
        { column: "title", type: "string" },
        { column: "tmdbId", type: "number" },
        { column: "userId", type: 'Id<"users">', isFK: true },
      ],
      indexes: ["by_user: userId, _creationTime", "by_user_media: userId, tmdbId, _creationTime"],
      pos: { x: 520, y: 40 },
    },
    {
      name: "watchlists",
      columns: [
        { column: "_id", type: "string", isPrimary: true },
        { column: "addedAt", type: "number" },
        { column: "mediaType", type: "string" },
        { column: "posterPath", type: "string" },
        { column: "status", type: "string" },
        { column: "title", type: "string" },
        { column: "tmdbId", type: "number" },
        { column: "userId", type: 'Id<"users">', isFK: true },
      ],
      indexes: ["by_user: userId, _creationTime", "by_user_status: userId, status, _creationTime"],
      pos: { x: 280, y: 220 },
    },
    {
      name: "favorites",
      columns: [
        { column: "_id", type: "string", isPrimary: true },
        { column: "addedAt", type: "number" },
        { column: "mediaType", type: "string" },
        { column: "posterPath", type: "string" },
        { column: "progress", type: "number" },
        { column: "season", type: "number" },
        { column: "title", type: "string" },
        { column: "tmdbId", type: "number" },
        { column: "updatedAt", type: "number" },
        { column: "userId", type: 'Id<"users">', isFK: true },
      ],
      indexes: ["by_user: userId, _creationTime", "by_user_media: userId, tmdbId, _creationTime"],
      pos: { x: 760, y: 260 },
    },
    {
      name: "users",
      columns: [
        { column: "_id", type: "string", isPrimary: true },
        { column: "createdAt", type: "number" },
        { column: "email", type: "string" },
        { column: "name", type: "string" },
        { column: "passwordHash", type: "string" },
        { column: "premiumCode", type: "string" },
        { column: "premiumExpiresAt", type: "number" },
        { column: "premiumStatus", type: "string" },
        { column: "profileId", type: 'Id<"_storage">', isFK: false },
      ],
      indexes: ["by_email: email, _creationTime"],
      pos: { x: 520, y: 520 },
    },
  ],
  relations: [
    { from: "watchlists", fromCol: "userId", to: "users", toCol: "_id" },
    { from: "favorites", fromCol: "userId", to: "users", toCol: "_id" },
    { from: "watchHistory", fromCol: "userId", to: "users", toCol: "_id" },
  ],
}

export default function SchemaPage() {
  const { connected } = useConnection()
  const [data, setData] = useState(IMAGE_MOCK)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [sidebarSearch, setSidebarSearch] = useState("")
  const [selectedTable, setSelectedTable] = useState("favorites")
  const LS_ZOOM = "deck:schema:zoom"
  const LS_OFFSET = "deck:schema:offset"
  const LS_POSITIONS = "deck:schema:positions"
  const LS_AUTOGROUP = "deck:schema:autoGroup"

  const [zoom, setZoom] = useState(()=> {
    try { const v = localStorage.getItem(LS_ZOOM); return v ? parseFloat(v) : 0.61 } catch { return 0.61 }
  })
  const [offset, setOffset] = useState(()=> {
    try { const v = localStorage.getItem(LS_OFFSET); return v ? JSON.parse(v) : { x: 0, y: 0 } } catch { return { x: 0, y: 0 } }
  })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [positions, setPositions] = useState(()=> {
    try { const v = localStorage.getItem(LS_POSITIONS); return v ? JSON.parse(v) : {} } catch { return {} }
  })
  const [dragging, setDragging] = useState(null)
  const [autoGroup, setAutoGroup] = useState(()=> {
    try { const v = localStorage.getItem(LS_AUTOGROUP); return v ? v==="true" : true } catch { return true }
  })

  // persist layout
  useEffect(()=>{ try{ localStorage.setItem(LS_ZOOM, String(zoom)) }catch{} }, [zoom])
  useEffect(()=>{ try{ localStorage.setItem(LS_OFFSET, JSON.stringify(offset)) }catch{} }, [offset])
  useEffect(()=>{ try{ if(Object.keys(positions).length) localStorage.setItem(LS_POSITIONS, JSON.stringify(positions)) }catch{} }, [positions])
  useEffect(()=>{ try{ localStorage.setItem(LS_AUTOGROUP, String(autoGroup)) }catch{} }, [autoGroup])

  const fetchSchema = async () => {
    setLoading(true)
    setError("")
    try {
      if (!connected) {
        setData(IMAGE_MOCK)
      } else {
        const res = await api.schema()
        if (res.tables?.length) {
          const mapped = res.tables.map((t, i) => {
            const existing = IMAGE_MOCK.tables.find(m => m.name === t.name)
            return {
              name: t.name,
              columns: (t.columns || []).map(c => ({ column: c.column, type: c.type, isFK: c.isPrimary ? false : c.type.includes("uuid") })),
              indexes: existing?.indexes || [],
              pos: existing?.pos || { x: 100 + (i % 3) * 360, y: 100 + Math.floor(i / 3) * 280 },
            }
          })
          const rels = (res.relations || []).map(r => ({ from: r.sourceTable, fromCol: r.sourceColumn, to: r.targetTable, toCol: r.targetColumn, constraintName: r.constraintName }))
          setData({ tables: mapped, relations: rels.length ? rels : IMAGE_MOCK.relations })
        } else {
          setData(IMAGE_MOCK)
        }
      }
    } catch (e) {
      setError(e.message)
      setData(IMAGE_MOCK)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSchema() }, [connected])

  useEffect(() => {
    if (!data.tables.length) return
    const next = {}
    data.tables.forEach(t => {
      if (positions[t.name]) next[t.name] = positions[t.name]
      else next[t.name] = t.pos || { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 }
    })
    if (Object.keys(next).length) setPositions(next)
  }, [data.tables])

  const canvasRef = useRef(null)
  const filtered = data.tables.filter(t => t.name.toLowerCase().includes(search.toLowerCase()))

  const zoomToTable = (name) => {
    const table = data.tables.find(t=> t.name===name)
    const pos = positions[name] ?? table?.pos
    if (!table || !pos || !canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const targetX = rect.width/2 - (pos.x + 140) * zoom
    const targetY = rect.height/2 - (pos.y + 120) * zoom
    const startX = offset.x
    const startY = offset.y
    const startTime = performance.now()
    const duration = 450
    const ease = (t)=> 1 - Math.pow(1-t, 3)
    const animate = (now)=>{
      const p = Math.min(1, (now - startTime)/duration)
      const e = ease(p)
      setOffset({ x: startX + (targetX - startX)*e, y: startY + (targetY - startY)*e })
      if(p<1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }

  const handleSidebarSelect = (name) => {
    setSelectedTable(name)
    // wait for positions to be ready, then zoom
    setTimeout(()=> zoomToTable(name), 50)
  }

  const handleTableMouseDown = (e, name) => {
    e.stopPropagation()
    e.preventDefault()
    const canvasX = (e.clientX - offset.x) / zoom
    const canvasY = (e.clientY - offset.y) / zoom
    const pos = positions[name]
    if (!pos) return
    setDragging({ name, offsetX: canvasX - pos.x, offsetY: canvasY - pos.y })
  }

  const handleCanvasMouseDown = (e) => {
    if (e.target.closest("[data-table-card]")) return
    setIsPanning(true)
    setPanStart({ x: e.clientX - offset.x, y: e.clientY - offset.y })
  }

  const handleWheel = (e) => {
    e.preventDefault()
    const delta = -e.deltaY * 0.0012
    const newZoom = Math.min(1.8, Math.max(0.4, zoom + delta))
    if (newZoom === zoom) return
    const rect = e.currentTarget.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const zoomRatio = newZoom / zoom
    const newOffsetX = mouseX - (mouseX - offset.x) * zoomRatio
    const newOffsetY = mouseY - (mouseY - offset.y) * zoomRatio
    setZoom(newZoom)
    setOffset({ x: newOffsetX, y: newOffsetY })
  }

  const handleMouseMove = (e) => {
    if (dragging) {
      const canvasX = (e.clientX - offset.x) / zoom
      const canvasY = (e.clientY - offset.y) / zoom
      const x = canvasX - dragging.offsetX
      const y = canvasY - dragging.offsetY
      setPositions(p => ({ ...p, [dragging.name]: { x, y } }))
    } else if (isPanning) {
      setOffset({ x: e.clientX - panStart.x, y: e.clientY - panStart.y })
    }
  }

  const handleMouseUp = () => {
    setDragging(null)
    setIsPanning(false)
  }

  return (
    <div className="h-screen flex flex-col bg-[#292824] overflow-hidden">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <LeftNav />
        <Sidebar selectedTable={selectedTable} onSelectTable={handleSidebarSelect} search={sidebarSearch} setSearch={setSidebarSearch} />
        <div className="flex-1 flex flex-col bg-[#1D1C1A] overflow-hidden">
          <div className="h-[52px] px-4 flex items-center justify-between border-b border-[#3B3A36] bg-[#1D1C1A] shrink-0">
            <span className="text-[16px] font-semibold text-[#F0EFEC]">Schema</span>
            <div className="flex items-center gap-2">
              <button className="h-8 px-3 flex items-center gap-2 bg-[#292824] border border-[#3B3A36] rounded-[6px] text-[13px] text-[#F0EFEC] hover:bg-[#232220]">
                <Box className="w-4 h-4 text-[#B7B5B0]" /> app <span className="text-[#85837E] ml-6">⌄</span>
              </button>
              <button className="h-8 px-3 flex items-center gap-1.5 bg-[#292824] border border-[#3B3A36] rounded-[6px] text-[13px] font-medium text-[#F0EFEC] hover:bg-[#232220]">
                <Box className="w-4 h-4" /> View schema file
              </button>
            </div>
          </div>

          <div className="flex-1 p-3 bg-[#1D1C1A] overflow-hidden">
            <div
              ref={canvasRef}
              className="w-full h-full relative overflow-hidden bg-[#1D1C1A] border border-[#3B3A36] rounded-[9px] select-none"
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onMouseDown={handleCanvasMouseDown}
              onWheel={handleWheel}
              style={{ cursor: isPanning ? "grabbing" : dragging ? "grabbing" : "grab" }}
            >
              <div className="absolute inset-0 canvas-bg" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #4A4944 1.2px, transparent 0)", backgroundSize: "24px 24px", opacity: 0.35, transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`, transformOrigin: "0 0", width: "3000px", height: "2000px" }} />
              <div className="absolute inset-0 canvas-bg" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #3B3A36 1px, transparent 0)", backgroundSize: "24px 24px", opacity: 0.25, transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`, transformOrigin: "0 0", width: "3000px", height: "2000px" }} />

              <div className="absolute top-3 left-3 z-10">
                <div className="relative">
                  <Search className="w-4 h-4 text-[#85837E] absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input value={search} onChange={e=> setSearch(e.target.value)} placeholder="? to search" className="h-8 w-[280px] pl-8 pr-3 bg-[#292824] border border-[#3B3A36] rounded-[8px] text-[13px] placeholder:text-[#85837E] text-[#F0EFEC] focus:outline-none focus:border-[#4A4944]" />
                </div>
              </div>

              {error && <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-[#1D1C1A] border border-[#EF4444]/30 rounded-[6px] px-3 py-1.5 flex items-center gap-2 text-[13px] text-[#EF4444]"><AlertCircle className="w-4 h-4" />{error}</div>}
              {loading && <div className="absolute top-12 left-1/2 -translate-x-1/2 z-10 bg-[#292824] border border-[#3B3A36] rounded-[6px] px-3 py-1.5 flex items-center gap-2 text-[13px] text-[#B7B5B0]"><Loader2 className="w-4 h-4 animate-spin" /> Loading schema…</div>}

              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`, transformOrigin: "0 0" }}>
                {data.relations.filter(r=> filtered.some(t=> t.name===r.from) && filtered.some(t=> t.name===r.to)).map((r, i) => {
                  const from = data.tables.find(t=> t.name===r.from)
                  const to = data.tables.find(t=> t.name===r.to)
                  if (!from || !to) return null
                  const s = positions[r.from] ?? from.pos
                  const tPos = positions[r.to] ?? to.pos
                  const fromIdx = from.columns.findIndex(c=> c.column===r.fromCol)
                  const toIdx = to.columns.findIndex(c=> c.column===r.toCol)
                  const fromY = s.y + 28 + (fromIdx>=0 ? fromIdx*22 + 11 : from.columns.length*11)
                  const toY = tPos.y + 28 + (toIdx>=0 ? toIdx*22 + 11 : 11)
                  const sx = s.x + 280
                  const tx = tPos.x
                  const midX = (sx + tx)/2
                  return <path key={i} d={`M ${sx} ${fromY} L ${midX} ${fromY} L ${midX} ${toY} L ${tx} ${toY}`} stroke="#5A5852" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" opacity="0.9" />
                })}
                <defs>
                  <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#5A5852" />
                  </marker>
                </defs>
              </svg>

              <div className="absolute inset-0" style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`, transformOrigin: "0 0" }}>
                {filtered.map(t => {
                  const pos = positions[t.name] ?? t.pos
                  return (
                    <div key={t.name} data-table-card onMouseDown={(e)=> handleTableMouseDown(e, t.name)} className="absolute w-[280px] bg-[#292824] border border-[#3B3A36] rounded-[8px] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.3)] cursor-grab active:cursor-grabbing" style={{ left: pos.x, top: pos.y }}>
                      <div className="h-7 px-3 flex items-center gap-1.5 bg-[#3B3A36]/60 border-b border-[#3B3A36]">
                        <Box className="w-3 h-3 text-[#B7B5B0]" />
                        <span className="text-[11px] font-medium tracking-wide text-[#F0EFEC]">{t.name}</span>
                      </div>
                      <div className="divide-y divide-[#3B3A36]/40">
                        {t.columns.map(col => (
                          <div key={col.column} className="h-[22px] px-3 flex items-center justify-between text-[11px] font-mono">
                            <span className="flex items-center gap-1.5">
                              {col.isPrimary ? <Key className="w-3 h-3 text-[#EAB308]" /> : col.isFK ? <Link2 className="w-3 h-3 text-[#4A90E2]" /> : <span className="w-3 h-3" />}
                              <span className={col.isPrimary ? "text-[#F0EFEC] font-medium" : col.isFK ? "text-[#4A90E2]" : "text-[#F0EFEC]"}>{col.column}</span>
                            </span>
                            <span className="text-[#85837E] text-[11px]">{col.isFK ? 'Id<"users">' : col.type}</span>
                          </div>
                        ))}
                      </div>
                      {t.indexes && t.indexes.length > 0 && (
                        <div className="border-t border-[#3B3A36] bg-[#1D1C1A]/50">
                          <div className="px-3 py-1 text-[10px] tracking-widest text-[#66645F]">INDEXES</div>
                          {t.indexes.map((idx, ii) => (
                            <div key={ii} className="px-3 py-1 flex items-center gap-1 text-[10px] font-mono border-t border-[#3B3A36]/30">
                              <span className="w-3 h-3 rounded-full border border-[#5A5852] flex items-center justify-center text-[7px] text-[#85837E]">●</span>
                              <span className="text-[#B7B5B0]">{idx.split(":")[0]}</span>
                              <span className="text-[#66645F] truncate ml-1">{idx.split(":")[1]?.trim()}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-[#292824] border border-[#3B3A36] rounded-[8px] px-2 py-1">
                <button onClick={()=> setZoom(z=> Math.max(0.4, z-0.1))} className="w-6 h-6 flex items-center justify-center hover:bg-[#3B3935] rounded-[4px] text-[#B7B5B0]">−</button>
                <span className="text-[12px] font-mono text-[#F0EFEC] w-[42px] text-center">{Math.round(zoom*100)}%</span>
                <button onClick={()=> setZoom(z=> Math.min(1.4, z+0.1))} className="w-6 h-6 flex items-center justify-center hover:bg-[#3B3935] rounded-[4px] text-[#B7B5B0]">+</button>
                <span className="w-px h-4 bg-[#3B3A36] mx-1" />
                <button onClick={()=> setOffset({x:0,y:0})} className="w-6 h-6 flex items-center justify-center hover:bg-[#3B3935] rounded-[4px] text-[#B7B5B0]"><Maximize2 className="w-3.5 h-3.5" /></button>
                <button className="w-6 h-6 flex items-center justify-center hover:bg-[#3B3935] rounded-[4px] text-[#B7B5B0]"><RotateCcw className="w-3.5 h-3.5" /></button>
                <span className="w-px h-4 bg-[#3B3A36] mx-1" />
                <label className="flex items-center gap-1.5 text-[12px] text-[#B7B5B0] cursor-pointer">
                  <span className={`relative w-8 h-4 rounded-full transition-colors ${autoGroup ? "bg-[#4A90E2]" : "bg-[#3B3A36]"}`}>
                    <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${autoGroup ? "left-4" : "left-0.5"}`} />
                  </span>
                  <input type="checkbox" checked={autoGroup} onChange={e=> setAutoGroup(e.target.checked)} className="hidden" />
                  Automatic grouping
                </label>
              </div>

              <button className="absolute bottom-3 right-3 w-10 h-9 bg-[#292824] border border-[#3B3A36] rounded-[12px] flex items-center justify-center text-[#F0EFEC] text-[16px] font-serif italic">fn</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
