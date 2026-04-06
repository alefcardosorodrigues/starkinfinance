import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useMonth } from '@/contexts/MonthContext'
import { ComparisonChart } from '@/features/dashboard/components/ComparisonChart'
import { ExpensesPieChart } from '@/features/dashboard/components/ExpensesPieChart'
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Receipt, 
  CreditCard, 
  Target, 
  AlertCircle,
  Plus,
  Pencil,
  Save,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { clsx } from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'
import { Skeleton } from '@/components/elements/Skeleton'

interface CategoryBudget {
  category_id: string
  amount: number
}

const formatBRL = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

const maskCurrency = (value: string) => {
  const digits = value.replace(/\D/g, '')
  const numberValue = Number(digits) / 100
  return formatBRL(numberValue)
}

const parseCurrencyToNumber = (value: string) => {
  const digits = value.replace(/\D/g, '')
  return Number(digits) / 100
}

export default function Dashboard() {
  const { selectedMonth, selectedYear } = useMonth()
  const queryClient = useQueryClient()
  const [editingBudget, setEditingBudget] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const [isTableExpanded, setIsTableExpanded] = useState(true)

  // 1. Fetch Categories
  const { data: categories = [], isLoading: loadCats } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, color_hex')
        .order('name')
      if (error) throw error
      return data
    }
  })

  // 2. Fetch Incomes
  const { data: incomes = [], isLoading: loadInc } = useQuery({
    queryKey: ['dashboard-entries', selectedMonth, selectedYear],
    queryFn: async () => {
      const startDate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-01`
      const lastDay = new Date(selectedYear, selectedMonth + 1, 0).getDate()
      const endDate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
      
      const { data, error } = await supabase
        .from('entries')
        .select('id, amount, date')
        .gte('date', startDate)
        .lte('date', endDate)
      if (error) throw error
      return data
    }
  })

  // 3. Fetch Fixed Expenses
  const { data: fixedExpenses = [], isLoading: loadFix } = useQuery({
    queryKey: ['dashboard-fixed-expenses', selectedMonth, selectedYear],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fixed_expenses')
        .select('id, amount, category_id, month, year')
        .eq('month', selectedMonth)
        .eq('year', selectedYear)
      if (error) throw error
      return data
    }
  })

  // 4. Fetch Variable Expenses
  const { data: variableExpenses = [], isLoading: loadVar } = useQuery({
    queryKey: ['dashboard-variable-expenses', selectedMonth, selectedYear],
    queryFn: async () => {
      const startDate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-01`
      const lastDay = new Date(selectedYear, selectedMonth + 1, 0).getDate()
      const endDate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
      
      const { data, error } = await supabase
        .from('variable_expenses')
        .select('id, value, category_id, date')
        .gte('date', startDate)
        .lte('date', endDate)
      if (error) throw error
      return data
    }
  })

  // 5. Fetch Installments
  const { data: installments = [], isLoading: loadInst } = useQuery({
    queryKey: ['dashboard-installments', selectedMonth, selectedYear],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('installments')
        .select('id, amount, category_id, month, year')
        .eq('month', selectedMonth)
        .eq('year', selectedYear)
      if (error) throw error
      return data
    }
  })

  // 6. Fetch Budgets
  const { data: budgets = [], isLoading: loadBdgt } = useQuery({
    queryKey: ['category_budgets', selectedMonth, selectedYear],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('category_budgets')
        .select('id, category_id, amount, month, year')
        .eq('month', selectedMonth)
        .eq('year', selectedYear)
      if (error) throw error
      return data as CategoryBudget[]
    }
  })

  // Mutations
  const upsertBudget = useMutation({
    mutationFn: async ({ categoryId, amount }: { categoryId: string, amount: number }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('category_budgets')
        .upsert({
          user_id: user.id,
          category_id: categoryId,
          month: selectedMonth,
          year: selectedYear,
          amount
        }, { onConflict: 'user_id,category_id,month,year' })
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['category_budgets'] })
      setEditingBudget(null)
    }
  })

  // Loading state consolidado
  const isLoading = loadCats || loadInc || loadFix || loadVar || loadInst || loadBdgt

  // Consolidate Totals
  const totals = useMemo(() => {
    const totalIncome = incomes.reduce((acc, curr) => acc + Number(curr.amount), 0)
    const totalFixed = fixedExpenses.reduce((acc, curr) => acc + Number(curr.amount), 0)
    const totalVariable = variableExpenses.reduce((acc, curr) => acc + Number(curr.value), 0)
    const totalInstallments = installments.reduce((acc, curr) => acc + Number(curr.amount), 0)
    const totalExpenses = totalFixed + totalVariable + totalInstallments

    return {
      income: totalIncome,
      fixed: totalFixed,
      variable: totalVariable,
      installments: totalInstallments,
      totalExpenses,
      balance: totalIncome - totalExpenses
    }
  }, [incomes, fixedExpenses, variableExpenses, installments])

  // Consolidate by Category
  const categoryStates = useMemo(() => {
    return categories.map(cat => {
      const fixed = fixedExpenses
        .filter(e => e.category_id === cat.id)
        .reduce((acc, curr) => acc + Number(curr.amount), 0)
      
      const variable = variableExpenses
        .filter(e => e.category_id === cat.id)
        .reduce((acc, curr) => acc + Number(curr.value), 0)
      
      const installment = installments
        .filter(e => e.category_id === cat.id)
        .reduce((acc, curr) => acc + Number(curr.amount), 0)
      
      const spent = fixed + variable + installment
      const expected = budgets.find(b => b.category_id === cat.id)?.amount || 0
      
      return {
        ...cat,
        spent,
        expected,
        remaining: expected - spent
      }
    })
  }, [categories, fixedExpenses, variableExpenses, installments, budgets])

  const filteredCategoryStates = useMemo(() => {
    return categoryStates.filter(cat => cat.spent > 0)
  }, [categoryStates])

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val)
  }

  const handleEditBudget = (catId: string, currentAmount: number) => {
    setEditingBudget(catId)
    setEditValue(formatBRL(currentAmount))
  }

  const handleSaveBudget = (catId: string) => {
    const amount = parseCurrencyToNumber(editValue)
    if (isNaN(amount)) return
    upsertBudget.mutate({ categoryId: catId, amount })
  }

  return (
    <div className="p-4 md:p-10 space-y-10 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Controle Estratégico</h1>
          <p className="text-white/40 font-bold uppercase tracking-[0.2em] text-[10px]">Visão Geral de Saúde Financeira</p>
        </div>
        
        <div className="flex items-center gap-4 bg-surface-container-low p-2 rounded-lg border border-white/5 shadow-inner">
          <div className={clsx(
            "px-4 py-2 rounded-md font-bold text-sm tracking-widest uppercase transition-all duration-500",
            isLoading ? "bg-white/5 text-transparent" : (totals.balance >= 0 ? "bg-primary/20 text-primary shadow-neon-primary" : "bg-tertiary/20 text-tertiary shadow-neon-tertiary")
          )}>
            {isLoading ? <Skeleton className="h-5 w-40" /> : `SALDO DISPONÍVEL: ${formatCurrency(totals.balance)}`}
          </div>
        </div>
      </header>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          { label: 'Entradas', value: totals.income, icon: TrendingUp, color: 'primary' },
          { label: 'Gastos Fixos', value: totals.fixed, icon: Receipt, color: 'secondary' },
          { label: 'Variáveis', value: totals.variable, icon: Target, color: 'tertiary' },
          { label: 'Parcelamentos', value: totals.installments, icon: CreditCard, color: 'secondary' },
          { label: 'Total de Gastos', value: totals.totalExpenses, icon: TrendingDown, color: 'tertiary', highlight: true },
        ].map((item, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={item.label}
            className={clsx(
              "glass p-6 rounded-xl border transition-all duration-300 group",
              item.highlight ? "border-tertiary/30 bg-tertiary/5" : "border-white/5"
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={clsx(
                "w-10 h-10 rounded-lg flex items-center justify-center border transition-all duration-300",
                item.color === 'primary' ? "bg-primary/20 border-primary/20 text-primary group-hover:shadow-neon-primary" :
                item.color === 'secondary' ? "bg-secondary/20 border-secondary/20 text-secondary group-hover:shadow-neon-secondary" :
                "bg-tertiary/20 border-tertiary/20 text-tertiary group-hover:shadow-neon-tertiary"
              )}>
                <item.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-1">{item.label}</p>
            {isLoading ? (
              <Skeleton className="h-7 w-32 mt-1" />
            ) : (
              <h3 className="text-xl font-extrabold tracking-tight truncate">
                {formatCurrency(item.value)}
              </h3>
            )}
          </motion.div>
        ))}
      </div>

      {/* Charts Dual Track */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        <div className="relative">
          {isLoading && <Skeleton className="absolute inset-x-0 h-80 rounded-xl" />}
          <div className={isLoading ? 'opacity-0' : ''}>
            <ComparisonChart 
              income={totals.income} 
              expenses={totals.totalExpenses} 
            />
          </div>
        </div>
        <div className="relative">
          {isLoading && <Skeleton className="absolute inset-x-0 h-80 rounded-xl" />}
          <div className={isLoading ? 'opacity-0' : ''}>
            <ExpensesPieChart 
              data={categoryStates.map(cat => ({
                name: cat.name,
                value: cat.spent,
                color: cat.color_hex
              }))}
            />
          </div>
        </div>
      </div>

      {/* Budget Table */}
      <section className="glass rounded-2xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer group/header" onClick={() => setIsTableExpanded(!isTableExpanded)}>
            <div className={clsx(
              "w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 border border-white/10 transition-all group-hover/header:border-primary/30 group-hover/header:bg-primary/5",
              !isTableExpanded && "rotate-[-90deg]"
            )}>
              {isTableExpanded ? <ChevronDown className="w-4 h-4 text-white/40 group-hover/header:text-primary transition-colors" /> : <ChevronUp className="w-4 h-4 text-white/40 group-hover/header:text-primary transition-colors" />}
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight">Meta vs Realidade</h2>
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mt-1">Consolidação por Categoria</p>
            </div>
          </div>
          <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-white/40">
            {filteredCategoryStates.length} CATEGORIAS ATIVAS
          </div>
        </div>

        <AnimatePresence>
          {isTableExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
              className="overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/[0.01]">
                      <th className="px-6 py-4 text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Categoria</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Valor Esperado</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Valor Gasto</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Restam</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {isLoading ? (
                      Array.from({ length: 4 }).map((_, i) => (
                        <tr key={i} className="group hover:bg-white/[0.02]">
                          <td className="px-6 py-5 cursor-default"><Skeleton className="h-6 w-32" /></td>
                          <td className="px-6 py-5 cursor-default"><Skeleton className="h-6 w-24" /></td>
                          <td className="px-6 py-5 cursor-default"><Skeleton className="h-6 w-24" /></td>
                          <td className="px-6 py-5 cursor-default"><Skeleton className="h-6 w-24 rounded-full" /></td>
                        </tr>
                      ))
                    ) : filteredCategoryStates.map((cat, idx) => {
                      const isOverBudget = cat.expected > 0 && cat.spent > cat.expected
                      const isNearingBudget = cat.expected > 0 && cat.spent > (cat.expected * 0.8) && !isOverBudget
                      const progress = cat.expected > 0 ? Math.min((cat.spent / cat.expected) * 100, 100) : 0

                      return (
                        <motion.tr 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.1 + idx * 0.03 }}
                          key={cat.id} 
                          className="group hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-1 h-8 rounded-full" 
                                style={{ backgroundColor: cat.color_hex }} 
                              />
                              <div>
                                <p className="text-sm font-bold tracking-wide">{cat.name}</p>
                                <div className="w-40 h-1 bg-white/5 rounded-full mt-2 overflow-hidden relative">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className={clsx(
                                      "absolute inset-y-0 left-0 transition-colors",
                                      isOverBudget ? "bg-tertiary shadow-[0_0_8px_rgba(255,107,107,0.5)]" : 
                                      isNearingBudget ? "bg-secondary" : "bg-primary"
                                    )}
                                  />
                                </div>
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-6 py-5">
                            {editingBudget === cat.id ? (
                              <div className="flex items-center gap-2">
                                <input
                                  autoFocus
                                  type="text"
                                  value={editValue}
                                  onChange={(e) => setEditValue(maskCurrency(e.target.value))}
                                  className="w-32 bg-surface-container-high border border-white/10 rounded px-2 py-1 text-sm font-bold focus:outline-none focus:border-primary/50 text-secondary"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveBudget(cat.id)
                                    if (e.key === 'Escape') setEditingBudget(null)
                                  }}
                                />
                                <button onClick={() => handleSaveBudget(cat.id)} className="text-primary hover:text-primary/70">
                                  <Save className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className={clsx(
                                  "text-sm font-extrabold tracking-tight",
                                  cat.expected === 0 ? "text-white/20" : "text-white/80"
                                )}>
                                  {formatBRL(cat.expected)}
                                </span>
                                <button 
                                  onClick={() => handleEditBudget(cat.id, cat.expected)}
                                  className="opacity-0 group-hover:opacity-100 p-1 text-white/30 hover:text-white transition-all"
                                >
                                  <Pencil className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </td>

                          <td className="px-6 py-5">
                            <span className="text-sm font-extrabold tracking-tight text-white">
                              {formatCurrency(cat.spent)}
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            <div className={clsx(
                              "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                              cat.remaining > 0 ? "bg-primary/10 border-primary/20 text-primary" : 
                              cat.remaining < 0 ? "bg-tertiary/10 border-tertiary/20 text-tertiary" :
                              "bg-white/5 border-white/10 text-white/20"
                            )}>
                              {cat.remaining === 0 ? '-' : formatCurrency(cat.remaining)}
                              {isOverBudget && <AlertCircle className="w-3 h-3" />}
                            </div>
                          </td>
                        </motion.tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
          
          {filteredCategoryStates.length === 0 && (
            <div className="p-20 text-center">
              <p className="text-white/20 font-bold uppercase tracking-widest">Nenhuma categoria cadastrada</p>
            </div>
          )}
      </section>
    </div>
  )
}
