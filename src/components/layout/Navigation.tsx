import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'
import { 
  TrendingUp, 
  Tags, 
  LogOut, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Calendar,
  CheckSquare,
  CreditCard,
  User,
  Receipt,
  LayoutDashboard,
  ChevronDown,
  X
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { queryClient } from '@/main'
import { useMonth } from '@/contexts/MonthContext'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Entradas', icon: TrendingUp, href: '/income' },
  { label: 'Variáveis', icon: Receipt, href: '/variables' },
  { label: 'Fixos', icon: CheckSquare, href: '/fixed-expenses' },
  { label: 'Parcelas', icon: CreditCard, href: '/installments' },
  { label: 'Categorias', icon: Tags, href: '/categories' },
]

const MONTHS = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
]

export default function Navigation() {
  const location = useLocation()
  const navigate = useNavigate()
  const { selectedMonth, selectedYear, setSelectedMonth, prevYear, nextYear } = useMonth()
  const [showMobileCalendar, setShowMobileCalendar] = useState(false)

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
        
      if (error) return { email: user.email, display_name: user.email?.split('@')[0] }
      return data
    }
  })

  const handleLogout = async () => {
    await supabase.auth.signOut()
    queryClient.clear()
    navigate('/login', { replace: true })
  }

  const currentMonthLabel = MONTHS[selectedMonth]

  return (
    <>
      {/* ─── DESKTOP SIDEBAR (lg+) ─── */}
      <nav className="hidden lg:flex fixed left-0 top-0 h-screen w-64 glass border-r border-white/5 z-50 flex-col p-4">
        {/* Brand */}
        <div className="flex items-center gap-3 mb-10 px-2 shrink-0">
          <div className="w-10 h-10 rounded-md bg-primary-gradient flex items-center justify-center shadow-neon-primary shrink-0">
            <Sparkles className="text-background w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight">Starkin</h1>
            <p className="text-[10px] font-bold text-white/40 tracking-[0.2em] uppercase">Finance</p>
          </div>
        </div>

        {/* Main Nav */}
        <div className="space-y-2 mb-10 shrink-0">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.href}
                to={item.href}
                className={clsx(
                  "relative flex items-center gap-4 px-4 py-3 rounded-md transition-all duration-300 group",
                  isActive ? "text-primary" : "text-white/40 hover:text-white"
                )}
              >
                <item.icon className={clsx("w-6 h-6 shrink-0", isActive && "drop-shadow-[0_0_8px_rgba(173,198,255,0.5)]")} />
                <span className="font-bold text-sm tracking-wide">{item.label}</span>
                
                {isActive && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 bg-primary/10 rounded-md -z-10 border border-primary/20"
                  />
                )}
              </Link>
            )
          })}
        </div>

        {/* Month/Year Selector */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="mb-4">
            <span className="label-architectural block mb-2 px-2">PERÍODO</span>
            <div className="flex items-center justify-between px-2 bg-surface-container-low rounded-md py-1 border border-white/5">
              <button onClick={prevYear} className="p-1 hover:text-primary transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-extrabold tracking-widest text-primary">{selectedYear}</span>
              <button onClick={nextYear} className="p-1 hover:text-primary transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 px-1">
            {MONTHS.map((month, index) => {
              const isSelected = selectedMonth === index
              return (
                <button
                  key={month}
                  onClick={() => setSelectedMonth(index)}
                  className={clsx(
                    "py-2 rounded-md transition-all duration-300 text-[10px] font-bold uppercase tracking-tighter border",
                    isSelected 
                      ? "bg-primary/20 border-primary/40 text-primary shadow-neon-primary" 
                      : "bg-transparent border-transparent text-white/20 hover:text-white/60 hover:border-white/5"
                  )}
                >
                  {month}
                </button>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto space-y-2 shrink-0">
          <div className="flex items-center gap-4 px-4 py-3 rounded-lg bg-surface-container-low border border-white/5 mx-1">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/20 shrink-0 shadow-neon-primary">
              <User className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{profile?.display_name || 'Usuário'}</p>
              <p className="text-[10px] font-bold text-white/30 truncate uppercase tracking-tighter">
                {profile?.email}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-md text-white/40 hover:text-tertiary transition-all group"
          >
            <LogOut className="w-6 h-6 shrink-0" />
            <span className="font-bold text-sm tracking-wide">Desconectar</span>
          </button>
        </div>
      </nav>

      {/* ─── MOBILE HEADER (< lg) ─── */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 glass border-b border-white/5">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-primary-gradient flex items-center justify-center shadow-neon-primary">
            <Sparkles className="text-background w-4 h-4" />
          </div>
          <span className="text-sm font-extrabold tracking-tight">Starkin</span>
        </div>

        {/* Período selector trigger */}
        <button
          onClick={() => setShowMobileCalendar(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-low border border-white/10 text-primary"
        >
          <Calendar className="w-4 h-4" />
          <span className="text-xs font-black tracking-widest uppercase">
            {currentMonthLabel} {selectedYear}
          </span>
          <ChevronDown className="w-3 h-3 text-white/40" />
        </button>

        {/* User avatar / logout */}
        <button
          onClick={handleLogout}
          className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/20"
        >
          <User className="w-4 h-4" />
        </button>
      </header>

      {/* ─── MOBILE CALENDAR SHEET ─── */}
      <AnimatePresence>
        {showMobileCalendar && (
          <div className="lg:hidden fixed inset-0 z-[60] flex flex-col justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileCalendar(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            {/* Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="relative bg-surface-container-high rounded-t-3xl border-t border-white/10 p-6 pb-10"
            >
              {/* Handle */}
              <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-6" />

              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-extrabold">Selecionar Período</h3>
                <button
                  onClick={() => setShowMobileCalendar(false)}
                  className="p-2 rounded-full hover:bg-white/5 text-white/40"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Year selector */}
              <div className="flex items-center justify-between px-4 bg-surface-container-low rounded-xl py-3 border border-white/5 mb-5">
                <button onClick={prevYear} className="p-1 hover:text-primary transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-lg font-extrabold tracking-widest text-primary">{selectedYear}</span>
                <button onClick={nextYear} className="p-1 hover:text-primary transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Month grid */}
              <div className="grid grid-cols-4 gap-2">
                {MONTHS.map((month, index) => {
                  const isSelected = selectedMonth === index
                  return (
                    <button
                      key={month}
                      onClick={() => {
                        setSelectedMonth(index)
                        setShowMobileCalendar(false)
                      }}
                      className={clsx(
                        "py-3 rounded-xl transition-all text-xs font-bold uppercase tracking-tighter border",
                        isSelected
                          ? "bg-primary/20 border-primary/40 text-primary shadow-neon-primary"
                          : "bg-white/5 border-transparent text-white/40 hover:text-white/70"
                      )}
                    >
                      {month}
                    </button>
                  )
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── MOBILE BOTTOM NAV (< lg) ─── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/5 flex items-center justify-around px-2 py-2 pb-safe">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.href}
              to={item.href}
              className={clsx(
                "relative flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all",
                isActive ? "text-primary" : "text-white/30"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-active"
                  className="absolute inset-0 bg-primary/10 rounded-xl border border-primary/20 -z-10"
                />
              )}
              <item.icon className={clsx("w-5 h-5 shrink-0", isActive && "drop-shadow-[0_0_6px_rgba(173,198,255,0.5)]")} />
              <span className="text-[9px] font-black uppercase tracking-tight leading-none">
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
