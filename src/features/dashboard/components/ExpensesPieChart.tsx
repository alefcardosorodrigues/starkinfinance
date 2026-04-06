import { motion } from 'framer-motion'
import { useMemo } from 'react'

interface PieChartData {
  name: string
  value: number
  color: string
}

interface ExpensesPieChartProps {
  data: PieChartData[]
}

const DEFAULT_COLORS = [
  '#4edea3', // secondary
  '#ffb3b6', // tertiary
  '#3b82f6', // blue
  '#a855f7', // purple
  '#f59e0b', // amber
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#8b5cf6', // violet
]

export function ExpensesPieChart({ data }: ExpensesPieChartProps) {
  const total = useMemo(() => data.reduce((acc, curr) => acc + curr.value, 0), [data])
  
  // Filter out zero values and sort by value for a cleaner look
  const activeData = useMemo(() => 
    data
      .filter(d => d.value > 0)
      .sort((a, b) => b.value - a.value), 
    [data]
  )

  const segments = useMemo(() => {
    let cumulativeValue = 0
    return activeData.map((d, i) => {
      const percentage = (d.value / total) * 100
      const startAngle = (cumulativeValue / total) * 360
      const endAngle = ((cumulativeValue + d.value) / total) * 360
      cumulativeValue += d.value

      const sliceColor = d.color && d.color !== '#000000' && d.color !== 'transparent' 
        ? d.color 
        : DEFAULT_COLORS[i % DEFAULT_COLORS.length]

      // Calculate path coordinates for arc
      const centerX = 100
      const centerY = 100
      const radius = 80
      
      const startRad = (startAngle - 90) * (Math.PI / 180)
      const endRad = (endAngle - 90) * (Math.PI / 180)

      const x1 = centerX + radius * Math.cos(startRad)
      const y1 = centerY + radius * Math.sin(startRad)
      const x2 = centerX + radius * Math.cos(endRad)
      const y2 = centerY + radius * Math.sin(endRad)

      const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1
      const dPath = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`

      return {
        ...d,
        color: sliceColor,
        percentage,
        dPath,
        startAngle
      }
    })
  }, [activeData, total])

  if (activeData.length === 0) {
    return (
      <div className="glass p-8 rounded-2xl border border-white/5 h-full flex flex-col items-center justify-center min-h-[350px]">
        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
          <span className="text-white/40 font-black">?</span>
        </div>
        <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Cálculo Pendente</p>
        <p className="text-[9px] text-white/20 mt-1 italic">Nenhum gasto registrado este mês</p>
      </div>
    )
  }

  return (
    <div className="glass p-8 rounded-2xl border border-white/5 h-full flex flex-col relative overflow-hidden group">
      {/* Background Glow */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 blur-[80px] rounded-full pointer-events-none" />
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">Distribuição</h2>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mt-1">Representação por Categoria</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-neon-primary" />
          <span className="text-[9px] font-black text-white/40 tracking-widest uppercase">Live Data</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center gap-10 flex-1">
        {/* SVG Pie */}
        <div className="relative w-48 h-48 md:w-56 md:h-56">
          <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_0_20px_rgba(0,0,0,0.4)] overflow-visible">
            {segments.map((segment, i) => (
              <motion.path
                key={segment.name}
                d={segment.dPath}
                fill={segment.color}
                stroke="#0d141f"
                strokeWidth="1.5"
                initial={{ opacity: 0, scale: 0.8, rotate: -20 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ 
                  duration: 1.2, 
                  delay: i * 0.08,
                  ease: [0.16, 1, 0.3, 1]
                }}
                className="cursor-pointer hover:brightness-125 transition-all duration-300"
                style={{ 
                  filter: `drop-shadow(0 0 12px ${segment.color}44)`,
                }}
                whileHover={{ scale: 1.05, zIndex: 50 }}
              >
                <title>{`${segment.name}: ${segment.percentage.toFixed(1)}%`}</title>
              </motion.path>
            ))}
            {/* Center Mask for Donut Effect */}
            <circle cx="100" cy="100" r="48" fill="#0d141f" />
            <circle cx="100" cy="100" r="48" fill="rgba(255,255,255,0.02)" />
            <circle cx="100" cy="100" r="48" fill="none" stroke="white" strokeOpacity="0.05" strokeWidth="1" />
          </svg>
          
          {/* Central Percentage */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[9px] font-bold text-white/20 uppercase tracking-[0.3em]">TOTAL</span>
            <span className="text-xl font-black tracking-tighter text-white/90">100%</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 flex flex-col gap-y-2 w-full lg:max-w-none max-h-64 overflow-y-auto pr-2 custom-scrollbar">
          {segments.slice(0, 12).map((segment, i) => (
            <motion.div 
              key={segment.name}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.05 }}
              className="flex items-center justify-between group/legend cursor-default border-b border-white/[0.03] pb-1.5 min-w-0"
            >
              <div className="flex items-center gap-3 min-w-0 overflow-hidden flex-1">
                <div 
                  className="w-2 h-2 rounded-sm flex-shrink-0" 
                  style={{ 
                    backgroundColor: segment.color, 
                    boxShadow: `0 0 12px ${segment.color}66`,
                  }} 
                />
                <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest whitespace-nowrap group-hover/legend:text-white/90 transition-colors">
                  {segment.name}
                </span>
              </div>
              <span className="text-[11px] font-black text-secondary tracking-tighter flex-shrink-0 ml-4">
                {segment.percentage.toFixed(1)}%
              </span>
            </motion.div>
          ))}
          {segments.length > 12 && (
            <div className="text-center pt-3 italic text-[9px] text-white/25 bg-white/5 rounded-lg py-1 mt-1">
              + {segments.length - 12} categorias analíticas adicionais
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
