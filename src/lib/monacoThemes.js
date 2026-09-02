// A lot of Monaco themes for Deck — register via monaco.editor.defineTheme
// Each theme inherits from vs/vs-dark/hc-black and overrides editor background + core colors
// Add more here to extend the picker

export const MONACO_THEMES = [
  { id: "vs-dark", label: "VS Dark", base: "vs-dark" },
  { id: "vs", label: "VS Light", base: "vs" },
  { id: "hc-black", label: "High Contrast Dark", base: "hc-black" },
  { id: "hc-light", label: "High Contrast Light", base: "hc-light" },

  { id: "deck-dark", label: "Deck Dark", base: "vs-dark", colors: { "editor.background": "#1D1C1A", "editor.foreground": "#F0EFEC", "editorGutter.background": "#1D1C1A", "editorLineNumber.foreground": "#6b6a67", "editorLineNumber.activeForeground": "#F0EFEC", "editorCursor.foreground": "#F0EFEC" } },
  { id: "deck-vercel", label: "Vercel", base: "vs-dark", colors: { "editor.background": "#000000", "editor.foreground": "#EAEAEA", "editorGutter.background": "#000000", "editorLineNumber.foreground": "#52525b", "editorLineNumber.activeForeground": "#FAFAFA", "editorCursor.foreground": "#FFFFFF", "editor.selectionBackground": "#333333", "editor.inactiveSelectionBackground": "#222222", "editor.lineHighlightBackground": "#111111", "editorLineHighlightBorder": "#00000000", "scrollbar.shadow": "#00000000", "scrollbarSlider.background": "#26262680", "scrollbarSlider.hoverBackground": "#333333" } },
  { id: "deck-pink", label: "Pink", base: "vs-dark", colors: { "editor.background": "#1a0a14", "editor.foreground": "#fce7f3", "editorGutter.background": "#1a0a14", "editorLineNumber.foreground": "#9d5a7f", "editorLineNumber.activeForeground": "#fce7f3", "editorCursor.foreground": "#f472b6", "editor.selectionBackground": "#4d1a3a", "editor.inactiveSelectionBackground": "#3d1430", "editor.lineHighlightBackground": "#2a0f1f", "editorLineHighlightBorder": "#00000000", "scrollbar.shadow": "#00000000", "scrollbarSlider.background": "#4d1a3a80", "scrollbarSlider.hoverBackground": "#5a1f45" } },
  { id: "deck-supabase", label: "Supabase", base: "vs-dark", colors: { "editor.background": "#0a0a0a", "editor.foreground": "#ededed", "editorGutter.background": "#0a0a0a", "editorLineNumber.foreground": "#5a5a5a", "editorLineNumber.activeForeground": "#ededed", "editorCursor.foreground": "#3ECF8E", "editor.selectionBackground": "#1a3329", "editor.inactiveSelectionBackground": "#143322", "editor.lineHighlightBackground": "#111111", "editorLineHighlightBorder": "#00000000", "scrollbar.shadow": "#00000000", "scrollbarSlider.background": "#2a2a2a80", "scrollbarSlider.hoverBackground": "#3a3a3a" } },
  { id: "deck-claude", label: "Claude Code", base: "vs-dark", colors: { "editor.background": "#14120f", "editor.foreground": "#e8ddd0", "editorGutter.background": "#14120f", "editorLineNumber.foreground": "#6b5a4a", "editorLineNumber.activeForeground": "#e8ddd0", "editorCursor.foreground": "#c9a87c", "editor.selectionBackground": "#3a2a1a", "editor.inactiveSelectionBackground": "#2e2218", "editor.lineHighlightBackground": "#1e1915", "editorLineHighlightBorder": "#00000000", "scrollbar.shadow": "#00000000", "scrollbarSlider.background": "#3a2a1a80", "scrollbarSlider.hoverBackground": "#4a3320" } },
  { id: "deck-tokyo-night", label: "Tokyo Night", base: "vs-dark", colors: { "editor.background": "#1a1b26", "editor.foreground": "#c0caf5" } },
  { id: "deck-tokyo-storm", label: "Tokyo Storm", base: "vs-dark", colors: { "editor.background": "#24283b", "editor.foreground": "#c0caf5" } },
  { id: "deck-tokyo-light", label: "Tokyo Light", base: "vs", colors: { "editor.background": "#d5d6db", "editor.foreground": "#343b58" } },
  { id: "deck-nord", label: "Nord", base: "vs-dark", colors: { "editor.background": "#2e3440", "editor.foreground": "#eceff4" } },
  { id: "deck-nord-light", label: "Nord Light", base: "vs", colors: { "editor.background": "#eceff4", "editor.foreground": "#2e3440" } },
  { id: "deck-dracula", label: "Dracula", base: "vs-dark", colors: { "editor.background": "#282a36", "editor.foreground": "#f8f8f2" } },
  { id: "deck-monokai", label: "Monokai", base: "vs-dark", colors: { "editor.background": "#272822", "editor.foreground": "#f8f8f2" } },
  { id: "deck-monokai-pro", label: "Monokai Pro", base: "vs-dark", colors: { "editor.background": "#2d2a2e", "editor.foreground": "#fcfcfa" } },
  { id: "deck-solarized-dark", label: "Solarized Dark", base: "vs-dark", colors: { "editor.background": "#002b36", "editor.foreground": "#839496" } },
  { id: "deck-solarized-light", label: "Solarized Light", base: "vs", colors: { "editor.background": "#fdf6e3", "editor.foreground": "#657b83" } },
  { id: "deck-ayu-dark", label: "Ayu Dark", base: "vs-dark", colors: { "editor.background": "#0a0e14", "editor.foreground": "#b3b1ad" } },
  { id: "deck-ayu-light", label: "Ayu Light", base: "vs", colors: { "editor.background": "#fafafa", "editor.foreground": "#5c6773" } },
  { id: "deck-ayu-mirage", label: "Ayu Mirage", base: "vs-dark", colors: { "editor.background": "#202734", "editor.foreground": "#cbccc6" } },
  { id: "deck-gruvbox-dark", label: "Gruvbox Dark", base: "vs-dark", colors: { "editor.background": "#282828", "editor.foreground": "#ebdbb2" } },
  { id: "deck-gruvbox-light", label: "Gruvbox Light", base: "vs", colors: { "editor.background": "#fbf1c7", "editor.foreground": "#3c3836" } },
  { id: "deck-one-dark-pro", label: "One Dark Pro", base: "vs-dark", colors: { "editor.background": "#282c34", "editor.foreground": "#abb2bf" } },
  { id: "deck-github-dark", label: "GitHub Dark", base: "vs-dark", colors: { "editor.background": "#0d1117", "editor.foreground": "#c9d1d9" } },
  { id: "deck-github-light", label: "GitHub Light", base: "vs", colors: { "editor.background": "#ffffff", "editor.foreground": "#24292f" } },
  { id: "deck-material-darker", label: "Material Darker", base: "vs-dark", colors: { "editor.background": "#212121", "editor.foreground": "#eeffff" } },
  { id: "deck-material-palenight", label: "Material Palenight", base: "vs-dark", colors: { "editor.background": "#292d3e", "editor.foreground": "#a6accd" } },
  { id: "deck-material-lighter", label: "Material Lighter", base: "vs", colors: { "editor.background": "#fafafa", "editor.foreground": "#546e7a" } },
  { id: "deck-night-owl", label: "Night Owl", base: "vs-dark", colors: { "editor.background": "#011627", "editor.foreground": "#d6deeb" } },
  { id: "deck-cobalt", label: "Cobalt", base: "vs-dark", colors: { "editor.background": "#193549", "editor.foreground": "#ffffff" } },
  { id: "deck-synthwave", label: "SynthWave '84", base: "vs-dark", colors: { "editor.background": "#262335", "editor.foreground": "#ffffff" } },
  { id: "deck-atom-one-dark", label: "Atom One Dark", base: "vs-dark", colors: { "editor.background": "#282c34", "editor.foreground": "#abb2bf" } },
  { id: "deck-atom-one-light", label: "Atom One Light", base: "vs", colors: { "editor.background": "#fafafa", "editor.foreground": "#383a42" } },
  { id: "deck-catppuccin-mocha", label: "Catppuccin Mocha", base: "vs-dark", colors: { "editor.background": "#1e1e2e", "editor.foreground": "#cdd6f4" } },
  { id: "deck-catppuccin-macchiato", label: "Catppuccin Macchiato", base: "vs-dark", colors: { "editor.background": "#24273a", "editor.foreground": "#cad3f5" } },
  { id: "deck-catppuccin-frappe", label: "Catppuccin Frappé", base: "vs-dark", colors: { "editor.background": "#303446", "editor.foreground": "#c6d0f5" } },
  { id: "deck-catppuccin-latte", label: "Catppuccin Latte", base: "vs", colors: { "editor.background": "#eff1f5", "editor.foreground": "#4c4f69" } },
  { id: "deck-rose-pine", label: "Rosé Pine", base: "vs-dark", colors: { "editor.background": "#191724", "editor.foreground": "#e0def4" } },
  { id: "deck-rose-pine-moon", label: "Rosé Pine Moon", base: "vs-dark", colors: { "editor.background": "#232136", "editor.foreground": "#e0def4" } },
  { id: "deck-rose-pine-dawn", label: "Rosé Pine Dawn", base: "vs", colors: { "editor.background": "#faf4ed", "editor.foreground": "#575279" } },
  { id: "deck-everforest-dark", label: "Everforest Dark", base: "vs-dark", colors: { "editor.background": "#2d353b", "editor.foreground": "#d3c6aa" } },
  { id: "deck-everforest-light", label: "Everforest Light", base: "vs", colors: { "editor.background": "#fdf6e3", "editor.foreground": "#5c6a72" } },
  { id: "deck-kanagawa", label: "Kanagawa", base: "vs-dark", colors: { "editor.background": "#1f1f28", "editor.foreground": "#dcd7ba" } },
  { id: "deck-oxocarbon", label: "Oxocarbon", base: "vs-dark", colors: { "editor.background": "#161616", "editor.foreground": "#f2f4f8" } },
  { id: "deck-flexoki-dark", label: "Flexoki Dark", base: "vs-dark", colors: { "editor.background": "#100f0f", "editor.foreground": "#cecdc3" } },
  { id: "deck-flexoki-light", label: "Flexoki Light", base: "vs", colors: { "editor.background": "#fffcf0", "editor.foreground": "#100f0f" } },
  { id: "deck-horizon", label: "Horizon", base: "vs-dark", colors: { "editor.background": "#1c1e26", "editor.foreground": "#e0e1e8" } },
  { id: "deck-shades-purple", label: "Shades of Purple", base: "vs-dark", colors: { "editor.background": "#2d2b55", "editor.foreground": "#ffffff" } },
  { id: "deck-blueberry", label: "Blueberry", base: "vs-dark", colors: { "editor.background": "#242938", "editor.foreground": "#c7d1e0" } },
  { id: "deck-firewatch", label: "Firewatch", base: "vs-dark", colors: { "editor.background": "#1e2a3a", "editor.foreground": "#d0d4e6" } },
  { id: "deck-outrun", label: "Outrun", base: "vs-dark", colors: { "editor.background": "#00002a", "editor.foreground": "#ffccff" } },
  { id: "deck-plain-light", label: "Plain Light", base: "vs", colors: { "editor.background": "#ffffff", "editor.foreground": "#000000" } },
  { id: "deck-plain-dark", label: "Plain Dark", base: "vs-dark", colors: { "editor.background": "#000000", "editor.foreground": "#ffffff" } },
]

export const MONACO_THEME_IDS = MONACO_THEMES.map(t => t.id)

// helper to get label
export function getThemeLabel(id) {
  return MONACO_THEMES.find(t => t.id === id)?.label ?? id
}

// helper to get background for preview dot
export function getThemeBg(id) {
  const t = MONACO_THEMES.find(x => x.id === id)
  return t?.colors?.["editor.background"] ?? (t?.base === "vs" || t?.base === "hc-light" ? "#ffffff" : "#1e1e1e")
}
