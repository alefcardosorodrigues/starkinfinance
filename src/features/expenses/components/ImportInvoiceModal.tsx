import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trash2, Tag, Check, ChevronDown } from 'lucide-react'
import { Button } from '@/components/elements/Button'
import { Input } from '@/components/elements/Input'
import type { ParsedExpense } from '../services/pdfParser'
import type { Category, VariableExpense } from '../types'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface ImportInvoiceModalProps {
  isOpen: boolean
  onClose: () => void
  expenses: ParsedExpense[]
  categories: Category[]
  onSave: (expenses: Partial<VariableExpense>[]) => Promise<void>
  isSaving: boolean
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

export function ImportInvoiceModal({ isOpen, onClose, expenses: initialExpenses, categories, onSave, isSaving }: ImportInvoiceModalProps) {
  const [items, setItems] = useState<ParsedExpense[]>([])

  useEffect(() => {
    if (isOpen) {
      setItems(initialExpenses)
    }
  }, [isOpen, initialExpenses])

  const handleRemove = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }

  const handleChange = (id: string, field: keyof ParsedExpense, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item))
  }

  const handleSave = async () => {
    const payload = items.map(item => ({
      name: item.name,
      value: item.value,
      date: item.date,
      category_id: item.categoryId || undefined
    }))
    await onSave(payload)
    onClose()
  }

  if (!isOpen) return null

  const totalValue = items.reduce((acc, curr) => acc + curr.value, 0)

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 lg:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-background/90 backdrop-blur-md"
      />
      
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        className="relative w-full h-full lg:h-[90vh] lg:max-w-4xl glass-card bg-surface-container-high shadow-[0_32px_64px_rgba(0,0,0,0.5)] border-t lg:border border-white/10 overflow-hidden rounded-t-2xl lg:rounded-2xl flex flex-col"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 blur-[60px] -mr-16 -mt-16 rounded-full" />

        <div className="flex-none p-6 lg:p-8 border-b border-white/5 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black tracking-tighter mb-1">
              Revisar <span className="text-secondary">Importação</span>
            </h3>
            <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">
              {items.length} itens encontrados • Total: {formatBRL(totalValue)}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/5 transition-colors text-white/20 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-3">
          {items.map((item) => (
            <div key={item.id} className="glass-card bg-surface-container-low border border-white/5 p-4 rounded-xl flex flex-col lg:flex-row gap-4 items-start lg:items-center">
              
              <div className="w-full lg:w-32">
                <Input
                  type="date"
                  value={item.date}
                  onChange={(e) => handleChange(item.id, 'date', e.target.value)}
                  className="bg-white/5 border-white/10 h-10 text-sm"
                  label=""
                />
              </div>

              <div className="w-full lg:flex-1">
                <Input
                  value={item.name}
                  onChange={(e) => handleChange(item.id, 'name', e.target.value)}
                  className="bg-white/5 border-white/10 h-10 text-sm font-bold"
                  placeholder="Nome do gasto"
                  label=""
                />
              </div>

              <div className="w-full lg:w-40 relative group">
                <select 
                  className="w-full h-10 bg-white/5 border border-white/10 rounded-lg px-3 text-xs font-bold appearance-none focus:outline-none focus:border-secondary transition-all"
                  value={item.categoryId || ''}
                  onChange={e => handleChange(item.id, 'categoryId', e.target.value)}
                >
                  <option value="" className="bg-surface-container-high">Sem categoria</option>
                  {categories?.map(c => (
                    <option key={c.id} value={c.id} className="bg-surface-container-high">{c.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 pointer-events-none group-hover:text-secondary transition-colors" />
              </div>

              <div className="w-full lg:w-32">
                <Input
                  value={formatBRL(item.value)}
                  onChange={(e) => handleChange(item.id, 'value', parseCurrencyToNumber(e.target.value))}
                  className="bg-white/5 border-white/10 h-10 text-sm font-black text-secondary text-right"
                  label=""
                />
              </div>

              <button
                onClick={() => handleRemove(item.id)}
                className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors shrink-0 self-end lg:self-auto"
                title="Remover"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          
          {items.length === 0 && (
            <div className="text-center py-12 text-white/40">
              Nenhum item restante para importar.
            </div>
          )}
        </div>

        <div className="flex-none p-6 lg:p-8 border-t border-white/5 flex gap-4">
          <Button 
            type="button" 
            variant="secondary" 
            className="flex-1 h-14 bg-white/5 hover:bg-white/10 border-none text-white/50 hover:text-white"
            onClick={onClose}
          >
            CANCELAR
          </Button>
          <Button 
            onClick={handleSave}
            disabled={items.length === 0}
            className="flex-[2] h-14 bg-secondary-gradient shadow-neon-secondary text-background font-black text-lg" 
            isLoading={isSaving}
          >
            <Check className="w-5 h-5 mr-2" />
            IMPORTAR {items.length} ITENS
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
