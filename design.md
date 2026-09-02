# Design System — Generic Warm-Neutral Theme

> Version: 1.0 • Style: `new-york` (shadcn) • Stack: Tailwind CSS + `tailwindcss-animate` + `lucide-react` • Fonts: Inter / ui-monospace
> This document describes the full visual language so it can be reused for *any* product (dashboard, editor, game, docs site, etc.). No domain concepts are referenced.

---

## 1. Principles

- **Warm, grounded dark** — no pure black. Surfaces float with subtle warm greys.
- **Content-first** — typography and borders carry hierarchy; color is reserved for state.
- **Consistent density** — 13px base, tight radii, 8px scrollbars, predictable spacing.
- **Theme parity** — every dark token has an automatic light override (no separate design).

---

## 2. Theme & CSS Variables

Defined in `src/index.css` (`@layer base :root`). Tailwind maps them via `tailwind.config.js` (`darkMode: ["class"]`, `colors: hsl(var(--…))`).

### 2.1 Dark (default)

| Token | HSL | Hex | Usage |
|---|---|---|---|
| `--background` | `40 6% 15%` | `#292824` | App shell, sidebar, header |
| `--card` / `--popover` | `30 5% 13%` | `#232220` | Elevated surfaces (popovers, secondary panels) |
| `--spec-main` | — | `#1D1C1A` | Main content canvas (center stage) |
| `--foreground` | `40 15% 94%` | `#F0EFEC` | Primary text |
| `--secondary` | `40 5% 70%` | `#B7B5B0` | Secondary text / icons |
| `--muted` | `30 2% 51%` | `#85837E` | Tertiary / placeholder / muted icons |
| `--spec-text-very-muted` | — | `#66645F` | Captions, micro-labels |
| `--border` | `45 4% 22%` | `#3B3A36` | Default border / divider |
| `--input` | `45 3% 28%` | `#4A4944` | Strong border (focus, input) |
| `--spec-checkbox` | — | `#5A5852` | Checkbox / scrollbar hover |
| `--primary` | `142 76% 36%` | `#22C55E` | Success / live / selected state |
|  `  --spec-green-bg` | — | `rgba(34,197,94,0.08)` | Success wash |
|  `  --spec-green-border` | — | `#16803A` | Success border |
| `--accent` | `212 72% 59%` | `#4A90E2` | Interactive accent (links, focus ring alternative) |
| `--destructive` | `0 84% 60%` | `#EF4444` | Error / delete |
| `--spec-yellow` | — | `#EAB308` | Warning / highlight |
| `--ring` | `142 76% 36%` | `#22C55E` (same as primary) | Focus ring |

Spec aliases in `:root` (`--spec-bg`, `--spec-main`, `--spec-secondary`, `--spec-border`, `--spec-border-strong`, `--spec-text`, `--spec-text-secondary`, `--spec-text-muted`, `--spec-green`, `--spec-blue`, `--spec-red`, `--spec-yellow`) mirror the table for direct hex use in arbitrary values like `bg-[#1D1C1A]`.

### 2.2 Light

`html.light` flips the palette:

- Surfaces: `background #FAFAF9`, `card/popover #FFFFFF`, `secondary #F5F5F4`, `active #E7E5E4`
- Borders: `#E7E5E4` (default), `#D6D3D1` (strong)
- Text: `#1C1917` (primary), `#57534E` (secondary), `#78716C` (muted), `#A8A29E` (very muted), `#44403C` (code)
- Scrollbar thumb: `#D6D3D1` → hover `#A8A29E`
- All dark utilities are mapped via overrides: `html.light .bg-[#1D1C1A] { background:#FAFAF9 !important }` etc., plus `border-[#3B3A36] → #E7E5E4`, `text-[#F0EFEC] → #1C1917` … (full mapping in `src/index.css` 142–205). Toggle via `document.documentElement.classList.add("light"|"dark")` + `color-scheme`.

### 2.3 Selection & Scrollbars

- `::selection` `rgba(34,197,94,0.15)`
- `::-webkit-scrollbar` `8px`, track `transparent` (data-grid track `#1D1C1A` / light `#FAFAF9`), thumb `#4A4944` → hover `#5A5852`, `border-radius 4px`.

---

## 3. Typography

**Import:** `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');` + optional `GT America` (400/500) from `docs.convex.dev`.

