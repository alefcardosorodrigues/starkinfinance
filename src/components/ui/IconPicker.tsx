import { useState } from 'react'
import * as LucideIcons from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from './Input'
import { Search } from 'lucide-react'

const ICON_NAMES = Object.keys(LucideIcons).filter(
  (key) => key !== 'createLucideIcon' && typeof (LucideIcons as any)[key] === 'function'
)

interface IconPickerProps {
  value: string
  onChange: (iconName: string) => void
}

export default function IconPicker({ value, onChange }: IconPickerProps) {
  const [search, setSearch] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const filteredIcons = ICON_NAMES.filter((name) =>
    name.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 100)

  const SelectedIcon = (LucideIcons as any)[value] || LucideIcons.HelpCircle

  return (
    <div className="relative">
      <label className="label-architectural">SÍMBOLO</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 w-full input-field h-12"
      >
        <SelectedIcon className="w-5 h-5 text-primary" strokeWidth={2.5} />
        <span className="text-sm font-bold text-white/70">{value}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute left-0 mt-2 w-full max-h-[320px] glass-card z-50 p-4 overflow-hidden flex flex-col"
          >
            <div className="relative mb-4 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                className="w-full bg-surface-lowest border border-white/10 rounded-md pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50 transition-all"
                placeholder="Buscar ícone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-5 gap-2 overflow-y-auto pr-2 custom-scrollbar flex-1">
              {filteredIcons.map((name) => {
                const Icon = (LucideIcons as any)[name]
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => {
                      onChange(name)
                      setIsOpen(false)
                    }}
                    className={clsx(
                      "p-3 rounded-md flex items-center justify-center transition-all hover:bg-primary/10 hover:shadow-neon-primary hover:border-primary/30 border border-transparent",
                      value === name && "bg-primary/20 border-primary shadow-neon-primary"
                    )}
                    title={name}
                  >
                    <Icon className="w-5 h-5" strokeWidth={2} />
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function clsx(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}
