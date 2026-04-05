import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
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
  LayoutDashboard
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useMonth } from '@/contexts/MonthContext'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Entradas', icon: TrendingUp, href: '/income' },
  { label: 'Gastos Variáveis', icon: Receipt, href: '/variables' },
  { label: 'Gastos Fixos', icon: CheckSquare, href: '/fixed-expenses' },
  { label: 'Parcelas', icon: CreditCard, href: '/installments' },
  { label: 'Categorias', icon: Tags, href: '/categories' },
]

const MONTHS = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
]

export default function Navigation() {
  const location = useLocation()
  const { selectedMonth, selectedYear, setSelectedMonth, prevYear, nextYear } = useMonth()
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

  const handleLogout = () => supabase.auth.signOut()

  return (
    <nav className="fixed left-0 top-0 h-screen w-20 md:w-64 glass border-r border-white/5 z-50 flex flex-col p-4">
      {/* Brand */}
      <div className="flex items-center gap-3 mb-10 px-2 shrink-0">
        <div className="w-10 h-10 rounded-md bg-primary-gradient flex items-center justify-center shadow-neon-primary shrink-0">
          <Sparkles className="text-background w-6 h-6" />
        </div>
        <div className="hidden md:block">
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
              <span className="hidden md:block font-bold text-sm tracking-wide">{item.label}</span>
              
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

      {/* Month/Year Selector - Only visible on MD+ for better spacing, or simplified on small screens */}
      <div className="hidden md:flex flex-1 flex-col overflow-hidden">
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

      {/* Mobile-only Calendar Icon Trigger (Optional improvement for future) */}
      <div className="md:hidden flex flex-col items-center gap-4 mb-4">
        <div className="w-10 h-10 rounded-md bg-surface-container-high flex items-center justify-center border border-white/10 text-primary">
          <Calendar className="w-5 h-5" />
        </div>
      </div>

      {/* Footer / User Profile */}
      <div className="mt-auto space-y-2 shrink-0">
        <div className="flex items-center gap-4 px-4 py-3 rounded-lg bg-surface-container-low border border-white/5 mx-1">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/20 shrink-0 shadow-neon-primary">
            <User className="w-5 h-5" />
          </div>
          <div className="hidden md:block overflow-hidden">
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
          <span className="hidden md:block font-bold text-sm tracking-wide">Desconectar</span>
        </button>
      </div>
    </nav>
  )
}
