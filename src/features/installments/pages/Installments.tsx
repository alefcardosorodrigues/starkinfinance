import { useState, useMemo } from 'react'
import { useInstallments } from '../hooks/useInstallments'
import type { Installment, Category } from '../types'
import { Button } from '@/components/elements/Button'
import { Input } from '@/components/elements/Input'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'
import { 
  Plus, 
  Trash2, 
  Sparkles, 
  CreditCard, 
  Pencil, 
  CheckCircle2, 
  Circle,
  CalendarDays,
  Tag,
  AlertCircle,
  Hash
} from 'lucide-react'
import { useMonth } from '@/contexts/MonthContext'



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

export default function Installments() {
  const { selectedMonth, selectedYear } = useMonth()
  const { 
    installments, 
    isLoading, 
    categories, 
    addInstallment, 
    deleteInstallment, 
    togglePaid 
  } = useInstallments(selectedMonth, selectedYear)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingInstallment, setEditingInstallment] = useState<Installment | null>(null)
  
  // Form State
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('R$ 0,00')
  const [totalInstallments, setTotalInstallments] = useState<number>(12)
  const [currentInstallment, setCurrentInstallment] = useState<number>(1)
  const [categoryId, setCategoryId] = useState('')
  const [isPaid, setIsPaid] = useState(false)

  const handleCloseModal = () => {
    setEditingInstallment(null)
    setName('')
    setAmount('R$ 0,00')
    setTotalInstallments(12)
    setCurrentInstallment(1)
    setCategoryId('')
    setIsPaid(false)
    setIsModalOpen(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await addInstallment.mutateAsync({
        name,
        amount: parseCurrencyToNumber(amount),
        total_installments: totalInstallments,
        current_installment: currentInstallment,
        category_id: categoryId || null,
        isPaid
      })
      handleCloseModal()
    } catch (error) {
      console.error(error)
    }
  }

  const stats = useMemo(() => {
    if (!installments) return { total: 0, paid: 0, pending: 0 }
    const total = installments.reduce((sum, e) => sum + Number(e.amount), 0)
    const paid = installments.filter(e => e.is_paid).reduce((sum, e) => sum + Number(e.amount), 0)
    const pending = total - paid
    return { total, paid, pending }
  }, [installments])

  return (
    <div className="min-h-screen bg-background text-white p-6 md:p-12 font-sans overflow-x-hidden">
      {/* Background Lighting */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[30%] right-[10%] w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px]" />
      </div>

      <header className="flex justify-between items-center mb-12 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CreditCard className="text-secondary w-5 h-5 drop-shadow-[0_0_8px_rgba(173,198,255,0.4)]" />
            <span className="label-architectural mb-0">STARKIN FINANCE</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">Meus <span className="text-secondary">Parcelamentos</span></h1>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12 relative z-10">
        <div className="glass-card p-6 bg-surface-container-low border-white/5">
          <span className="label-architectural text-white/40 block mb-2">Total Parcelas/Mês</span>
          <div className="text-3xl font-extrabold">{formatBRL(stats.total)}</div>
        </div>
        
        <div className="glass-card p-6 bg-secondary/10 border-secondary/20">
          <span className="label-architectural text-secondary/60 block mb-2">Pago</span>
          <div className="text-3xl font-extrabold text-secondary">{formatBRL(stats.paid)}</div>
        </div>

        <div className="glass-card p-6 bg-surface-container-lowest border-white/5">
          <span className="label-architectural text-white/20 block mb-2">Pendência no Mês</span>
          <div className="text-3xl font-extrabold text-white/60">{formatBRL(stats.pending)}</div>
        </div>

        <Button 
          className="h-full min-h-[100px] text-lg font-extrabold bg-secondary hover:bg-secondary/80 text-background shadow-neon-secondary border-none" 
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="w-6 h-6 mr-2" />
          Novo Parcelamento
        </Button>
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6 px-1">
          <h2 className="text-xl font-bold tracking-tight">Parcelas Ativas em {selectedMonth + 1}/{selectedYear}</h2>
        </div>

        <div className="space-y-3">
          {isLoading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2].map(i => <div key={i} className="h-20 bg-surface-container-low rounded-md" />)}
            </div>
          ) : installments?.length === 0 ? (
            <div className="text-center py-20 bg-surface-container-lowest rounded-md border border-dashed border-white/10">
              <CreditCard className="w-12 h-12 text-white/5 mx-auto mb-4" />
              <p className="text-white/20 font-medium">Nenhum parcelamento ativo para este período.</p>
            </div>
          ) : (
            installments?.map((inst, index) => (
              <motion.div
                key={inst.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className={clsx(
                  "glass-card px-6 py-5 flex items-center justify-between transition-all group",
                  inst.is_paid ? "bg-secondary/5 border-secondary/20" : "bg-surface-container-low border-white/5"
                )}
              >
                <div className="flex items-center gap-6">
                  <button 
                    onClick={() => togglePaid.mutate({ id: inst.id, is_paid: !inst.is_paid })}
                    className="p-1"
                  >
                    {inst.is_paid ? (
                      <CheckCircle2 className="w-7 h-7 text-secondary" />
                    ) : (
                      <Circle className="w-7 h-7 text-white/10 group-hover:text-white/30" />
                    )}
                  </button>
                  
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className={clsx(
                        "font-bold text-lg",
                        inst.is_paid ? "text-white/40 line-through" : "text-white"
                      )}>
                        {inst.name || 'Sem nome'}
                      </h3>
                      <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-black text-secondary">
                        {String(inst.current_installment || '0').padStart(2, '0')}/{String(inst.total_installments || '0').padStart(2, '0')}
                      </span>
                    </div>
                    <div className="flex gap-4 items-center text-[10px] font-bold uppercase tracking-widest text-white/30">
                      {inst.categories && (
                        <span className="flex items-center gap-1" style={{ color: (Array.isArray(inst.categories) ? inst.categories[0]?.color_hex : inst.categories.color_hex) || '#A5B4FC' }}>
                          <Tag className="w-3 h-3" />
                          {(Array.isArray(inst.categories) ? inst.categories[0]?.name : inst.categories.name) || 'Sem categoria'}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" />
                        {((inst.total_installments || 0) - (inst.current_installment || 0))} parcelas restantes
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <div className={clsx(
                      "text-xl font-extrabold",
                      inst.is_paid ? "text-secondary/60" : "text-white"
                    )}>
                      {formatBRL(inst.amount)}
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => deleteInstallment.mutate(inst)}
                    className="opacity-0 group-hover:opacity-100 p-2 rounded-md hover:bg-tertiary/10 text-white/20 hover:text-tertiary transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
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
              <h3 className="text-2xl font-extrabold mb-6 flex items-center gap-3">
                <CreditCard className="text-secondary w-6 h-6" />
                Novo <span className="text-secondary">Parcelamento</span>
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input 
                  label="Nome do Item" 
                  placeholder="Ex: iPhone 15, Notebook, Curso" 
                  required
                  value={name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                />
                
                <Input 
                  label="Valor da Parcela (R$)" 
                  type="text"
                  placeholder="R$ 0,00"
                  required
                  value={amount}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(maskCurrency(e.target.value))}
                />

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="label-architectural leading-none">Qtde Total</label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                      <input 
                        type="number"
                        min={1}
                        className="input-field w-full pl-10"
                        placeholder="Ex: 12"
                        required
                        value={totalInstallments}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTotalInstallments(Number(e.target.value))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="label-architectural leading-none">Parcela Atual</label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                      <input 
                        type="number"
                        min={1}
                        max={totalInstallments}
                        className="input-field w-full pl-10"
                        placeholder="Ex: 1"
                        required
                        value={currentInstallment}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentInstallment(Number(e.target.value))}
                      />
                    </div>
                  </div>
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

                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-md border border-white/5 cursor-pointer" onClick={() => setIsPaid(!isPaid)}>
                  <div className={clsx(
                    "w-6 h-6 rounded flex items-center justify-center border transition-all",
                    isPaid ? "bg-secondary border-secondary shadow-neon-secondary" : "border-white/20"
                  )}>
                    {isPaid && <CheckCircle2 className="w-4 h-4 text-background" />}
                  </div>
                  <span className="font-bold text-sm">Parcela atual já paga?</span>
                </div>

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
                    className="flex-1 bg-secondary hover:bg-secondary/80 text-background border-none" 
                    isLoading={addInstallment.isPending}
                  >
                    Criar Projeção
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
