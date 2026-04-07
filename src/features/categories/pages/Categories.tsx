import { useState } from 'react'
import { useCategories } from '../hooks/useCategories'
import type { Category, CategoryType } from '../types'
import { Button } from '@/components/elements/Button'
import { Input } from '@/components/elements/Input'
import * as LucideIcons from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Tags, Sparkles, Check, Pencil } from 'lucide-react'



const COLORS = [
  '#06b6d4', // Cyan
  '#0ea5e9', // Sky Blue
  '#3b82f6', // Blue
  '#818cf8', // Indigo
  '#4edea3', // Neon Green
  '#10b981', // Emerald
  '#14b8a6', // Teal
  '#84cc16', // Lime
  '#a855f7', // Purple
  '#d946ef', // Fuchsia
  '#ec4899', // Pink
  '#f43f5e', // Rose
  '#ef4444', // Red
  '#f97316', // Orange
  '#f59e0b', // Amber
  '#eab308', // Yellow
]

export default function Categories() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  
  // Form State
  const [name, setName] = useState('')
  const [type, setType] = useState<CategoryType>('Essencial')
  const [color, setColor] = useState(COLORS[0])

  const { categories, isLoading, addCategory, updateCategory, deleteCategory } = useCategories()

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setName(category.name)
    setType(category.type)
    setColor(category.color_hex)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setName('')
    setType('Essencial')
    setColor(COLORS[0])
    setEditingCategory(null)
    setIsModalOpen(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({ id: editingCategory.id, updates: { name, type, color_hex: color } })
      } else {
        await addCategory.mutateAsync({ name, type, color_hex: color })
      }
      handleCloseModal()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="min-h-screen bg-background text-white p-4 lg:p-12 font-sans overflow-x-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] right-[5%] w-[300px] lg:w-[400px] h-[300px] lg:h-[400px] bg-primary/5 rounded-full blur-[80px] lg:blur-[100px]" />
        <div className="absolute bottom-[10%] left-[5%] w-[300px] lg:w-[400px] h-[300px] lg:h-[400px] bg-secondary/5 rounded-full blur-[80px] lg:blur-[100px]" />
      </div>

      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8 lg:mb-12 relative z-10 px-2 lg:px-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="text-primary w-4 h-4 shadow-neon-primary" />
            <span className="label-architectural mb-0 text-[10px]">STARKIN FINANCE</span>
          </div>
          <h1 className="text-2xl lg:text-4xl font-extrabold tracking-tight">Suas <span className="text-primary">Categorias</span></h1>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="w-full lg:w-auto h-12 lg:h-14 font-extrabold shadow-neon-primary">
          <Plus className="w-5 h-5 mr-2" />
          Nova Categoria
        </Button>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-6 relative z-10">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 bg-surface-container-low rounded-md animate-pulse" />
          ))
        ) : categories?.length === 0 ? (
          <div className="col-span-full py-20 text-center glass-card">
            <Tags className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <p className="text-white/30 font-medium">Você ainda não tem categorias.</p>
          </div>
        ) : (
          categories?.map((category, index) => {
            const Icon = (LucideIcons as any)[category.icon] || LucideIcons.Tags
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
                className="glass-card p-4 lg:p-6 flex flex-col group transition-all hover:bg-surface-container-highest border-white/5"
              >
                <div className="flex justify-between mb-3 lg:mb-4">
                  <div 
                    className="w-10 h-10 lg:w-12 lg:h-12 rounded-md flex items-center justify-center border transition-all lg:group-hover:scale-110 shadow-inner"
                    style={{ 
                      backgroundColor: `${category.color_hex}15`, 
                      borderColor: `${category.color_hex}30`,
                      color: category.color_hex,
                      boxShadow: `0 0 15px 0 ${category.color_hex}10`
                    }}
                  >
                    <Icon className="w-5 h-5 lg:w-6 lg:h-6" strokeWidth={2.5} />
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => handleEdit(category)}
                      className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 p-2 rounded-md hover:bg-primary/10 text-white/20 hover:text-primary transition-all touch-manipulation"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => deleteCategory.mutate(category.id)}
                      className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 p-2 rounded-md hover:bg-tertiary/10 text-white/20 hover:text-tertiary transition-all touch-manipulation"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm lg:text-lg font-bold text-white mb-0.5 truncate">{category.name}</h3>
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full" 
                      style={{ backgroundColor: category.color_hex }} 
                    />
                    <span className="text-[8px] lg:text-[10px] font-bold text-white/40 uppercase tracking-widest">
                      {category.type}
                    </span>
                  </div>
                </div>
              </motion.div>
            )
          })
        )}
      </div>

      {/* Form Modal (Add/Edit) */}
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
              className="relative w-full max-w-lg bg-surface-container-high rounded-t-2xl lg:rounded-2xl p-6 lg:p-10 shadow-2xl border-t border-white/10 lg:border-none"
            >
              <h3 className="text-xl lg:text-2xl font-extrabold mb-6 lg:mb-8 flex items-center gap-3">
                {editingCategory ? <Pencil className="text-primary w-5 h-5 lg:w-6 lg:h-6" /> : <Plus className="text-primary w-5 h-5 lg:w-6 lg:h-6" />}
                {editingCategory ? 'Editar' : 'Criar'} <span className="text-primary">Categoria</span>
              </h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                <Input 
                  label="Nome da Categoria" 
                  placeholder="Ex: Supermercado" 
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
                
                <div>
                  <label className="label-architectural">TIPO</label>
                  <div className="flex gap-2 p-1 bg-surface-lowest border border-white/5 rounded-md">
                    <button
                      type="button"
                      onClick={() => setType('Essencial')}
                      className={clsx(
                        "flex-1 py-2 text-xs font-bold rounded-md transition-all",
                        type === 'Essencial' ? "bg-primary text-background" : "text-white/40 hover:text-white"
                      )}
                    >
                      ESSENCIAL
                    </button>
                    <button
                      type="button"
                      onClick={() => setType('Desejo')}
                      className={clsx(
                        "flex-1 py-2 text-xs font-bold rounded-md transition-all",
                        type === 'Desejo' ? "bg-primary text-background" : "text-white/40 hover:text-white"
                      )}
                    >
                      DESEJO
                    </button>
                  </div>
                </div>

                <div>
                  <label className="label-architectural text-[10px]">COR DE DESTAQUE</label>
                  <div className="grid grid-cols-8 lg:grid-cols-8 gap-2 lg:gap-3">
                    {COLORS.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className="aspect-square rounded-full flex items-center justify-center transition-transform lg:hover:scale-110 active:scale-95 border border-white/5 shadow-inner"
                        style={{ backgroundColor: c }}
                      >
                        {color === c && <Check className="w-3 h-3 lg:w-4 lg:h-4 text-background" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-6">
                  <Button variant="secondary" className="flex-1 h-12" onClick={handleCloseModal}>
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 h-12 shadow-neon-primary" 
                    isLoading={addCategory.isPending || updateCategory.isPending}
                  >
                    {editingCategory ? 'Salvar' : 'Criar'}
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
