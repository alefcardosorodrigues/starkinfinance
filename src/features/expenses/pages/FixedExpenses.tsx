import { useState, useMemo } from 'react'
import { useFixedExpenses } from '../hooks/useFixedExpenses'
import type { FixedExpense, Category } from '../types'
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
  CheckCircle2, 
  Circle,
  CalendarDays,
  Tag,
  AlertCircle
} from 'lucide-react'
import { useMonth } from '@/contexts/MonthContext'
import { format } from 'date-fns'
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

export default function FixedExpenses() {
  const { selectedMonth, selectedYear } = useMonth()
  const { 
    expenses, 
    isLoading, 
    categories, 
    addExpense, 
    updateExpense, 
    togglePaid, 
    deleteExpense 
  } = useFixedExpenses(selectedMonth, selectedYear)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<FixedExpense | null>(null)
  
  // Form State
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('R$ 0,00')
  const [dueDay, setDueDay] = useState<number>(new Date().getDate())
  const [categoryId, setCategoryId] = useState('')
  const [isPaid, setIsPaid] = useState(false)

  const handleEdit = (expense: FixedExpense) => {
    setEditingExpense(expense)
    setName(expense.name)
    setAmount(formatBRL(expense.amount))
    setDueDay(expense.due_day)
    setCategoryId(expense.category_id || '')
    setIsPaid(expense.is_paid)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setEditingExpense(null)
    setName('')
    setAmount('R$ 0,00')
    setDueDay(new Date().getDate())
    setCategoryId('')
    setIsPaid(false)
    setIsModalOpen(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      name,
      amount: parseCurrencyToNumber(amount),
      due_day: dueDay,
      category_id: categoryId || null,
      is_paid: isPaid
    }

    try {
      if (editingExpense) {
        await updateExpense.mutateAsync({ recurring_id: editingExpense.recurring_id, updates: payload })
      } else {
        await addExpense.mutateAsync(payload)
      }
      handleCloseModal()
    } catch (error) {
      console.error(error)
    }
  }

  // Stats
  const stats = useMemo(() => {
    if (!expenses) return { total: 0, paid: 0, pending: 0 }
    const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0)
    const paid = expenses.filter(e => e.is_paid).reduce((sum, e) => sum + Number(e.amount), 0)
    const pending = total - paid
    return { total, paid, pending }
  }, [expenses])

  return (
    <div className="min-h-screen bg-background text-white p-3 lg:p-12 font-sans overflow-x-hidden">
      {/* Background Lighting */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[-10%] w-[300px] lg:w-[400px] h-[300px] lg:h-[400px] bg-primary/5 rounded-full blur-[80px] lg:blur-[100px]" />
        <div className="absolute bottom-[10%] right-[-10%] w-[300px] lg:w-[400px] h-[300px] lg:h-[400px] bg-tertiary/5 rounded-full blur-[80px] lg:blur-[100px]" />
      </div>

      <header className="flex justify-between items-center mb-8 lg:mb-12 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="text-primary w-4 h-4 lg:w-5 lg:h-5 shadow-neon-primary" />
            <span className="label-architectural mb-0 text-[10px]">STARKIN FINANCE</span>
          </div>
          <h1 className="text-2xl lg:text-4xl font-extrabold tracking-tight">Gastos <span className="text-primary">Fixos</span></h1>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-8 lg:mb-12 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 lg:p-6 bg-surface-container-low border-white/5"
        >
          <span className="label-architectural text-white/40 block mb-1 text-[10px]">Total Mensal</span>
          <div className="text-xl lg:text-3xl font-extrabold">{formatBRL(stats.total)}</div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-4 lg:p-6 bg-primary/10 border-primary/20"
        >
          <span className="label-architectural text-primary/60 block mb-1 text-[10px]">Pago</span>
          <div className="text-xl lg:text-3xl font-extrabold text-primary">{formatBRL(stats.paid)}</div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-4 lg:p-6 bg-tertiary/10 border-tertiary/20"
        >
          <span className="label-architectural text-tertiary/60 block mb-1 text-[10px]">Pendente</span>
          <div className="text-xl lg:text-3xl font-extrabold text-tertiary">{formatBRL(stats.pending)}</div>
        </motion.div>

        <Button 
          className="h-full min-h-[80px] lg:min-h-[100px] text-base lg:text-lg font-extrabold shadow-neon-primary" 
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="w-5 h-5 lg:w-6 lg:h-6 mr-2" />
          Novo Gasto
        </Button>
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6 px-1">
          <h2 className="text-xl font-bold tracking-tight">Checklist de Contas</h2>
          <span className="bg-surface-container-high px-3 py-1 rounded-full text-[10px] font-bold text-white/50 border border-white/5 uppercase">
            {expenses?.length || 0} Itens
          </span>
        </div>

        <div className="space-y-3">
          {isLoading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-20 bg-surface-container-low rounded-md" />
              ))}
            </div>
          ) : expenses?.length === 0 ? (
            <div className="text-center py-20 bg-surface-container-lowest rounded-md border border-dashed border-white/10">
              <CalendarDays className="w-12 h-12 text-white/10 mx-auto mb-4" />
              <p className="text-white/30 font-medium">Nenhum gasto fixo para este mês.</p>
            </div>
          ) : (
            expenses?.map((expense, index) => (
              <motion.div
                key={expense.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={clsx(
                  "glass-card px-4 lg:px-6 py-3 lg:py-4 flex items-center justify-between transition-all duration-300 group",
                  expense.is_paid ? "bg-primary/5 border-primary/20" : "bg-surface-container-low border-white/5"
                )}
              >
                <div className="flex items-center gap-2 lg:gap-6 min-w-0">
                  <button 
                    onClick={() => togglePaid.mutate({ id: expense.id, is_paid: !expense.is_paid })}
                    className="p-1 transition-transform active:scale-90 shrink-0"
                  >
                    {expense.is_paid ? (
                      <CheckCircle2 className="w-6 h-6 lg:w-7 lg:h-7 text-primary drop-shadow-[0_0_8px_rgba(173,198,255,0.6)]" />
                    ) : (
                      <Circle className="w-6 h-6 lg:w-7 lg:h-7 text-white/20 group-hover:text-white/40" />
                    )}
                  </button>
                  
                  {/* Date Badge */}
                  <div className="flex flex-col items-center justify-center w-10 lg:w-12 h-10 lg:h-12 rounded-xl bg-white/5 border border-white/10 shrink-0">
                    <span className="text-[8px] lg:text-[9px] font-black text-white/30 uppercase leading-none mb-1">
                      {format(new Date(selectedYear, selectedMonth, 1), 'MMM', { locale: ptBR })}
                    </span>
                    <span className="text-base lg:text-lg font-black text-white leading-none">
                      {String(expense.due_day).padStart(2, '0')}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <h3 className={clsx(
                      "font-bold text-sm lg:text-lg transition-all truncate",
                      expense.is_paid ? "text-white/40 line-through" : "text-white"
                    )}>
                      {expense.name}
                    </h3>
                    <div className="flex gap-2 lg:gap-3 items-center text-[9px] lg:text-[10px] font-bold uppercase tracking-widest text-white/40">
                      {expense.categories && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full border border-white/5 bg-white/5" style={{ color: expense.categories.color_hex }}>
                          <Tag className="w-3 h-3" />
                          {expense.categories.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 lg:gap-8 shrink-0">
                  <div className="text-right">
                    <div className={clsx(
                      "text-base lg:text-xl font-extrabold transition-all whitespace-nowrap",
                      expense.is_paid ? "text-primary/60" : "text-white"
                    )}>
                      {formatBRL(expense.amount)}
                    </div>
                  </div>
                  
                  <div className="flex gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all">
                    <button 
                      onClick={() => handleEdit(expense)}
                      className="p-2 rounded-md hover:bg-white/10 text-white/30 hover:text-white transition-all touch-manipulation"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => deleteExpense.mutate(expense.recurring_id)}
                      className="p-2 rounded-md hover:bg-tertiary/10 text-white/30 hover:text-tertiary transition-all touch-manipulation"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center p-0 lg:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              className="relative w-full max-w-lg bg-surface-container-high rounded-t-2xl lg:rounded-2xl p-6 lg:p-8 shadow-2xl border-t border-white/10 lg:border-none"
            >
              <h3 className="text-2xl font-extrabold mb-4 flex items-center gap-3">
                {editingExpense ? <Pencil className="text-primary w-6 h-6" /> : <Plus className="text-primary w-6 h-6" />}
                {editingExpense ? 'Editar' : 'Novo'} <span className="text-primary">Gasto Fixo</span>
              </h3>

              {editingExpense && (
                <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-md border border-primary/20 mb-6">
                  <AlertCircle className="w-5 h-5 text-primary shrink-0" />
                  <p className="text-[10px] text-primary/80 font-bold uppercase tracking-tight">
                    Alterações serão aplicadas a este e a todos os meses futuros.
                  </p>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input 
                  label="Nome da Cobrança" 
                  placeholder="Ex: Aluguel, Luz, Netflix" 
                  autoFocus
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    label="Valor (R$)" 
                    type="text"
                    placeholder="R$ 0,00"
                    required
                    value={amount}
                    onChange={e => setAmount(maskCurrency(e.target.value))}
                  />
                  <Input 
                    label="Dia de Vencimento" 
                    type="number"
                    min={1}
                    max={31}
                    required
                    value={dueDay}
                    onChange={e => setDueDay(Number(e.target.value))}
                  />
                </div>

                <div>
                  <label className="label-architectural">Categoria</label>
                  <select 
                    className="input-field w-full h-[47.5px]"
                    value={categoryId}
                    onChange={e => setCategoryId(e.target.value)}
                    required
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories?.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {!editingExpense && (
                  <div className="flex items-center gap-3 p-4 bg-white/5 rounded-md border border-white/5 cursor-pointer" onClick={() => setIsPaid(!isPaid)}>
                    <div className={clsx(
                      "w-6 h-6 rounded flex items-center justify-center border transition-all",
                      isPaid ? "bg-primary border-primary shadow-neon-primary" : "border-white/20"
                    )}>
                      {isPaid && <CheckCircle2 className="w-4 h-4 text-background" />}
                    </div>
                    <span className="font-bold text-sm">Já foi pago?</span>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <Button 
                    type="button" 
                    variant="secondary" 
                    className="flex-1"
                    onClick={handleCloseModal}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1" 
                    isLoading={addExpense.isPending || updateExpense.isPending}
                  >
                    {editingExpense ? 'Atualizar todos' : 'Salvar e Replicar'}
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

