import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Session } from '@supabase/supabase-js'
import { lazy, Suspense } from 'react'

const Login = lazy(() => import('@/features/auth/pages/Login'))
const Dashboard = lazy(() => import('@/features/dashboard/pages/Dashboard'))
const Income = lazy(() => import('@/features/income/pages/Income'))
const FixedExpenses = lazy(() => import('@/features/expenses/pages/FixedExpenses'))
const Installments = lazy(() => import('@/features/installments/pages/Installments'))
const Categories = lazy(() => import('@/features/categories/pages/Categories'))
const VariableExpenses = lazy(() => import('@/features/expenses/pages/VariableExpenses'))
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
      <Suspense fallback={
        <div className="h-screen w-full flex items-center justify-center bg-background">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Navigation />
      <main className="flex-1 md:ml-64 min-h-screen">
        <Suspense fallback={
          <div className="h-screen w-full flex items-center justify-center bg-background">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        }>
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
        </Suspense>
      </main>
    </div>
  )
}

export default App
