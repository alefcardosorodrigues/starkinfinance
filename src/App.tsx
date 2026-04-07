import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Session } from '@supabase/supabase-js'
import { lazy, Suspense } from 'react'

// Login pode continuar lazy — raramente acessado após primeiro login
const Login = lazy(() => import('@/features/auth/pages/Login'))

// Páginas principais: import estático para evitar problema de tela preta
// (Suspense + lazy + Framer Motion initial={opacity:0} causam tela preta na 1ª navegação)
import Dashboard from '@/features/dashboard/pages/Dashboard'
import Income from '@/features/income/pages/Income'
import FixedExpenses from '@/features/expenses/pages/FixedExpenses'
import Installments from '@/features/installments/pages/Installments'
import Categories from '@/features/categories/pages/Categories'
import VariableExpenses from '@/features/expenses/pages/VariableExpenses'
import Navigation from '@/components/layout/Navigation'

const Spinner = () => (
  <div className="h-screen w-full flex items-center justify-center bg-background">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
)

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    let previousUserId: string | undefined

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)

      // Limpa o cache quando o usuário desloga ou quando troca de conta
      if (event === 'SIGNED_OUT') {
        import('./main').then(({ queryClient }) => queryClient.clear())
      }

      // Detecta troca de usuário (ex: login em guia anônima refletindo aqui)
      if (session?.user?.id && previousUserId && session.user.id !== previousUserId) {
        import('./main').then(({ queryClient }) => queryClient.clear())
      }

      previousUserId = session?.user?.id
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return <Spinner />
  }

  if (!session) {
    return (
      <Suspense fallback={<Spinner />}>
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
      <main className="flex-1 lg:ml-64 min-h-screen pt-16 lg:pt-0 pb-20 lg:pb-0">
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
