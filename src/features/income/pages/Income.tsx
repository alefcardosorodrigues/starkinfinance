import { useState } from 'react'
import { useIncome } from '../hooks/useIncome'
import type { Entry, EntryType } from '../types'
import { Button } from '@/components/elements/Button'
import { Input } from '@/components/elements/Input'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, TrendingUp, Sparkles, DollarSign, Pencil } from 'lucide-react'
import { useMonth } from '@/contexts/MonthContext'



const formatDate = (dateStr: string) => {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('pt-BR')
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

export default function Income() {
  const { selectedMonth, selectedYear } = useMonth()
  const { 
    entries, 
    isLoading, 
    addEntry, 
    updateEntry, 
    deleteEntry 
  } = useIncome(selectedMonth, selectedYear)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null)
  
  // Form State
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('R$ 0,00')
  const [type, setType] = useState<EntryType>('Salário')
  // Default date based on selected context
  const [date, setDate] = useState(() => {
    const now = new Date()
    const isCurrentContext = now.getMonth() === selectedMonth && now.getFullYear() === selectedYear
    if (isCurrentContext) {
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    }
    return `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-01`
  })

  const handleEdit = (entry: Entry) => {
    setEditingEntry(entry)
    setDescription(entry.description)
    setAmount(formatBRL(Number(entry.amount)))
    setType(entry.type)
    setDate(entry.date)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setEditingEntry(null)
    setDescription('')
    setAmount('R$ 0,00')
    setType('Salário')
    // Reset date to context default
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
      description,
      amount: parseCurrencyToNumber(amount),
      type,
      date
    }

    try {
      if (editingEntry) {
        await updateEntry.mutateAsync({ id: editingEntry.id, updates: payload })
      } else {
        await addEntry.mutateAsync(payload)
      }
      handleCloseModal()
    } catch (error) {
      console.error(error)
    }
  }

  const totalIncome = entries?.reduce((sum, e) => sum + Number(e.amount), 0) || 0

  return (
    <div className="min-h-screen bg-background text-white p-6 md:p-12 font-sans overflow-x-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[20%] left-[10%] w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px]" />
      </div>

      <header className="flex justify-between items-center mb-12 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="text-primary w-5 h-5 shadow-neon-primary" />
            <span className="label-architectural mb-0">STARKIN FINANCE</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">Gestão de <span className="text-primary">Entradas</span></h1>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        <div className="lg:col-span-1 space-y-8">
          {isLoading ? (
            <div className="animate-pulse">
              <div className="h-40 bg-surface-container-low rounded-2xl" />
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="glass-card p-8 bg-secondary-gradient border-none"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-white/20 rounded-md">
                  <TrendingUp className="text-white w-6 h-6" />
                </div>
                <span className="label-architectural text-white/60">Total Mensal</span>
              </div>
              <div className="text-5xl font-extrabold tracking-tight mb-2">
                <span className="text-white/60 text-2xl font-medium mr-2">R$</span>
                {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-white/80 text-sm font-medium tracking-wide font-mono">
                PERÍODO: {selectedMonth + 1}/{selectedYear}
              </p>
            </motion.div>
          )}

          <Button 
            className="w-full h-16 text-lg" 
            onClick={() => setIsModalOpen(true)}
            disabled={isLoading}
          >
            <Plus className="w-6 h-6 mr-2" />
            Nova Entrada
          </Button>
        </div>

        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold tracking-tight">Histórico de Recebimentos</h2>
            <div className="flex gap-2">
              <span className="bg-surface-container-high px-3 py-1 rounded-full text-[10px] font-bold text-white/50 border border-white/5 uppercase">
                {entries?.length || 0} Registros
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 bg-surface-container-low rounded-md" />
                ))}
              </div>
            ) : entries?.length === 0 ? (
              <div className="text-center py-20 bg-surface-container-lowest rounded-md border border-dashed border-white/10">
                <DollarSign className="w-12 h-12 text-white/10 mx-auto mb-4" />
                <p className="text-white/30 font-medium">Nenhuma entrada registrada em {selectedMonth + 1}/{selectedYear}.</p>
              </div>
            ) : (
              entries?.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-card px-6 py-4 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-6">
                    <div className={clsx(
                      "w-12 h-12 rounded-md flex items-center justify-center font-bold",
                      entry.type === 'Salário' ? "bg-primary/20 text-primary border border-primary/20" :
                      entry.type === 'Vale Refeição' ? "bg-secondary/20 text-secondary border border-secondary/20" :
                      "bg-tertiary/20 text-tertiary border border-tertiary/20"
                    )}>
                      {entry.type[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">{entry.description}</h3>
                      <div className="flex gap-3 text-xs font-bold uppercase tracking-wider text-white/40">
                        <span>{formatDate(entry.date)}</span>
                        <span>•</span>
                        <span>{entry.type}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-xl font-extrabold text-white">
                        {formatBRL(entry.amount)}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEdit(entry)}
                        className="opacity-0 group-hover:opacity-100 p-2 rounded-md hover:bg-primary/10 text-white/20 hover:text-primary transition-all"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => deleteEntry.mutate(entry.id)}
                        className="opacity-0 group-hover:opacity-100 p-2 rounded-md hover:bg-tertiary/10 text-white/20 hover:text-tertiary transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Entry Modal (Add/Edit) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6">
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
              className="relative w-full max-w-lg bg-surface-container-high rounded-t-2xl md:rounded-2xl p-8 shadow-2xl border-t border-white/10 md:border-none"
            >
              <h3 className="text-2xl font-extrabold mb-8 flex items-center gap-3">
                {editingEntry ? <Pencil className="text-primary w-6 h-6" /> : <Plus className="text-primary w-6 h-6" />}
                {editingEntry ? 'Editar' : 'Nova'} <span className="text-primary">Entrada</span>
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input 
                  label="Descrição" 
                  placeholder="Ex: Salário Mensal" 
                  autoFocus
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
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
                  <div>
                    <label className="label-architectural">Tipo</label>
                    <select 
                      className="input-field w-full h-[47.5px] disabled:opacity-50 disabled:cursor-not-allowed"
                      value={type}
                      onChange={e => setType(e.target.value as EntryType)}
                    >
                      <option value="Salário">Salário</option>
                      <option value="Renda Extra">Renda Extra</option>
                      <option value="Vale Refeição">Vale Refeição</option>
                    </select>
                  </div>
                </div>

                <Input 
                  label="Data do Recebimento" 
                  type="date"
                  required
                  value={date}
                  onChange={e => setDate(e.target.value)}
                />

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
                    isLoading={addEntry.isPending || updateEntry.isPending}
                  >
                    {editingEntry ? 'Salvar Alterações' : 'Salvar Entrada'}
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

function clsx(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}
