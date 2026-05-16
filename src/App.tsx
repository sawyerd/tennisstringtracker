import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { AuthPage } from './pages/AuthPage'
import { HomePage } from './pages/HomePage'
import { AddRacketPage } from './pages/AddRacketPage'
import { StringJobPage } from './pages/StringJobPage'
import { RetireStringPage } from './pages/RetireStringPage'
import { SessionLogPage } from './pages/SessionLogPage'
import { StatsPage } from './pages/StatsPage'

function Spinner() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
    </div>
  )
}

function AppRoutes() {
  const { user, loading, signOut } = useAuth()

  if (loading) return <Spinner />
  if (!user) return <AuthPage />

  return (
    <Routes>
      <Route path="/" element={<HomePage user={user} onSignOut={signOut} />} />
      <Route path="/rackets/new" element={<AddRacketPage user={user} onSignOut={signOut} />} />
      <Route path="/rackets/:id/string" element={<StringJobPage user={user} onSignOut={signOut} />} />
      <Route path="/rackets/:id/retire" element={<RetireStringPage user={user} onSignOut={signOut} />} />
      <Route path="/sessions/log" element={<SessionLogPage user={user} onSignOut={signOut} />} />
      <Route path="/stats" element={<StatsPage user={user} onSignOut={signOut} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