- **Base:** `html { font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; font-size: 13px; line-height: 1.5; font-weight: 400; }`
- **Headings** `h1,h2,h3,.font-display` → `Inter 600`
- **Mono** `code,pre,.font-mono` → `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace`
- **Scale (common):** `h1 22–28px/600`, `h2 15px/600`, `h3 14px/600`, `body 13px`, `caption 11px` (`tracking-widest`, `text-[#85837E]`), `micro 10px` (`tracking-[0.14em]`, `text-[#66645F]`)
- **Smoothing:** `-webkit-font-smoothing: antialiased`, `font-feature-settings: "rlig" 1, "calt" 1`

---

## 4. Radii, Spacing & Layout

**Tailwind config** `tailwind.config.js:7`:
```js
borderRadius: { lg: 'var(--radius)', md: 'calc(var(--radius) - 2px)', sm: 'calc(var(--radius) - 4px)' }
```
- `--radius: 6px` (`:root`) → `lg 6px`, `md 4px`, `sm 2px`.

**In practice:**
- Cards / panels: `rounded-[7px]` to `rounded-[12px]` (most: `rounded-[9px]` / `rounded-[8px]`)
- Inputs / triggers: `rounded-[6px]` / `rounded-[7px]`
- Pills / badges: `rounded-full` or `rounded-[6px]`
- Buttons: `rounded-[6px]` / `rounded-[7px]` (icon `rounded-[6px]`)

**Shell sizes:**
- Header: `h-[64px]` `px-[18px]` `border-b border-[#3B3A36] bg-[#292824]`
- Primary nav: `w-[168px]` expanded / `w-[56px]` collapsed (`transition-all 150ms`), `border-r border-[#3B3A36] bg-[#292824]`
- Secondary docs nav: `w-[220px]` `hidden md:flex` `bg-[#1D1C1A] border-r border-[#3B3A36]`
- Main canvas: `bg-[#1D1C1A]` `flex-1 overflow-auto` `max-w-[860–960px] mx-auto px-6 md:px-8 py-8`
- Divider: `h-px bg-[#3B3A36] mx-2`
- Grid gaps: `gap-3` / `gap-4` inside cards.

**Shadows:**
- Dropdown: `shadow-[0_8px_24px_rgba(0,0,0,0.5)]`
- Modal / card: `shadow-[0_12px_40px_rgba(0,0,0,0.5)]`
- Button `shadow` only via `buttonVariants` (primary).

---

## 5. Tailwind & Aliases

**`components.json`:**
```json
{ "style": "new-york", "tailwind": { "config": "tailwind.config.js", "css": "src/index.css", "baseColor": "neutral", "cssVariables": true }, "aliases": { "components": "@/components", "utils": "@/lib/utils", "ui": "@/components/ui", "lib": "@/lib", "hooks": "@/hooks" }, "iconLibrary": "lucide" }
```

**`tailwind.config.js`:**
- `darkMode: ["class"]`, `content: ["./index.html","./src/**/*.{ts,tsx,js,jsx}"]`
- `theme.extend.colors` → maps `background/foreground/card/popover/primary/secondary/muted/accent/destructive/border/input/ring/chart` to `hsl(var(--…))`
- `animation: { 'spin-slow': 'spin 3s linear infinite' }`
- `plugins: [require("tailwindcss-animate")]`

**`src/lib/utils.js`:**
```js
export function cn(...inputs){ return twMerge(clsx(inputs)) }
```

---

## 6. Components

### 6.1 Button `src/components/ui/button.jsx`

Uses `cva` + `Slot`:
- Base: `inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50`
- Variants: `default` (`bg-primary text-primary-foreground shadow hover:bg-primary/90`), `destructive` (`bg-destructive`), `outline` (`border border-input bg-background shadow-sm hover:bg-accent`), `secondary` (`bg-secondary`), `ghost` (`hover:bg-accent`), `link` (`text-primary underline-offset-4`)
- Sizes: `default h-9 px-4`, `sm h-8 px-3 text-xs`, `lg h-10 px-8`, `icon h-9 w-9`
- In-app overrides: most buttons use arbitrary values directly (`h-9 px-3.5 bg-[#292824] border border-[#3B3A36] text-[#B7B5B0] hover:bg-[#232220] hover:text-[#F0EFEC]`, primary action `bg-[#F0EFEC] text-[#1D1C1A] hover:bg-white`, accent `bg-[#4A90E2] text-white` if needed).

### 6.2 Card `src/components/ui/card.jsx`

- `Card`: `rounded-xl border bg-card text-card-foreground shadow`
- `CardHeader`: `flex flex-col space-y-1.5 p-6`
- `CardTitle`: `font-semibold leading-none tracking-tight`
- `CardDescription`: `text-sm text-muted-foreground`
- `CardContent`: `p-6 pt-0`
- App pattern: `SectionCard` in settings uses `border border-[#3B3A36] rounded-[10px] bg-[#292824] overflow-hidden` with header `px-5 py-4 border-b border-[#3B3A36]` + `w-9 h-9 rounded-[8px] bg-[#1D1C1A] border border-[#3B3A36]` icon box, body `p-5 space-y-5`.

