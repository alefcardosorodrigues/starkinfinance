import { useState, useMemo } from 'react'
import { useVariableExpenses } from '../hooks/useVariableExpenses'
import type { VariableExpense, Category } from '../types'
import { Button } from '@/components/elements/Button'
import { Input } from '@/components/elements/Input'
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
  const { selectedMonth, selectedYear } = useMonth()
  const { 
    expenses, 
    isLoading, 
    categories, 
    addExpense, 
    updateExpense, 
    deleteExpense 
  } = useVariableExpenses(selectedMonth, selectedYear)


  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<VariableExpense | null>(null)
  
  // Form State
  const [name, setName] = useState('')
  const [value, setValue] = useState('R$ 0,00')
  const [date, setDate] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  })
  const [categoryId, setCategoryId] = useState('')
  const [obs, setObs] = useState('')

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
    const now = new Date()
    const isCurrentContext = now.getMonth() === selectedMonth && now.getFullYear() === selectedYear
    if (isCurrentContext) {
      setDate(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`)
    } else {
      setDate(`${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-01`)
    }
    setIsModalOpen(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      name,
      value: parseCurrencyToNumber(value),
      date,
      category_id: categoryId,
      obs: obs || null
    }

    try {
      if (editingExpense) {
        await updateExpense.mutateAsync({ id: editingExpense.id, updates: payload })
      } else {
        await addExpense.mutateAsync(payload)
      }
      handleCloseModal()
    } catch (error) {
      console.error(error)
    }
  }

  const stats = useMemo(() => {
    if (!expenses) return { total: 0, count: 0, max: 0 }
    const total = expenses.reduce((sum, e) => sum + Number(e.value), 0)
    const count = expenses.length
    const max = expenses.reduce((maxVal, e) => Math.max(maxVal, Number(e.value)), 0)
    return { total, count, max }
  }, [expenses])

  return (
    <div className="min-h-screen bg-background text-white p-4 lg:p-12 font-sans overflow-x-hidden">
      {/* Background Lighting */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] right-[-10%] w-[300px] lg:w-[500px] h-[300px] lg:h-[500px] bg-secondary/5 rounded-full blur-[80px] lg:blur-[120px]" />
        <div className="absolute bottom-[20%] left-[-10%] w-[300px] lg:w-[400px] h-[300px] lg:h-[400px] bg-primary/5 rounded-full blur-[80px] lg:blur-[100px]" />
      </div>

      <header className="flex justify-between items-center mb-8 lg:mb-12 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="text-secondary w-4 h-4 lg:w-5 lg:h-5 shadow-neon-secondary" />
            <span className="label-architectural mb-0 text-[10px]">STARKIN FINANCE</span>
          </div>
          <h1 className="text-2xl lg:text-4xl font-extrabold tracking-tight">Gastos <span className="text-secondary">Variáveis</span></h1>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-12 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 lg:p-6 bg-surface-container-low border-white/5"
        >
          <span className="label-architectural text-white/40 block mb-1 text-[10px]">Total do Período</span>
          <div className="text-xl lg:text-3xl font-extrabold">{formatBRL(stats.total)}</div>
        </motion.div>

        <Button 
          className="h-full min-h-[80px] lg:min-h-[100px] text-base lg:text-lg font-extrabold shadow-neon-primary" 
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="w-5 h-5 lg:w-6 lg:h-6 mr-2" />
          Lançar Gasto
        </Button>
      </div>

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
                <div className="glass-card px-4 lg:px-8 py-3 lg:py-6 flex items-center justify-between bg-surface-container-low border-white/5 transition-all hover:bg-surface-container-high">
                  <div className="flex items-center gap-3 lg:gap-8 min-w-0">
                    {/* Date Badge */}
                    <div className="flex flex-col items-center justify-center w-10 h-10 lg:w-14 lg:h-14 rounded-xl bg-white/5 border border-white/10 shrink-0">
                      <span className="text-[8px] lg:text-[9px] font-black text-white/30 uppercase leading-none mb-0.5">
                        {format(parseISO(expense.date), 'MMM', { locale: ptBR })}
                      </span>
                      <span className="text-base lg:text-xl font-black text-white leading-none">
                        {format(parseISO(expense.date), 'dd')}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-bold text-sm lg:text-xl text-white mb-0.5 group-hover:text-secondary transition-colors truncate">
                        {expense.name}
                      </h3>
                      <div className="flex flex-wrap gap-2 lg:gap-3 items-center">
                        {expense.categories && (
                          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[8px] lg:text-[10px] font-black uppercase tracking-widest border border-white/5 bg-white/5" style={{ color: expense.categories.color_hex }}>
                            <Tag className="w-3 h-3" />
                            {expense.categories.name}
                          </span>
                        )}
                        {expense.obs && (
                          <span className="flex items-center gap-1.5 text-[8px] font-bold text-white/30 uppercase tracking-widest hidden lg:flex">
                            <FileText className="w-3 h-3" />
                            {expense.obs}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 lg:gap-10 shrink-0">
                    <div className="text-right">
                      <div className="text-base lg:text-2xl font-black text-white tracking-tighter whitespace-nowrap">
                        {formatBRL(expense.value)}
                      </div>
                    </div>

                    <div className="flex gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEdit(expense)}
                        className="p-2 rounded-xl hover:bg-white/10 text-white/30 hover:text-white transition-all active:scale-95 touch-manipulation"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => deleteExpense.mutate(expense.id)}
                        className="p-2 rounded-xl hover:bg-tertiary/10 text-white/30 hover:text-tertiary transition-all active:scale-95 touch-manipulation"
                      >
                        <Trash2 className="w-4 h-4" />
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
          <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center p-0 lg:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-background/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              className="relative w-full max-w-xl glass-card bg-surface-container-high p-6 lg:p-10 shadow-[0_32px_64px_rgba(0,0,0,0.5)] border-t lg:border border-white/10 overflow-hidden rounded-t-2xl lg:rounded-2xl"
            >
              {/* Modal Accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 blur-[60px] -mr-16 -mt-16 rounded-full" />

              <div className="flex items-center justify-between mb-10">
                <div>
                  <h3 className="text-3xl font-black tracking-tighter mb-1">
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                    isLoading={addExpense.isPending || updateExpense.isPending}
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
