#!/usr/bin/env node
// deckdb — local-first PostgreSQL IDE.
// Launches the unified server (API + built frontend) and opens it in your browser.
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { exec } from "node:child_process"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const root = path.join(__dirname, "..")

function readVersion() {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"))
    return pkg.version ?? "0.0.0"
  } catch {
    return "0.0.0"
  }
}

function printHelp() {
  console.log(`deckdb v${readVersion()} — local-first PostgreSQL IDE

Usage: deckdb [options]

Options:
  -p, --port <n>   Port to serve on (default: 3001, or $PORT)
  --no-open        Don't auto-open the browser
  -v, --version    Print version and exit
  -h, --help       Show this help and exit

Examples:
  deckdb
  deckdb --port 4000
  deckdb --no-open
  PORT=4000 deckdb`)
}

const args = process.argv.slice(2)
let port = process.env.PORT ? Number(process.env.PORT) : 3001
let open = true

for (let i = 0; i < args.length; i++) {
  const a = args[i]
  if (a === "--help" || a === "-h") {
    printHelp()
    process.exit(0)
  } else if (a === "--version" || a === "-v") {
    console.log(readVersion())
    process.exit(0)
  } else if (a === "--port" || a === "-p") {
    port = Number(args[++i])
  } else if (a.startsWith("--port=")) {
    port = Number(a.slice("--port=".length))
  } else if (a === "--no-open") {
    open = false
  } else {
    console.error(`Unknown argument: ${a}\nRun 'deckdb --help' for usage.`)
    process.exit(1)
  }
}

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error(`Invalid port: ${port}. Use an integer between 1 and 65535.`)
  process.exit(1)
}

process.env.PORT = String(port)

const indexHtml = path.join(root, "dist", "index.html")
if (!fs.existsSync(indexHtml)) {
  console.warn("[deckdb] WARNING: frontend build not found (dist/). API will run without the UI.")
  console.warn("[deckdb] Run `npm run build` inside the package to generate it.")
}

await import("../server/index.js")

const url = `http://localhost:${port}`
console.log(`[deckdb] Deck is live at ${url}`)

if (open) {
  const cmd =
    process.platform === "win32"
      ? `start "" "${url}"`
      : process.platform === "darwin"
        ? `open "${url}"`
        : `xdg-open "${url}"`
  exec(cmd, () => {})
}