### 6.3 Dropdown / Select `src/components/ui/select.jsx` (custom, not Radix)

Decks's dropdown is fully custom (warm-neutral, no native `<select>`):

**API (kept Radix-compatible):**
```jsx
<Select value={v} onValueChange={setV}>
  <SelectTrigger className="h-9 w-[160px] bg-[#292824] border-[#3B3A36]"><SelectValue placeholder="Select" /></SelectTrigger>
  <SelectContent className="bg-[#292824] border-[#3B3A36]">
    <SelectItem value="a">A</SelectItem>
  </SelectContent>
</Select>
```

**Implementation:**
- `SelectContext` holds `value`, `setValue`, `open`, `setOpen`; `rootRef` + `mousedown` outside + `Escape` close.
- `SelectTrigger`: `button` `flex h-9 w-full items-center justify-between rounded-[7px] border border-[#3B3A36] bg-[#292824] px-3 text-sm text-[#F0EFEC] focus:border-[#4A4944] focus:ring-1 focus:ring-[#4A4944]/30 hover:bg-[#232220]` + `ChevronDown` rotates 180 when open.
- `SelectContent`: `absolute z-50 mt-1.5 min-w-full max-h-[280px] overflow-auto rounded-[8px] border border-[#3B3A36] bg-[#292824] p-1 shadow-[0_8px_24px_rgba(0,0,0,0.5)]`, `role="listbox"`.
- `SelectItem`: `button role="option"` `flex w-full rounded-[6px] px-2.5 py-2 text-[13px]` — active `bg-[#3B3935] text-[#F0EFEC]` else `text-[#B7B5B0] hover:bg-[#3B3935] hover:text-[#F0EFEC]` + `Check` on active. Supports sentinel `__none__` (shows placeholder).
- `SelectLabel`: `px-2 py-1.5 text-[11px] font-semibold tracking-widest text-[#85837E]`
- `SelectSeparator`: `h-px bg-[#3B3A36]`

**Usage notes:** Always provide `value` as string; use `__none__` for “no selection” to avoid Radix empty-string restriction. `SelectValue` shows `placeholder` when `!value || value==="__none__"`.

### 6.4 Input

Pattern:
```jsx
<input className="h-9 w-full px-3 bg-[#292824] border border-[#3B3A36] rounded-[7px] text-[13px] font-mono text-[#F0EFEC] placeholder:text-[#66645F] focus:outline-none focus:border-[#4A4944] focus:ring-1 focus:ring-[#4A4944]/30" />
```
- Search variant: left icon `absolute left-2.5` + `pl-8`, right `Clear` button.
- Mono inputs use `font-mono` for codes/ids.

### 6.5 Toggle / Switch

Used in settings:
```jsx
<button className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${checked?"bg-[#4A90E2]":"bg-[#3B3A36]"}`}>
  <span className={`h-3.5 w-3.5 rounded-full bg-white transition-transform ${checked?"translate-x-4":"translate-x-0.5"}`} />
