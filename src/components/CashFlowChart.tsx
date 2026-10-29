import { useState, useMemo } from 'react'
import type { CashFlowDay } from '../types'
import { formatCurrency, formatDayMonth } from '../lib/utils'

interface CashFlowChartProps {
  timeline: CashFlowDay[]
  privacyMode?: boolean
}

export function CashFlowChart({ timeline, privacyMode = false }: CashFlowChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const points = useMemo(() => {
    return timeline
  }, [timeline])

  // Cálculos de Escala SVG
  const chartMetrics = useMemo(() => {
    const height = 180
    const width = 800

    if (points.length === 0) {
      return { min: 0, max: 100, range: 100, height, width, getY: () => height / 2, zeroY: height / 2 }
    }

    let maxVal = Math.max(...points.map((p) => Math.max(p.projectedBalance, p.incomes, p.expenses)))
    let minVal = Math.min(0, ...points.map((p) => p.projectedBalance))

    // Margem de respiro
    if (maxVal === minVal) {
      maxVal += 1000
      minVal -= 1000
    }
    const range = maxVal - minVal

    const getY = (val: number) => {
      const normalized = (val - minVal) / range
      return height - normalized * (height - 30) - 15
    }

    const zeroY = getY(0)

    return { min: minVal, max: maxVal, range, height, width, getY, zeroY }
  }, [points])

  if (points.length === 0) {
    return (
      <div className="h-44 flex items-center justify-center text-zinc-400 text-xs">
        Nenhum dado temporal no período selecionado.
      </div>
    )
  }

  // Gera path da linha de projeção de saldo
  const svgWidth = chartMetrics.width
  const svgHeight = chartMetrics.height
  const stepX = svgWidth / Math.max(1, points.length - 1)

  const linePoints = points.map((p, i) => `${i * stepX},${chartMetrics.getY(p.projectedBalance)}`).join(' ')
  const areaPoints = `${linePoints} ${svgWidth},${chartMetrics.height} 0,${chartMetrics.height}`

  const hoveredDay = hoveredIndex !== null ? points[hoveredIndex] : null

  return (
    <div className="relative w-full rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200/90 dark:border-zinc-800/80 p-5 shadow-sm backdrop-blur-sm">
      {/* Chart Title and Current Hover Value */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-zinc-500 dark:text-zinc-400 block">
            Dinâmica Diária & Curva de Liquidez
          </span>
          <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
            {hoveredDay ? (
              <>
                Data: <strong className="text-zinc-900 dark:text-white">{formatDayMonth(hoveredDay.date)}</strong> • Saldo Projetado:{' '}
                <strong className={hoveredDay.projectedBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                  {formatCurrency(hoveredDay.projectedBalance, privacyMode)}
                </strong>
              </>
            ) : (
              'Passe o mouse pelos dias para auditar o fluxo previsto'
            )}
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-[11px] text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
            <span>Entradas</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
            <span>Saídas</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-emerald-500" />
            <span>Curva de Caixa</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-44 overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="balanceAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Zero baseline */}
          <line
            x1="0"
            y1={chartMetrics.zeroY}
            x2={svgWidth}
            y2={chartMetrics.zeroY}
            stroke="#94A3B8"
            strokeOpacity="0.3"
            strokeDasharray="4 4"
          />

          {/* Daily Inflows and Outflows Bars */}
          {points.map((p, i) => {
            const x = i * stepX
            const barW = Math.max(3, Math.min(14, (svgWidth / points.length) * 0.45))

            // Altura relativa das barras
            const inH = p.incomes > 0 ? Math.max(4, (p.incomes / chartMetrics.range) * (svgHeight - 40)) : 0
            const outH = p.expenses > 0 ? Math.max(4, (p.expenses / chartMetrics.range) * (svgHeight - 40)) : 0

            return (
              <g key={p.date} className="cursor-pointer">
                {/* Inflow bar */}
                {p.incomes > 0 && (
                  <rect
                    x={x - barW - 1}
                    y={chartMetrics.zeroY - inH}
                    width={barW}
                    height={inH}
                    fill="#10B981"
                    rx={2}
                    className="opacity-80 hover:opacity-100 transition-opacity"
                  />
                )}

                {/* Outflow bar */}
                {p.expenses > 0 && (
                  <rect
                    x={x + 1}
                    y={chartMetrics.zeroY}
                    width={barW}
                    height={outH}
                    fill="#F43F5E"
                    rx={2}
                    className="opacity-75 hover:opacity-100 transition-opacity"
                  />
                )}

                {/* Hover trigger zone */}
                <rect
                  x={x - stepX / 2}
                  y={0}
                  width={stepX}
                  height={svgHeight}
                  fill="transparent"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              </g>
            )
          })}

          {/* Area under balance line */}
          <polygon points={areaPoints} fill="url(#balanceAreaGrad)" />

          {/* Balance Line */}
          <polyline
            fill="none"
            stroke="#10B981"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={linePoints}
          />

          {/* Hover indicator dot */}
          {hoveredIndex !== null && (
            <circle
              cx={hoveredIndex * stepX}
              cy={chartMetrics.getY(points[hoveredIndex].projectedBalance)}
              r="5"
              fill="#FFFFFF"
              stroke="#10B981"
              strokeWidth="3"
            />
          )}
        </svg>

        {/* X-axis labels */}
        <div className="flex justify-between items-center text-[10px] text-zinc-400 dark:text-zinc-500 font-mono-numbers mt-2 px-1">
          <span>{formatDayMonth(points[0].date)}</span>
          {points.length > 10 && <span>{formatDayMonth(points[Math.floor(points.length / 2)].date)}</span>}
          <span>{formatDayMonth(points[points.length - 1].date)}</span>
        </div>
      </div>
    </div>
  )
}
