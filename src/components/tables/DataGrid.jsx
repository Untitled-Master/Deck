import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight, Loader2, AlertCircle, Link2, KeyRound, ArrowLeft, ArrowRight, SlidersHorizontal, EyeOff, ChevronDown, Trash2, Check, X, Plus } from "lucide-react"
import { useConnection } from "@/context/ConnectionContext"
import { api } from "@/lib/api"
import { FAKE_ROWS } from "@/lib/fakeData"

const MOCK_ROWS = FAKE_ROWS

function getShowGridLines() {
  try {
    const raw = localStorage.getItem("deck:settings")
    if (!raw) return true
    const j = JSON.parse(raw)
    return j?.editor?.showGridLines ?? true
  } catch { return true }
}
function getShowRowNumbers() {
  try {
    const raw = localStorage.getItem("deck:settings")
    if (!raw) return true
    const j = JSON.parse(raw)
    return j?.editor?.showRowNumbers ?? true
  } catch { return true }
}

export default function DataGrid({ table, queryResult, refreshKey, addTrigger }) {
  const { connected } = useConnection()
  const [showGridLines, setShowGridLines] = useState(() => getShowGridLines())
  const [showRowNumbers, setShowRowNumbers] = useState(() => getShowRowNumbers())
  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [page, setPage] = useState(0)
  const limit = 100

  useEffect(() => {
    const sync = () => {
      setShowGridLines(getShowGridLines())
      setShowRowNumbers(getShowRowNumbers())
    }
    sync()
    const onStorage = (e) => { if (!e.key || e.key === "deck:settings") sync() }
    window.addEventListener("storage", onStorage)
    const id = setInterval(sync, 600)
    const onCustom = () => sync()
    window.addEventListener("deck:settings:update", onCustom)
    return () => { window.removeEventListener("storage", onStorage); window.removeEventListener("deck:settings:update", onCustom); clearInterval(id) }
  }, [])

  const isSqlResult = !!queryResult
  const rawRows = isSqlResult ? queryResult?.rows : rows
  const displayRows = Array.isArray(rawRows) ? rawRows : []
  const columns = displayRows.length ? Object.keys(displayRows[0] ?? {}) : []

  useEffect(() => {
    if (isSqlResult) return
    if (!connected) {
      setRows(MOCK_ROWS[table] ?? MOCK_ROWS.favorites)
      setTotal(null)
      setError("")
      setLoading(false)
      setPage(0)
      return
    }
    let cancelled = false
    setLoading(true)
    setError("")
    api.rows(table, { limit, offset: page * limit })
      .then(res => { if (!cancelled) { setRows(res.rows); setTotal(res.total) } })
      .catch(err => { if (!cancelled) { setError(err.message); setRows(MOCK_ROWS[table] ?? []) } })
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [table, page, connected, refreshKey, isSqlResult])

  useEffect(() => { setPage(0) }, [table])

  const [showColumns, setShowColumns] = useState(false)
  const [fieldSearch, setFieldSearch] = useState("")
  const [visibleCols, setVisibleCols] = useState(()=> new Set(columns))
  useEffect(()=>{ setVisibleCols(new Set(columns)) }, [columns.join(",")])
  useEffect(()=>{
    if(!showColumns) return
    const onDown = (e)=>{ if(!e.target.closest(".col-dropdown")) setShowColumns(false) }
    document.addEventListener("mousedown", onDown)
    return ()=> document.removeEventListener("mousedown", onDown)
  },[showColumns])

  // selection + editing
  const [selected, setSelected] = useState(()=> new Set())
  const [editing, setEditing] = useState(null) // {rowIdx, col}
  const [editValue, setEditValue] = useState("")
  const [pkCol, setPkCol] = useState(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [newRow, setNewRow] = useState({})
  const [saving, setSaving] = useState(false)

  // detect pk
  useEffect(()=>{
    if(isSqlResult){ setPkCol(null); return }
    const sample = displayRows[0] ?? rows[0]
    if(!connected){
      if(sample){
        if("_id" in sample) setPkCol("_id")
        else if("id" in sample) setPkCol("id")
        else setPkCol(Object.keys(sample)[0] ?? null)
      }
      return
    }
    // live: fetch columns
    api.columns(table).then(res=>{
      const pk = res.columns.find(c=> c.isPrimary)?.column
      if(pk) setPkCol(pk)
      else if(sample && "_id" in sample) setPkCol("_id")
      else if(sample && "id" in sample) setPkCol("id")
      else setPkCol(res.columns[0]?.column ?? Object.keys(sample ?? {})[0] ?? null)
    }).catch(()=>{
      if(sample && "_id" in sample) setPkCol("_id")
      else if(sample && "id" in sample) setPkCol("id")
    })
  }, [table, connected, isSqlResult, displayRows.length ? displayRows[0]._id ?? displayRows[0].id : ""])

  // clear selection when table changes or rows change
  useEffect(()=>{ setSelected(new Set()); setEditing(null) }, [table, refreshKey])

  const getRowId = (row, idx) => {
    if(!row) return String(idx)
    if(pkCol && row[pkCol] != null) return String(row[pkCol])
    if(row._id != null) return String(row._id)
    if(row.id != null) return String(row.id)
    return String(idx)
  }

  const allVisibleIds = displayRows.map((r,i)=> getRowId(r,i))
  const allSelected = displayRows.length>0 && allVisibleIds.every(id=> selected.has(id))
  const toggleSelectAll = ()=>{
    if(isSqlResult) return
    if(allSelected) setSelected(new Set())
    else setSelected(new Set(allVisibleIds))
  }
  const toggleRow = (row, idx)=>{
    if(isSqlResult) return
    const id = getRowId(row, idx)
    setSelected(s=>{
      const n=new Set(s)
      if(n.has(id)) n.delete(id); else n.add(id)
      return n
    })
  }

  const startEdit = (rowIdx, col, val)=>{
    if(isSqlResult) return
    // don't allow editing pk if desired? allow for now but warn
    setEditing({rowIdx, col})
    setEditValue(val == null ? "" : String(val))
  }
  const cancelEdit = ()=> setEditing(null)
  const saveEdit = async ()=>{
    if(!editing) return
    const {rowIdx, col} = editing
    const row = displayRows[rowIdx]
    const pkVal = pkCol ? row[pkCol] : null
    const newVal = editValue
    // no change
    if(String(row[col] ?? "") === newVal){ setEditing(null); return }
    setSaving(true)
    try{
      if(connected && pkCol && pkVal != null){
        // use parameterized query
        const sql = `UPDATE "${table}" SET "${col}" = $1 WHERE "${pkCol}" = $2`
        await api.query(sql, [newVal === "" ? null : newVal, pkVal])
        // refetch or optimistic
        if(!isSqlResult){
          setRows(prev=> prev.map((r,i)=> i===rowIdx ? {...r, [col]: newVal === "" ? null : newVal} : r))
        }
      } else {
        // mock: just update local
        if(!isSqlResult){
          setRows(prev=> prev.map((r,i)=> i===rowIdx ? {...r, [col]: newVal === "" ? null : newVal} : r))
        }
      }
      setEditing(null)
      setError("")
    }catch(e){
      setError(e.message)
    }finally{ setSaving(false) }
  }

  const handleDelete = async ()=>{
    const ids = Array.from(selected)
    if(!ids.length) return
    setSaving(true)
    try{
      if(connected && pkCol){
        const placeholders = ids.map((_,i)=> `$${i+1}`).join(",")
        const sql = `DELETE FROM "${table}" WHERE "${pkCol}" IN (${placeholders})`
        await api.query(sql, ids)
        // refetch
        setSelected(new Set())
        setDeleteOpen(false)
        // trigger refresh via rows fetch
        if(!isSqlResult){
          setLoading(true)
          const res = await api.rows(table, { limit, offset: page*limit })
          setRows(res.rows)
          setTotal(res.total)
        }
      } else {
        // mock delete locally
        if(!isSqlResult){
          setRows(prev=> prev.filter((r,i)=> !selected.has(getRowId(r,i))))
          setTotal(null)
        }
        setSelected(new Set())
        setDeleteOpen(false)
      }
    }catch(e){
      setError(e.message)
    }finally{ setSaving(false) }
  }

  const canPrev = page > 0
  const canNext = total != null ? (page + 1) * limit < total : displayRows.length === limit
  const orderedColumns = table === "favorites" ? ["_id","addedAt","mediaType","posterPath","title","tmdbId","userId","_creationTime"].filter(c=>columns.includes(c)).concat(columns.filter(c=>!["_id","addedAt","mediaType","posterPath","title","tmdbId","userId","_creationTime"].includes(c))) : columns
  const visibleOrdered = orderedColumns.filter(c=> visibleCols.has(c))
  const displayColumns = visibleOrdered.length ? visibleOrdered : orderedColumns
  const filteredColumns = orderedColumns.filter(c=> c.toLowerCase().includes(fieldSearch.toLowerCase()))
  const toggleColumn = (col)=> setVisibleCols(s=>{ const n=new Set(s); if(n.has(col)) n.delete(col); else n.add(col); return n })
  const hideAll = ()=> setVisibleCols(new Set())
  const showAll = ()=> setVisibleCols(new Set(orderedColumns))

  const openAdd = ()=>{
    if(isSqlResult) return
    const init={}
    orderedColumns.forEach(c=>{
      if(c==="_id" && !isSqlResult) init[c] = `j${Math.random().toString(36).slice(2,10)}${Math.random().toString(36).slice(2,6)}`
      else if(c==="addedAt" || c==="createdAt") init[c] = new Date().toLocaleString()
      else init[c] = ""
    })
    setNewRow(init)
    setShowAdd(true)
  }
  useEffect(()=>{
    if(addTrigger!=null && addTrigger>0) openAdd()
  },[addTrigger])

  const handleAdd = async ()=>{
    const cols = Object.keys(newRow).filter(k=> orderedColumns.includes(k))
    // filter out empty _id if auto? keep for mock
    const vals = cols.map(c=> newRow[c])
    // validate at least one non-empty besides _id
    const hasValue = cols.some(c=> c!=="_id" && String(newRow[c]??"").trim()!=="")
    if(!hasValue){ setError("Fill at least one field besides _id"); return }
    setSaving(true)
    try{
      if(connected && !isSqlResult){
        const colList = cols.map(c=> `"${c}"`).join(", ")
        const placeholders = cols.map((_,i)=> `$${i+1}`).join(", ")
        const sql = `INSERT INTO "${table}" (${colList}) VALUES (${placeholders})`
        // convert empty strings to null
        const params = vals.map(v=> v==="" ? null : v)
        await api.query(sql, params)
        setShowAdd(false)
        setNewRow({})
        // refetch
        const res = await api.rows(table, { limit, offset: page*limit })
        setRows(res.rows)
        setTotal(res.total)
        setError("")
      } else {
        // mock: push to local rows
        const newEntry = {}
        cols.forEach(c=> newEntry[c] = newRow[c]==="" ? null : newRow[c])
        // ensure _id
        if(!newEntry._id && !newEntry.id) newEntry._id = `jh${Math.random().toString(36).slice(2,10)}`
        if(!newEntry.addedAt && orderedColumns.includes("addedAt")) newEntry.addedAt = new Date().toLocaleString()
        if(!newEntry.createdAt && orderedColumns.includes("createdAt")) newEntry.createdAt = new Date().toLocaleString()
        setRows(prev=> [newEntry, ...prev])
        setTotal(null)
        setShowAdd(false)
        setNewRow({})
        setError("")
      }
    }catch(e){
      setError(e.message)
    }finally{ setSaving(false) }
  }

  const gridBorder = showGridLines ? "border-[#3B3A36]" : "border-transparent"
  const gridB = showGridLines ? "border-b border-[#3B3A36]" : "border-b border-transparent"

  return (
    <div className="border border-[#3B3A36] rounded-[9px] bg-[#2A2825] flex flex-col w-full flex-1 min-h-[420px] h-[520px]">
      {/* Toolbar 52px */}
      <div className="h-[52px] flex items-center gap-2 px-3 border-b border-[#3B3A36] bg-[#2A2825] shrink-0">
        <div className="flex items-center gap-1.5">
          <button className="w-8 h-8 flex items-center justify-center border border-[#4A4944] bg-transparent rounded-[6px] text-[#B7B5B0] hover:bg-[#3B3935] hover:text-[#F0EFEC] transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center border border-[#4A4944] bg-transparent rounded-[6px] text-[#B7B5B0] hover:bg-[#3B3935] transition-colors">
            <ArrowRight className="w-4 h-4" />
          </button>
          <button className="h-8 px-3 flex items-center gap-1.5 border border-[#4A4944] bg-transparent rounded-[6px] text-[13px] font-bold text-[#F0EFEC] hover:bg-[#3B3935]">
            <SlidersHorizontal className="w-4 h-4" /> Filter & Sort <ChevronDown className="w-3 h-3" />
          </button>
          <div className="relative col-dropdown">
            <button
              onClick={() => setShowColumns(v=>!v)}
              className={`w-8 h-8 flex items-center justify-center border rounded-[6px] transition-colors ${showColumns ? "bg-[#3B3935] border-[#5A5852] text-[#F0EFEC]" : "border-[#4A4944] bg-transparent text-[#B7B5B0] hover:bg-[#3B3935] hover:text-[#F0EFEC]"}`}
            >
              <EyeOff className="w-4 h-4" />
            </button>
            {showColumns && (
              <div className="absolute left-0 top-10 z-20 w-[300px] bg-[#292824] border border-[#3B3A36] rounded-[8px] overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
                <div className="p-2 border-b border-[#3B3A36]">
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#85837E]">⌕</span>
                    <input
                      value={fieldSearch}
                      onChange={e=>setFieldSearch(e.target.value)}
                      placeholder="Search fields..."
                      className="w-full h-8 pl-8 pr-3 bg-[#1D1C1A] border border-[#3B3A36] rounded-[6px] text-[13px] placeholder:text-[#85837E] text-[#F0EFEC] focus:outline-none focus:border-[#4A4944]"
                    />
                  </div>
                </div>
                <div className="max-h-[240px] overflow-auto py-1">
                  {filteredColumns.map(col=>(
                    <label key={col} className="flex items-center justify-between px-3 py-1.5 hover:bg-[#3B3935] cursor-pointer group">
                      <span className="flex items-center gap-2 text-[13px] font-mono text-[#F0EFEC]">{col}</span>
                      <span className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e)=>{ e.preventDefault(); toggleColumn(col)}}
                          className={`relative w-9 h-5 rounded-full transition-colors ${visibleCols.has(col) ? "bg-[#4A90E2]" : "bg-[#3B3A36]"}`}
                        >
                          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${visibleCols.has(col) ? "left-4" : "left-0.5"}`} />
                        </button>
                        <span className="w-4 h-4 flex items-center justify-center text-[#66645F] group-hover:text-[#B7B5B0]">⋮⋮</span>
                      </span>
                    </label>
                  ))}
                  {!filteredColumns.length && <div className="px-3 py-3 text-[13px] text-[#85837E]">No fields</div>}
                </div>
                <div className="p-2 border-t border-[#3B3A36] grid grid-cols-2 gap-1.5">
                  <button onClick={hideAll} className="h-8 flex items-center justify-center gap-1.5 border border-[#4A4944] bg-[#232220] rounded-[6px] text-[13px] font-medium text-[#F0EFEC] hover:bg-[#3B3935]">
                    <EyeOff className="w-4 h-4" /> Hide All
                  </button>
                  <button onClick={showAll} className="h-8 flex items-center justify-center gap-1.5 border border-[#4A4944] bg-[#232220] rounded-[6px] text-[13px] font-medium text-[#F0EFEC] hover:bg-[#3B3935]">
                    <span className="w-4 h-4 flex items-center justify-center"><span className="w-3 h-3 rounded-full border border-current" /></span> Show All
                  </button>
                </div>
              </div>
            )}
          </div>
          {selected.size>0 && !isSqlResult && (
            <button
              onClick={()=> setDeleteOpen(true)}
              className="h-8 px-3 flex items-center gap-1.5 border border-[#7f1d1d] bg-[#450a0a] rounded-[6px] text-[13px] font-medium text-[#fca5a5] hover:bg-[#7f1d1d] hover:text-white"
            >
              <Trash2 className="w-4 h-4" /> Delete {selected.size}
            </button>
          )}
        </div>
        <span className="ml-auto text-[13px] font-medium text-[#E8E7E3]">{isSqlResult ? `${displayRows.length} rows` : `${total ?? displayRows.length} documents`}</span>
      </div>

      {error && !isSqlResult && (
        <div className="flex items-center gap-2 bg-[#2A2825] border-b border-[#3B3A36] px-4 py-2 text-[13px] text-[#EF4444]">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      <div className="overflow-auto flex-1 data-grid min-h-0">
        <table className="w-full text-left border-collapse">
          <thead className={`sticky top-0 bg-[#2A2825] border-b z-10 ${gridBorder}`}>
            <tr>
              <th className={`w-10 min-w-[40px] h-10 px-2 border-r bg-[#2A2825] ${gridBorder}`}>
                <button onClick={toggleSelectAll} disabled={isSqlResult || !displayRows.length} className="w-4 h-4 border rounded-[3px] flex items-center justify-center mx-auto disabled:opacity-30"
                  style={{ borderColor: allSelected ? "#4A90E2" : "#5A5852", background: allSelected ? "#4A90E2" : "transparent" }}>
                  {allSelected && <Check className="w-3 h-3 text-white" />}
                </button>
              </th>
              {showRowNumbers && (
                <th className={`w-12 min-w-[48px] h-10 px-2 text-[11px] font-medium text-[#85837E] text-center border-r bg-[#2A2825] ${gridBorder}`}>#</th>
              )}
              {displayColumns.map(c => (
                <th key={c} className={`h-10 px-3 text-[13px] font-semibold text-[#B7B5B0] whitespace-nowrap border-r last:border-r-0 bg-[#2A2825] ${gridBorder}`}>
                  <span className="flex items-center gap-1">
                    {c === "_id" && <KeyRound className="w-3 h-3 text-[#85837E]" />}
                    {c}
                    {(c==="addedAt"||c==="createdAt") && <span className="w-3 h-3 border border-[#5A5852] rounded-[3px] flex items-center justify-center text-[8px] text-[#85837E]">◫</span>}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayRows.map((row, idx) => {
              const id = getRowId(row, idx)
              const isSel = selected.has(id)
              const isEditing = editing && editing.rowIdx===idx && editing.col
              return (
              <tr key={idx} className={`h-10 border-b last:border-b-0 transition-colors ${gridBorder} ${isSel ? "bg-[#3B3935]" : "bg-[#2A2825] hover:bg-[#232220]"}`}>
                <td className={`w-10 min-w-[40px] px-2 border-r h-10 ${gridBorder}`}>
                  <button onClick={()=> toggleRow(row, idx)} disabled={isSqlResult} className="w-4 h-4 border rounded-[3px] flex items-center justify-center mx-auto disabled:opacity-30"
                    style={{ borderColor: isSel ? "#4A90E2" : "#5A5852", background: isSel ? "#4A90E2" : "transparent" }}>
                    {isSel && <Check className="w-3 h-3 text-white" />}
                  </button>
                </td>
                {showRowNumbers && (
                  <td className={`w-12 min-w-[48px] px-2 h-10 text-center text-[12px] font-mono text-[#85837E] border-r ${gridBorder}`}>
                    {page * limit + idx + 1}
                  </td>
                )}
                {displayColumns.map(col => {
                  const val = row[col]
                  const isLink = col === "userId"
                  const editingThis = editing && editing.rowIdx===idx && editing.col===col
                  return (
                    <td
                      key={col}
                      onDoubleClick={()=> !isSqlResult && startEdit(idx, col, val)}
                      className={`px-3 h-10 whitespace-nowrap max-w-[220px] border-r last:border-r-0 ${gridBorder}`}
                      title={isSqlResult ? String(val ?? "") : "Double-click to edit"}
                    >
                      {editingThis ? (
                        <div className="flex items-center gap-1">
                          <input
                            autoFocus
                            value={editValue}
                            onChange={e=> setEditValue(e.target.value)}
                            onBlur={saveEdit}
                            onKeyDown={e=>{ if(e.key==="Enter") saveEdit(); if(e.key==="Escape") cancelEdit() }}
                            className="w-full h-7 px-2 bg-[#1D1C1A] border border-[#4A90E2] rounded-[6px] text-[13px] font-mono text-[#F0EFEC] focus:outline-none"
                            disabled={saving}
                          />
                          <button onMouseDown={saveEdit} className="w-6 h-6 flex items-center justify-center bg-[#4A90E2] rounded-[4px] text-white hover:bg-[#3a7bc8]"><Check className="w-3 h-3" /></button>
                          <button onMouseDown={cancelEdit} className="w-6 h-6 flex items-center justify-center bg-[#3B3A36] rounded-[4px] text-[#B7B5B0] hover:bg-[#4A4944]"><X className="w-3 h-3" /></button>
                        </div>
                      ) : val == null || val === "" ? <span className="text-[13px] text-[#66645F] italic">unset</span> :
                        isLink ? <span className="flex items-center gap-1 text-[13px] font-mono font-bold text-[#F0EFEC]"><Link2 className="w-3 h-3 text-[#B7B5B0] shrink-0" />{String(val)}</span> :
                        <span className="text-[13px] font-mono font-bold text-[#F0EFEC] truncate block">{String(val)}</span>
                      }
                    </td>
                  )
                })}
              </tr>
            )})}
            {displayRows.length === 0 && !loading && (
              <tr>
                <td colSpan={displayColumns.length + 1 + (showRowNumbers ? 1 : 0)} className="px-6 py-16 text-center text-[13px] text-[#85837E] h-10 bg-[#2A2825]">
                  No documents — add one to start.
                </td>
              </tr>
            )}
            {loading && !isSqlResult && (
              <tr>
                <td colSpan={displayColumns.length + 1 + (showRowNumbers ? 1 : 0)} className="px-6 py-10 text-center text-[13px] text-[#85837E] bg-[#2A2825]">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" /> Loading…
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="h-10 flex items-center justify-between px-3 border-t border-[#3B3A36] bg-[#2A2825] shrink-0">
        <span className="text-[12px] text-[#85837E]">
          {isSqlResult ? `SQL • ${displayRows.length} records` : `Page ${page + 1} • ${displayRows.length} docs${total != null ? ` / ${total}` : ""} ${selected.size ? `• ${selected.size} selected` : ""}`}
        </span>
        {!isSqlResult && (
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={!canPrev || loading} className="w-8 h-8 flex items-center justify-center border border-[#3B3A36] rounded-[6px] hover:bg-[#232220] disabled:opacity-30 text-[#B7B5B0]">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setPage(p => p + 1)} disabled={!canNext || loading} className="w-8 h-8 flex items-center justify-center border border-[#3B3A36] rounded-[6px] hover:bg-[#232220] disabled:opacity-30 text-[#B7B5B0]">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Delete dialog */}
      {deleteOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={()=> !saving && setDeleteOpen(false)} />
          <div className="relative w-full max-w-[420px] bg-[#292824] border border-[#3B3A36] rounded-[9px] overflow-hidden">
            <div className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#7f1d1d] flex items-center justify-center">
                  <Trash2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-[14px] font-semibold text-[#F0EFEC]">Delete {selected.size} {selected.size===1?"row":"rows"}?</div>
                  <div className="text-[13px] text-[#B7B5B0]">This will permanently delete the selected {selected.size===1?"document":"documents"} from <span className="font-mono text-[#F0EFEC]">{table}</span>.</div>
                </div>
              </div>
              <div className="mt-3 p-3 bg-[#1D1C1A] border border-[#3B3A36] rounded-[6px] max-h-[120px] overflow-auto">
                <div className="text-[11px] tracking-widest text-[#85837E]">SELECTED IDS</div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {Array.from(selected).map(id=> <span key={id} className="text-[11px] font-mono px-1.5 py-0.5 bg-[#232220] border border-[#3B3A36] rounded-[4px] text-[#B7B5B0]">{id}</span>)}
                </div>
              </div>
            </div>
            <div className="px-5 py-3 bg-[#1D1C1A] border-t border-[#3B3A36] flex items-center justify-end gap-2">
              <button onClick={()=> setDeleteOpen(false)} disabled={saving} className="h-8 px-4 border border-[#4A4944] bg-transparent rounded-[6px] text-[13px] font-medium text-[#B7B5B0] hover:bg-[#3B3935] disabled:opacity-50">Cancel</button>
              <button onClick={handleDelete} disabled={saving} className="h-8 px-4 bg-[#EF4444] text-white rounded-[6px] text-[13px] font-medium hover:bg-[#dc2626] disabled:opacity-50 flex items-center gap-1.5">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {showAdd && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={()=> !saving && setShowAdd(false)} />
          <div className="relative w-full max-w-[520px] bg-[#292824] border border-[#3B3A36] rounded-[9px] overflow-hidden max-h-[80vh] flex flex-col">
            <div className="px-5 py-4 border-b border-[#3B3A36]">
              <div className="text-[14px] font-semibold text-[#F0EFEC]">Add row to {table}</div>
              <div className="text-[12px] text-[#85837E] mt-1">Fill values — double-click to edit also available. Leave _id empty for auto.</div>
            </div>
            <div className="p-5 space-y-3 overflow-auto flex-1">
              {orderedColumns.map(col=>(
                <div key={col}>
                  <label className="text-[11px] font-medium tracking-widest text-[#B7B5B0]">{col.toUpperCase()}</label>
                  <input value={newRow[col] ?? ""} onChange={e=> setNewRow(s=> ({...s, [col]: e.target.value}))} placeholder={col === "_id" ? "auto" : `Enter ${col}`} className="mt-1 w-full h-9 px-3 bg-[#1D1C1A] border border-[#3B3A36] rounded-[6px] text-[13px] font-mono text-[#F0EFEC] placeholder:text-[#66645F] focus:outline-none focus:border-[#4A4944]" />
                </div>
              ))}
              {error && <div className="text-[12px] text-[#EF4444] bg-[#1D1C1A] border border-[#7f1d1d] rounded-[6px] px-3 py-2">{error}</div>}
            </div>
            <div className="px-5 py-3 bg-[#1D1C1A] border-t border-[#3B3A36] flex items-center justify-end gap-2">
              <button onClick={()=> setShowAdd(false)} disabled={saving} className="h-8 px-4 border border-[#4A4944] bg-transparent rounded-[6px] text-[13px] font-medium text-[#B7B5B0] hover:bg-[#3B3935] disabled:opacity-50">Cancel</button>
              <button onClick={handleAdd} disabled={saving} className="h-8 px-4 bg-[#F0EFEC] text-[#1D1C1A] rounded-[6px] text-[13px] font-medium hover:bg-white disabled:opacity-50 flex items-center gap-1.5">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Add row
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export { MOCK_ROWS }