</button>
```
- `aria-pressed`, `disabled` dims `opacity-50`.

### 6.6 Navigation

**Primary nav (`LeftNav`):**
- Container `w-[168px] / w-[56px]` collapsed, `bg-[#292824] border-r border-[#3B3A36]`, `py-3 px-2 space-y-0.5`
- Item: `h-9 rounded-[6px] text-[13px] font-medium` — active `bg-[#3B3935] text-[#F0EFEC]` else `text-[#B7B5B0] hover:bg-[#232220] hover:text-[#F0EFEC]`; icon `18px strokeWidth 1.8`; collapsed shows only icon + tooltip via `title`.
- Section header: `text-[10px] tracking-[0.14em] text-[#66645F]` + `h-px bg-[#3B3A36]/60`.
- Group card: `rounded-[8px] border` active `bg-[#1D1C1A] border-[#3B3A36]` else transparent.
- Collapse toggle bottom: `border-t border-[#3B3A36]/50 p-2`.

**Secondary docs nav (`ApiDocsSidebar`):**
- `w-[220px] hidden md:flex bg-[#1D1C1A] border-r border-[#3B3A36]`
- Header `p-4 border-b`, `TABLE` `Select` `h-8 w-full bg-[#292824] border-[#3B3A36] font-mono 13px`.
- Groups `px-2 mb-1.5 text-[11px] tracking-widest text-[#66645F]`, items `h-8 rounded-[6px] px-2.5` active same as primary nav, plus `ON THIS PAGE` list.

### 6.7 Header (`TopBar`)

- `h-[64px] bg-[#292824] border-b border-[#3B3A36] px-[18px] flex justify-between`
- Left: logo + app name `14px medium #F0EFEC` + `/` `14px #66645F` + context `13px medium`
- Status pill (optional): `h-[42px] px-4 bg-[rgba(34,197,94,0.08)] border border-[#16803A] rounded-[22px]`
- Search: `h-10 w-[240px] bg-[#232220] border border-[#3B3A36] rounded-[6px] px-3` + `Search` icon `#85837E` + slash badge `w-5 h-5 bg-[#292824] border border-[#3B3A36] rounded-[4px]`
- Actions: `h-8 px-3 border border-[#4A4944] rounded-[6px] text-[13px] medium text-[#B7B5B0] hover:bg-[#3B3935]` / primary `bg-[#F0EFEC] text-[#1D1C1A]`

### 6.8 Code Block (`ApiCodeBlock` / Monaco)

Wrapper: `rounded-[7px] border border-[#3B3A36] bg-[#1D1C1A] overflow-hidden` with dynamic height `Math.min(maxHeight, Math.max(minHeight, lines*lineHeight+24))`.

`@monaco-editor/react` `Editor` options:
- `readOnly: !editable` / `domReadOnly`, `minimap:false`, `lineNumbers: editable?"on":"off"`, `folding:editable`, `scrollBeyondLastLine:false`, `wordWrap:"on"`, `fontSize` from settings (13), `fontFamily: "Geist Mono, JetBrains Mono, ui-monospace, monospace"`, `padding:{top:12,bottom:12}`, `automaticLayout:true`, `scrollbar: {vertical:auto,horizontal:auto,size:6}`, `renderLineHighlight: editable?"line":"none"`, `contextmenu: editable`.

Theme: `MONACO_THEMES` (51 entries: `deck-dark #1D1C1A`, `tokyo-night`, `nord`, `dracula`, `catppuccin`, etc.) defined via `monaco.editor.defineTheme` with `base vs/vs-dark`; synced from `localStorage deck:settings.editor.monacoTheme` + `deck:settings:update` event + `storage` interval. Languages: `shell` (cURL), `javascript` (Node), `python`, `json`.

---

## 7. Iconography

- Library: `lucide-react` (also `react-icons` available)
- Sizes: `18px` nav, `16px` inline, `14px` buttons, `12px` micro, `11px` badges
- Stroke: `1.8` nav, `1.9` for emphasis
- Color follows text: `#B7B5B0` default, `#F0EFEC` active, `#85837E` muted, `#66645F` disabled

---

## 8. Motion

- `transition-colors` / `transition-all 150ms` for nav collapse
- `transition-transform` for chevron rotate / toggle knob
- Dropdown `animate-in fade-in-0 zoom-in-95` (via `tailwindcss-animate`)
- `animate-pulse` for live dot, `animate-spin` for loaders
- `spin-slow: spin 3s linear` available

---

## 9. States

- **Hover:** `hover:bg-[#232220]` / `hover:bg-[#3B3935]` + `hover:text-[#F0EFEC]` + `hover:border-[#4A4944]`
- **Active/selected:** `bg-[#3B3935] text-[#F0EFEC] border-[#3B3A36]` (nav, dropdown item)
- **Focus:** `focus:outline-none focus:border-[#4A4944] focus:ring-1 focus:ring-[#4A4944]/30` (inputs/selects)
- **Disabled:** `disabled:opacity-50 cursor-not-allowed`
- **Error:** `border-[#EF4444]/30 text-[#EF4444]` + `bg-[#2a1a1a]` wash

---

## 10. Reuse Checklist (any app)

1. Copy `src/index.css` variables + `html.light` overrides, `tailwind.config.js` colors/radii, `components.json` aliases.
2. Use `cn` from `src/lib/utils.js`.
3. Import `Inter` + mono stack; set `html {font-size:13px}`.
4. Build shell: `TopBar (64) + LeftNav (168→56) + [SecondaryNav 220] + Main (max-w 860–960, p-6/8, bg #1D1C1A)`.
5. Use `Select` from `src/components/ui/select.jsx` for every dropdown (supports `__none__` sentinel); `Button` variants and `Card` as base.
6. Use `ApiCodeBlock` pattern for any code display to inherit editor theme + font size.
7. Keep light overrides if theming needed; toggle via `document.documentElement.classList`.
8. Keep scrollbar / selection styles for polish.

No product-specific terminology is required — replace labels (e.g., “TABLE” → “BOARD”, “SELECT” → “FILTER”) and keep tokens.
