import { useEffect, useState, useRef } from "react"
import { Search, ZoomIn, ZoomOut, Maximize2, RotateCcw, Loader2, AlertCircle, Box, Key, Link2, ChevronDown, Download } from "lucide-react"
import { api } from "@/lib/api"
import { useConnection } from "@/context/ConnectionContext"
import TopBar from "@/components/layout/TopBar"
import LeftNav from "@/components/layout/LeftNav"
import Sidebar from "@/components/layout/Sidebar"
import { PostgreSQL } from "@/components/PostgreSQL"
import { FAKE_SCHEMA } from "@/lib/fakeData"

const IMAGE_MOCK = FAKE_SCHEMA

export default function SchemaPage() {
  const { connected, config } = useConnection()
  const dbName = config?.database || "mydb"
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

  const MIN_ZOOM = 0.1
  const MAX_ZOOM = 2.5

  const handleWheel = (e) => {
    e.preventDefault()
    const delta = -e.deltaY * 0.0012
    const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom + delta))
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

  // ── Schema file export (PNG / SVG) ──
  const exportMenuRef = useRef(null)
  const [exportOpen, setExportOpen] = useState(false)

  useEffect(() => {
    if (!exportOpen) return
    const close = (e) => { if (exportMenuRef.current && !exportMenuRef.current.contains(e.target)) setExportOpen(false) }
    document.addEventListener("mousedown", close)
    return () => document.removeEventListener("mousedown", close)
  }, [exportOpen])

  const escXml = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
  const tableHeight = (t) => 28 + t.columns.length * 22 + (t.indexes?.length ? 24 + t.indexes.length * 22 : 0)

  const buildSchemaSvg = () => {
    const tables = filtered.length ? filtered : data.tables
    const names = new Set(tables.map(t => t.name))
    const posOf = (name) => positions[name] ?? data.tables.find(t => t.name === name)?.pos ?? { x: 0, y: 0 }
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    tables.forEach(t => {
      const p = posOf(t.name)
      minX = Math.min(minX, p.x); minY = Math.min(minY, p.y)
      maxX = Math.max(maxX, p.x + 280); maxY = Math.max(maxY, p.y + tableHeight(t))
    })
    if (!tables.length) { minX = 0; minY = 0; maxX = 800; maxY = 600 }
    const PAD = 40
    const vbX = Math.round(minX - PAD), vbY = Math.round(minY - PAD)
    const vbW = Math.round(maxX - minX + PAD * 2), vbH = Math.round(maxY - minY + PAD * 2)

    const edges = data.relations.filter(r => names.has(r.from) && names.has(r.to)).map(r => {
      const from = data.tables.find(t => t.name === r.from)
      const to = data.tables.find(t => t.name === r.to)
      if (!from || !to) return ""
      const s = posOf(r.from), tp = posOf(r.to)
      const fromIdx = from.columns.findIndex(c => c.column === r.fromCol)
      const toIdx = to.columns.findIndex(c => c.column === r.toCol)
      const fromY = s.y + 28 + (fromIdx >= 0 ? fromIdx * 22 + 11 : from.columns.length * 11)
      const toY = tp.y + 28 + (toIdx >= 0 ? toIdx * 22 + 11 : 11)
      const sx = s.x + 280, tx = tp.x, midX = (sx + tx) / 2
      return `<path d="M ${sx} ${fromY} L ${midX} ${fromY} L ${midX} ${toY} L ${tx} ${toY}" stroke="#5A5852" stroke-width="1.5" fill="none" marker-end="url(#arrow)" opacity="0.9"/>`
    }).join("")

    const cards = tables.map(t => {
      const p = posOf(t.name)
      const h = tableHeight(t)
      const rows = t.columns.map((c, i) => {
        const y = p.y + 28 + i * 22
        const dot = c.isPrimary ? `<circle cx="${p.x + 18}" cy="${y + 11}" r="3" fill="#EAB308"/>` : c.isFK ? `<circle cx="${p.x + 18}" cy="${y + 11}" r="3" fill="#4A90E2"/>` : ""
        const nameFill = c.isPrimary ? "#F0EFEC" : c.isFK ? "#4A90E2" : "#F0EFEC"
        return `${dot}<text x="${p.x + 28}" y="${y + 15}" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="11" fill="${nameFill}">${escXml(c.column)}</text><text x="${p.x + 272}" y="${y + 15}" text-anchor="end" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="11" fill="#85837E">${escXml(c.type)}</text>`
      }).join("")
      const dividers = t.columns.map((_, i) => `<line x1="${p.x}" y1="${p.y + 28 + (i + 1) * 22}" x2="${p.x + 280}" y2="${p.y + 28 + (i + 1) * 22}" stroke="#3B3A36" stroke-opacity="0.4"/>`).join("")
      let idxBlock = ""
      if (t.indexes?.length) {
        const iy = p.y + 28 + t.columns.length * 22
        const idxRows = t.indexes.map((idx, ii) => {
          const parts = String(idx).split(":")
          return `<text x="${p.x + 12}" y="${iy + 24 + ii * 22 + 15}" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="10" fill="#B7B5B0">${escXml(parts[0])}</text><text x="${p.x + 110}" y="${iy + 24 + ii * 22 + 15}" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="10" fill="#66645F">${escXml((parts[1] || "").trim())}</text>`
        }).join("")
        idxBlock = `<rect x="${p.x}" y="${iy}" width="280" height="${24 + t.indexes.length * 22}" fill="#1D1C1A" fill-opacity="0.5"/><line x1="${p.x}" y1="${iy}" x2="${p.x + 280}" y2="${iy}" stroke="#3B3A36"/><text x="${p.x + 12}" y="${iy + 16}" font-family="Inter, sans-serif" font-size="10" letter-spacing="1.5" fill="#66645F">INDEXES</text>${idxRows}`
      }
      return `<g><rect x="${p.x}" y="${p.y}" width="280" height="${h}" rx="8" fill="#292824" stroke="#3B3A36"/><rect x="${p.x}" y="${p.y}" width="280" height="28" rx="8" fill="#35342F"/><rect x="${p.x}" y="${p.y + 20}" width="280" height="8" fill="#35342F"/><line x1="${p.x}" y1="${p.y + 28}" x2="${p.x + 280}" y2="${p.y + 28}" stroke="#3B3A36"/><text x="${p.x + 12}" y="${p.y + 18}" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="#F0EFEC">${escXml(t.name)}</text>${rows}${dividers}${idxBlock}</g>`
    }).join("")

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${vbW}" height="${vbH}" viewBox="${vbX} ${vbY} ${vbW} ${vbH}"><rect x="${vbX}" y="${vbY}" width="${vbW}" height="${vbH}" fill="#1D1C1A"/><defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#5A5852"/></marker></defs>${edges}${cards}</svg>`
    return { svg, width: vbW, height: vbH }
  }

  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  const exportSchemaSvg = () => {
    const { svg } = buildSchemaSvg()
    downloadBlob(new Blob([svg], { type: "image/svg+xml" }), `${dbName}-schema.svg`)
    setExportOpen(false)
  }

  const exportSchemaPng = () => {
    const { svg, width, height } = buildSchemaSvg()
    const SCALE = 2
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }))
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.width = width * SCALE
      canvas.height = height * SCALE
      const ctx = canvas.getContext("2d")
      ctx.fillStyle = "#1D1C1A"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      canvas.toBlob((blob) => { if (blob) downloadBlob(blob, `${dbName}-schema.png`) }, "image/png")
    }
    img.onerror = () => URL.revokeObjectURL(url)
    img.src = url
    setExportOpen(false)
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
              <div className="h-8 px-3 flex items-center gap-2 bg-[#292824] border border-[#3B3A36] rounded-[6px] text-[13px] text-[#F0EFEC]">
                <PostgreSQL className="w-4 h-4" /> {dbName}
              </div>
              <div ref={exportMenuRef} className="relative">
                <button onClick={() => setExportOpen(o => !o)} className="h-8 px-3 flex items-center gap-1.5 bg-[#292824] border border-[#3B3A36] rounded-[6px] text-[13px] font-medium text-[#F0EFEC] hover:bg-[#232220]">
                  <Download className="w-4 h-4" /> Schema file <ChevronDown className={`w-3.5 h-3.5 text-[#85837E] transition-transform ${exportOpen ? "rotate-180" : ""}`} />
                </button>
                {exportOpen && (
                  <div className="absolute right-0 mt-1.5 w-[200px] bg-[#292824] border border-[#3B3A36] rounded-[8px] p-1 shadow-[0_8px_24px_rgba(0,0,0,0.5)] z-20">
                    <button onClick={exportSchemaPng} className="flex w-full items-center justify-between rounded-[6px] px-2.5 py-2 text-[13px] text-[#B7B5B0] hover:bg-[#3B3935] hover:text-[#F0EFEC]">
                      PNG image <span className="font-mono text-[11px] text-[#66645F]">.png</span>
                    </button>
                    <button onClick={exportSchemaSvg} className="flex w-full items-center justify-between rounded-[6px] px-2.5 py-2 text-[13px] text-[#B7B5B0] hover:bg-[#3B3935] hover:text-[#F0EFEC]">
                      SVG vector <span className="font-mono text-[11px] text-[#66645F]">.svg</span>
                    </button>
                  </div>
                )}
              </div>
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
              {/* Infinite dot grid — background position/size track pan & zoom instead of a fixed-size layer */}
              <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #4A4944 1.2px, transparent 0)", backgroundSize: `${24 * zoom}px ${24 * zoom}px`, backgroundPosition: `${offset.x}px ${offset.y}px`, opacity: 0.35 }} />
              <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #3B3A36 1px, transparent 0)", backgroundSize: `${24 * zoom}px ${24 * zoom}px`, backgroundPosition: `${offset.x}px ${offset.y}px`, opacity: 0.25 }} />

              <div className="absolute top-3 left-3 z-10">
                <div className="relative">
                  <Search className="w-4 h-4 text-[#85837E] absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input value={search} onChange={e=> setSearch(e.target.value)} placeholder="? to search" className="h-8 w-[280px] pl-8 pr-3 bg-[#292824] border border-[#3B3A36] rounded-[8px] text-[13px] placeholder:text-[#85837E] text-[#F0EFEC] focus:outline-none focus:border-[#4A4944]" />
                </div>
              </div>

              {error && <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-[#1D1C1A] border border-[#EF4444]/30 rounded-[6px] px-3 py-1.5 flex items-center gap-2 text-[13px] text-[#EF4444]"><AlertCircle className="w-4 h-4" />{error}</div>}
              {loading && <div className="absolute top-12 left-1/2 -translate-x-1/2 z-10 bg-[#292824] border border-[#3B3A36] rounded-[6px] px-3 py-1.5 flex items-center gap-2 text-[13px] text-[#B7B5B0]"><Loader2 className="w-4 h-4 animate-spin" /> Loading schema…</div>}

              {/* overflow-visible so relation lines outside the viewport still paint after pan/zoom — otherwise distant edges get clipped */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`, transformOrigin: "0 0", overflow: "visible" }}>
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
                <button onClick={()=> setZoom(z=> Math.max(MIN_ZOOM, z-0.1))} className="w-6 h-6 flex items-center justify-center hover:bg-[#3B3935] rounded-[4px] text-[#B7B5B0]">−</button>
                <span className="text-[12px] font-mono text-[#F0EFEC] w-[42px] text-center">{Math.round(zoom*100)}%</span>
                <button onClick={()=> setZoom(z=> Math.min(MAX_ZOOM, z+0.1))} className="w-6 h-6 flex items-center justify-center hover:bg-[#3B3935] rounded-[4px] text-[#B7B5B0]">+</button>
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
