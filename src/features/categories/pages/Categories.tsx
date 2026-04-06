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
    <div className="min-h-screen bg-background text-white p-6 md:p-12 font-sans overflow-x-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] right-[5%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px]" />
      </div>

      <header className="flex justify-between items-center mb-12 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="text-primary w-5 h-5 shadow-neon-primary" />
            <span className="label-architectural mb-0">STARKIN FINANCE</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">Suas <span className="text-primary">Categorias</span></h1>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-5 h-5 mr-2" />
          Nova Categoria
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
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
                className="glass-card p-6 flex flex-col group transition-all hover:bg-surface-container-highest"
              >
                <div className="flex justify-between mb-4">
                  <div 
                    className="w-12 h-12 rounded-md flex items-center justify-center border transition-all group-hover:scale-110"
                    style={{ 
                      backgroundColor: `${category.color_hex}15`, 
                      borderColor: `${category.color_hex}30`,
                      color: category.color_hex,
                      boxShadow: `0 0 15px 0 ${category.color_hex}10`
                    }}
                  >
                    <Icon className="w-6 h-6 shadow-neon-primary" strokeWidth={2.5} />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEdit(category)}
                      className="opacity-0 group-hover:opacity-100 p-2 rounded-md hover:bg-primary/10 text-white/20 hover:text-primary transition-all"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => deleteCategory.mutate(category.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 rounded-md hover:bg-tertiary/10 text-white/20 hover:text-tertiary transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">{category.name}</h3>
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: category.color_hex }} 
                    />
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-background/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-lg glass-card p-8 border border-white/10"
            >
              <h3 className="text-2xl font-extrabold mb-8 flex items-center gap-3">
                {editingCategory ? <Pencil className="text-primary w-6 h-6" /> : <Plus className="text-primary w-6 h-6" />}
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
                  <label className="label-architectural">COR DE DESTAQUE</label>
                  <div className="grid grid-cols-8 gap-3">
                    {COLORS.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className="aspect-square rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
                        style={{ backgroundColor: c }}
                      >
                        {color === c && <Check className="w-4 h-4 text-background" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button variant="secondary" className="flex-1" onClick={handleCloseModal}>
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1" 
                    isLoading={addCategory.isPending || updateCategory.isPending}
                  >
                    {editingCategory ? 'Salvar Alterações' : 'Criar Categoria'}
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
