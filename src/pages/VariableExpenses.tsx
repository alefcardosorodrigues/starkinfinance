import { useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'
import { 
  Plus, 
  Trash2, 
  Sparkles, 
  DollarSign, 
  Pencil, 
  Tag,
  CalendarDays,
  FileText,
  Receipt,
  Search,
  ChevronDown,
  X
} from 'lucide-react'
import { useMonth } from '@/contexts/MonthContext'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type Category = {
  id: string
  name: string
  color_hex: string
}

type VariableExpense = {
  id: string
  date: string
  name: string
  value: number
  category_id: string
  obs: string | null
  categories?: Category
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

export default function VariableExpenses() {
  const queryClient = useQueryClient()
  const { selectedMonth, selectedYear } = useMonth()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<VariableExpense | null>(null)
  
  // Form State
  const [name, setName] = useState('')
  const [value, setValue] = useState('R$ 0,00')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [categoryId, setCategoryId] = useState('')
  const [obs, setObs] = useState('')

  // Fetch Categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, color_hex')
        .order('name')
      if (error) throw error
      return data as Category[]
    }
  })

  // Fetch Variable Expenses for current month/year
  const { data: expenses, isLoading } = useQuery({
    queryKey: ['variable-expenses', selectedMonth, selectedYear],
    queryFn: async () => {
      // Filtrar por data no intervalo do mês selecionado
      const firstDay = new Date(selectedYear, selectedMonth, 1).toISOString()
      const lastDay = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59).toISOString()

      const { data, error } = await supabase
        .from('variable_expenses')
        .select('*, categories(id, name, color_hex)')
        .gte('date', firstDay.split('T')[0])
        .lte('date', lastDay.split('T')[0])
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
        
      if (error) throw error
      return data as VariableExpense[]
    },
  })

  const addMutation = useMutation({
    mutationFn: async (newExpense: Partial<VariableExpense>) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Não autenticado')
      
      const { data, error } = await supabase
        .from('variable_expenses')
        .insert([{ ...newExpense, user_id: user.id }])
        .select()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variable-expenses'] })
      handleCloseModal()
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (updated: Partial<VariableExpense>) => {
      if (!editingExpense) return
      const { error } = await supabase
        .from('variable_expenses')
        .update(updated)
        .eq('id', editingExpense.id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variable-expenses'] })
      handleCloseModal()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('variable_expenses')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variable-expenses'] })
    },
  })

  const handleEdit = (expense: VariableExpense) => {
    setEditingExpense(expense)
    setName(expense.name)
    setValue(formatBRL(expense.value))
    setDate(expense.date)
    setCategoryId(expense.category_id)
    setObs(expense.obs || '')
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setEditingExpense(null)
    setName('')
    setValue('R$ 0,00')
    setDate(new Date().toISOString().split('T')[0])
    setCategoryId('')
    setObs('')
    setIsModalOpen(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      name,
      value: parseCurrencyToNumber(value),
      date,
      category_id: categoryId,
      obs: obs || null
    }

    if (editingExpense) {
      updateMutation.mutate(payload)
    } else {
      addMutation.mutate(payload)
    }
  }

  const totalAmount = useMemo(() => {
    return expenses?.reduce((sum, e) => sum + Number(e.value), 0) || 0
  }, [expenses])

  return (
    <div className="min-h-screen bg-background text-white p-6 md:p-12 font-sans overflow-x-hidden">
      {/* Background Lighting */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] right-[10%] w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[20%] left-[5%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />
      </div>

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Receipt className="text-secondary w-5 h-5 shadow-neon-secondary" />
            <span className="label-architectural mb-0">STARKIN FINANCE</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight italic">Gastos <span className="text-secondary">Variáveis</span></h1>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="glass-card px-6 py-3 bg-surface-container-low border-white/5 flex flex-col items-end min-w-[200px]">
            <span className="label-architectural text-white/30 text-[10px]">Total do Período</span>
            <span className="text-2xl font-black text-secondary tracking-tighter">{formatBRL(totalAmount)}</span>
          </div>
          <Button 
            className="h-[52px] px-8 bg-secondary-gradient shadow-neon-secondary text-background font-black"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="w-5 h-5 mr-2" />
            LANÇAR GASTO
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4 text-white/40">
            <div className="flex items-center gap-2 bg-surface-container-low px-4 py-2 rounded-full border border-white/5">
              <Search className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Filtrar Histórico</span>
            </div>
          </div>
          <span className="bg-surface-container-high px-4 py-1.5 rounded-full text-[10px] font-black text-white/50 border border-white/5 uppercase tracking-widest">
            {expenses?.length || 0} Registros
          </span>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-24 bg-surface-container-low rounded-xl" />
              ))}
            </div>
          ) : expenses?.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-32 bg-surface-container-lowest/50 rounded-3xl border border-dashed border-white/10"
            >
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                <Receipt className="w-10 h-10 text-white/10" />
              </div>
              <h3 className="text-xl font-bold text-white/40 mb-2">Sem gastos registrados</h3>
              <p className="text-white/20 text-sm max-w-xs mx-auto">
                Seus gastos variáveis de {format(new Date(selectedYear, selectedMonth), "MMMM 'de' yyyy", { locale: ptBR })} aparecerão aqui.
              </p>
            </motion.div>
          ) : (
            expenses?.map((expense, index) => (
              <motion.div
                key={expense.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="group relative"
              >
                <div className="glass-card px-8 py-6 flex items-center justify-between bg-surface-container-low border-white/5 transition-all hover:bg-surface-container-high hover:translate-x-1">
                  <div className="flex items-center gap-8">
                    {/* Date Badge */}
                    <div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-white/5 border border-white/10 shrink-0">
                      <span className="text-[10px] font-black text-white/30 uppercase leading-none mb-1">
                        {format(parseISO(expense.date), 'MMM', { locale: ptBR })}
                      </span>
                      <span className="text-xl font-black text-white leading-none">
                        {format(parseISO(expense.date), 'dd')}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-xl text-white mb-1 group-hover:text-secondary transition-colors">
                        {expense.name}
                      </h3>
                      <div className="flex flex-wrap gap-3 items-center">
                        {expense.categories && (
                          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/5 bg-white/5" style={{ color: expense.categories.color_hex }}>
                            <Tag className="w-3 h-3" />
                            {expense.categories.name}
                          </span>
                        )}
                        {expense.obs && (
                          <span className="flex items-center gap-1.5 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                            <FileText className="w-3 h-3" />
                            {expense.obs}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-10">
                    <div className="text-right">
                      <div className="text-2xl font-black text-white tracking-tighter">
                        {formatBRL(expense.value)}
                      </div>
                    </div>

                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEdit(expense)}
                        className="p-3 rounded-xl hover:bg-white/10 text-white/20 hover:text-white transition-all active:scale-95"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => deleteMutation.mutate(expense.id)}
                        className="p-3 rounded-xl hover:bg-tertiary/10 text-white/20 hover:text-tertiary transition-all active:scale-95"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Modern Modal / Side Sheet for Entry */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-background/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-xl glass-card bg-surface-container-high p-10 shadow-[0_32px_64px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden"
            >
              {/* Modal Accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 blur-[60px] -mr-16 -mt-16 rounded-full" />

              <div className="flex items-center justify-between mb-10">
                <div>
                  <h3 className="text-3xl font-black tracking-tighter mb-1 italic">
                    {editingExpense ? 'Editar' : 'Novo'} <span className="text-secondary">Gasto</span>
                  </h3>
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">One-Tap Entry System</p>
                </div>
                <button 
                  onClick={handleCloseModal}
                  className="p-2 rounded-full hover:bg-white/5 transition-colors text-white/20 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Input 
                    label="Nome do Gasto" 
                    placeholder="Ex: Almoço, Uber, Farmácia" 
                    autoFocus
                    required
                    className="bg-transparent border-white/10 focus:border-secondary"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                  <Input 
                    label="Valor Total" 
                    placeholder="R$ 0,00"
                    required
                    className="text-secondary font-black text-xl bg-transparent border-white/10 focus:border-secondary"
                    value={value}
                    onChange={e => setValue(maskCurrency(e.target.value))}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Input 
                    label="Data da Transação" 
                    type="date"
                    required
                    className="bg-transparent border-white/10 focus:border-secondary"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                  />
                  <div className="space-y-2">
                    <label className="label-architectural text-[10px] text-white/40 font-black uppercase tracking-widest pl-1">Categoria</label>
                    <div className="relative group">
                      <select 
                        className="w-full h-[52px] bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold appearance-none focus:outline-none focus:border-secondary transition-all"
                        value={categoryId}
                        onChange={e => setCategoryId(e.target.value)}
                        required
                      >
                        <option value="" disabled className="bg-surface-container-high">Selecionar...</option>
                        {categories?.map(c => (
                          <option key={c.id} value={c.id} className="bg-surface-container-high">{c.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 pointer-events-none group-hover:text-secondary transition-colors" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="label-architectural text-[10px] text-white/40 font-black uppercase tracking-widest pl-1">Observações (Opcional)</label>
                  <textarea 
                    className="w-full min-h-[100px] bg-white/5 border border-white/10 rounded-xl p-4 text-sm font-bold focus:outline-none focus:border-secondary transition-all placeholder:text-white/10 resize-none"
                    placeholder="Algo para lembrar depois?"
                    value={obs}
                    onChange={e => setObs(e.target.value)}
                  />
                </div>

                <div className="flex gap-4 pt-6">
                  <Button 
                    type="button" 
                    variant="secondary" 
                    className="flex-1 h-14 bg-white/5 hover:bg-white/10 border-none text-white/50 hover:text-white"
                    onClick={handleCloseModal}
                  >
                    CANCELAR
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-[2] h-14 bg-secondary-gradient shadow-neon-secondary text-background font-black text-lg" 
                    isLoading={addMutation.isPending || updateMutation.isPending}
                  >
                    {editingExpense ? 'ATUALIZAR REGISTRO' : 'CONFIRMAR GASTO'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
