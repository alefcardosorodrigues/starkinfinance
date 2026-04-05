import { motion } from 'framer-motion'

interface ComparisonChartProps {
  income: number
  expenses: number
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(val)
}

export function ComparisonChart({ income, expenses }: ComparisonChartProps) {
  const maxValue = Math.max(income, expenses, 1) // Avoid division by zero
  const incomeHeight = (income / maxValue) * 100
  const expensesHeight = (expenses / maxValue) * 100

  return (
    <div className="glass p-8 rounded-2xl border border-white/5 relative overflow-hidden group">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">Fluxo de Caixa</h2>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mt-1">Comparativo Mensal</p>
        </div>
        
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-secondary shadow-neon-secondary" />
            <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">ENTRADAS</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-tertiary shadow-neon-tertiary" />
            <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">SAÍDAS</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="relative h-64 flex items-end justify-center gap-8 md:gap-16 pt-10">
        {/* Horizontal Gridlines (Aesthetic only) */}
        <div className="absolute inset-x-0 bottom-0 top-12 flex flex-col justify-between pointer-events-none opacity-10">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-full h-[1px] bg-white/10" />
          ))}
        </div>

        {/* Income Bar */}
        <div className="relative flex flex-col items-center flex-1 max-w-[64px] h-full justify-end">
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${incomeHeight}%` }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            className="w-full bg-gradient-to-t from-secondary/20 via-secondary/60 to-secondary rounded-none shadow-[0_0_20px_rgba(78,222,163,0.15)] group-hover:shadow-[0_0_35px_rgba(78,222,163,0.3)] transition-all duration-700 relative"
          >
            {/* Glossy Sheen */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent w-full h-full rounded-none pointer-events-none" />
            
            {/* Value Label */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: -45 }}
              transition={{ delay: 0.8 }}
              className="absolute -top-1 left-1/2 -translate-x-1/2 text-[11px] font-black tracking-tighter text-secondary bg-[#0d141f]/90 backdrop-blur-xl px-4 py-1.5 rounded-full border border-secondary/20 shadow-2xl whitespace-nowrap z-10"
            >
              {formatCurrency(income)}
            </motion.div>
          </motion.div>
          <span className="mt-6 text-[9px] font-bold tracking-[0.25em] text-white/20 uppercase whitespace-nowrap">Proventos</span>
        </div>

        {/* Expenses Bar */}
        <div className="relative flex flex-col items-center flex-1 max-w-[64px] h-full justify-end">
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${expensesHeight}%` }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="w-full bg-gradient-to-t from-tertiary/20 via-tertiary/60 to-tertiary rounded-none shadow-[0_0_20px_rgba(255,179,182,0.15)] group-hover:shadow-[0_0_35px_rgba(255,179,182,0.3)] transition-all duration-700 relative"
          >
            {/* Glossy Sheen */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent w-full h-full rounded-none pointer-events-none" />

            {/* Value Label */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: -45 }}
              transition={{ delay: 1 }}
              className="absolute -top-1 left-1/2 -translate-x-1/2 text-[11px] font-black tracking-tighter text-tertiary bg-[#0d141f]/90 backdrop-blur-xl px-4 py-1.5 rounded-full border border-tertiary/20 shadow-2xl whitespace-nowrap z-10"
            >
              {formatCurrency(expenses)}
            </motion.div>
          </motion.div>
          <span className="mt-6 text-[9px] font-bold tracking-[0.25em] text-white/20 uppercase whitespace-nowrap">Débitos</span>
        </div>
      </div>

      {/* Aesthetic Obsidian Edge */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-50" />
    </div>
  )
}
