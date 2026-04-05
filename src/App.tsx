import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Session } from '@supabase/supabase-js'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import Income from '@/pages/Income'
import FixedExpenses from '@/pages/FixedExpenses'
import Installments from '@/pages/Installments'
import Categories from '@/pages/Categories'
import VariableExpenses from '@/pages/VariableExpenses'
import Navigation from '@/components/layout/Navigation'

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!session) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Navigation />
      <main className="flex-1 md:ml-64 min-h-screen">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/income" element={<Income />} />
          <Route path="/variables" element={<VariableExpenses />} />
          <Route path="/fixed-expenses" element={<FixedExpenses />} />
          <Route path="/installments" element={<Installments />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
