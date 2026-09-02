import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { ConnectionProvider } from "@/context/ConnectionContext"
import { I18nProvider } from "@/context/I18nContext"
import { ThemeProvider, useTheme } from "@/context/ThemeContext"
import EditorPage from "@/pages/EditorPage"
import HealthPage from "@/pages/HealthPage"
import LogsPage from "@/pages/LogsPage"
import SqlPage from "@/pages/SqlPage"
import SchemaPage from "@/pages/SchemaPage"
import ApiOverview from "@/pages/api/ApiOverview"
import ApiEndpoints from "@/pages/api/ApiEndpoints"
import ApiExamples from "@/pages/api/ApiExamples"
import ApiPlayground from "@/pages/api/ApiPlayground"
import ConnectPage from "@/pages/ConnectPage"
import SettingsPage from "@/pages/SettingsPage"
import HistoryPage from "@/pages/HistoryPage"
import RequireConnection from "@/components/RequireConnection"
import { Toaster } from "sonner"

function AppInner() {
  const { effective } = useTheme()
  return (
    <>
      <ConnectionProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/connect" element={<ConnectPage />} />
            <Route
              path="/"
              element={
                <RequireConnection>
                  <EditorPage />
                </RequireConnection>
              }
            />
            <Route path="/health" element={<HealthPage />} />
            <Route path="/logs" element={<LogsPage />} />
            <Route path="/sql" element={<SqlPage />} />
            <Route path="/schema" element={<SchemaPage />} />
            <Route path="/api" element={<ApiOverview />} />
            <Route path="/api/endpoints" element={<ApiEndpoints />} />
            <Route path="/api/examples" element={<ApiExamples />} />
            <Route path="/api/playground" element={<ApiPlayground />} />
            <Route path="/api/*" element={<Navigate to="/api" replace />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="*" element={<Navigate to="/connect" replace />} />
          </Routes>
        </BrowserRouter>
      </ConnectionProvider>
      <Toaster theme={effective === "light" ? "light" : "dark"} position="top-right" richColors closeButton />
    </>
  )
}

export default function App() {
  return (
    <I18nProvider>
      <ThemeProvider>
        <AppInner />
      </ThemeProvider>
    </I18nProvider>
  )
}
