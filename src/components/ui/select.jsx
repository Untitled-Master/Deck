import * as React from "react"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

// Custom deck-themed dropdown — replaces Radix to keep visual identity
// API kept compatible: <Select value onValueChange><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value>…

const SelectContext = React.createContext(null)

const Select = ({ value, onValueChange, children, defaultValue }) => {
  const [open, setOpen] = React.useState(false)
  const [internalValue, setInternalValue] = React.useState(value ?? defaultValue ?? "")
  const current = value !== undefined ? value : internalValue
  const rootRef = React.useRef(null)

  const setValue = (v) => {
    if (value === undefined) setInternalValue(v)
    onValueChange?.(v)
    setOpen(false)
  }

  // close on outside click / Escape
  React.useEffect(() => {
    const onDown = (e) => {
      if (!rootRef.current) return
      if (!rootRef.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => { if (e.key === "Escape") setOpen(false) }
    document.addEventListener("mousedown", onDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [])

  return (
    <SelectContext.Provider value={{ value: current, setValue, open, setOpen }}>
      <div ref={rootRef} className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  )
}

const SelectGroup = ({ children }) => <div>{children}</div>

const SelectValue = ({ placeholder, children }) => {
  const ctx = React.useContext(SelectContext)
  if (!ctx) return null
  // if children passed explicitly, render it; otherwise show value or placeholder
  if (children) return <span>{children}</span>
  const val = ctx.value
  // sentinel __none__ means “no selection” → show placeholder
  if (!val || val === "__none__") {
    return <span className="text-[#85837E]">{placeholder ?? ""}</span>
  }
  return <span className="truncate">{String(val)}</span>
}

const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => {
  const ctx = React.useContext(SelectContext)
  if (!ctx) return null
  return (
    <button
      ref={ref}
      type="button"
      onClick={() => ctx.setOpen(!ctx.open)}
      className={cn(
        "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-[7px] border border-[#3B3A36] bg-[#292824] px-3 py-2 text-sm text-[#F0EFEC] shadow-sm focus:outline-none focus:border-[#4A4944] focus:ring-1 focus:ring-[#4A4944]/30 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 hover:bg-[#232220] transition-colors",
        className
      )}
      aria-haspopup="listbox"
      aria-expanded={ctx.open}
      {...props}
    >
      <span className="flex items-center gap-2 truncate">{children}</span>
      <ChevronDown className={cn("h-4 w-4 shrink-0 text-[#85837E] transition-transform", ctx.open && "rotate-180")} />
    </button>
  )
})
SelectTrigger.displayName = "SelectTrigger"

const SelectContent = React.forwardRef(({ className, children, position, ...props }, ref) => {
  const ctx = React.useContext(SelectContext)
  if (!ctx || !ctx.open) return null
  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 mt-1.5 min-w-full max-h-[280px] overflow-auto rounded-[8px] border border-[#3B3A36] bg-[#292824] p-1 shadow-[0_8px_24px_rgba(0,0,0,0.5)] animate-in fade-in-0 zoom-in-95",
        className
      )}
      role="listbox"
      {...props}
    >
      {children}
    </div>
  )
})
SelectContent.displayName = "SelectContent"

const SelectLabel = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("px-2 py-1.5 text-[11px] font-semibold tracking-widest text-[#85837E]", className)} {...props} />
))
SelectLabel.displayName = "SelectLabel"

const SelectItem = React.forwardRef(({ className, children, value, ...props }, ref) => {
  const ctx = React.useContext(SelectContext)
  if (!ctx) return null
  const active = ctx.value === value
  // also handle __none__ sentinel: if ctx.value is "" treat as __none__? but we use __none__
  return (
    <button
      ref={ref}
      type="button"
      role="option"
      aria-selected={active}
      onClick={() => ctx.setValue(value)}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-[6px] px-2.5 py-2 text-[13px] outline-none transition-colors",
        active
          ? "bg-[#3B3935] text-[#F0EFEC]"
          : "text-[#B7B5B0] hover:bg-[#3B3935] hover:text-[#F0EFEC]",
        className
      )}
      {...props}
    >
      <span className="flex-1 truncate text-left">{children}</span>
      {active && <Check className="h-3.5 w-3.5 shrink-0 text-[#F0EFEC] ml-2" />}
    </button>
  )
})
SelectItem.displayName = "SelectItem"

const SelectSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("-mx-1 my-1 h-px bg-[#3B3A36]", className)} {...props} />
))
SelectSeparator.displayName = "SelectSeparator"

// stubs to keep imports working
const SelectScrollUpButton = () => null
const SelectScrollDownButton = () => null

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}
