import { useState, useMemo } from 'react'
import type { CashFlowDay } from '../types'
import { formatCurrency, formatDayMonth, formatDateBR } from '../lib/utils'
import { TrendingUp, TrendingDown, Calendar, ArrowUpRight, ArrowDownRight, Layers } from 'lucide-react'

interface CashFlowChartProps {
  timeline: CashFlowDay[]
  privacyMode?: boolean
}

type ChartViewMode = 'daily' | 'cumulative'

export function CashFlowChart({ timeline, privacyMode = false }: CashFlowChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<ChartViewMode>('daily')

  const points = useMemo(() => timeline, [timeline])

  // Dados acumulados caso o usuário escolha o modo "Evolução Acumulada"
  const processedPoints = useMemo(() => {
    let runningIncome = 0
    let runningExpense = 0

    return points.map((p) => {
      runningIncome += p.incomes
      runningExpense += p.expenses

      return {
        ...p,
        cumIncome: runningIncome,
        cumExpense: runningExpense,
      }
    })
  }, [points])

  // Totais do período para a legenda
  const periodTotals = useMemo(() => {
    const totalIncomes = points.reduce((acc, p) => acc + p.incomes, 0)
    const totalExpenses = points.reduce((acc, p) => acc + p.expenses, 0)
    const net = totalIncomes - totalExpenses
    return { totalIncomes, totalExpenses, net }
  }, [points])

  // Dimensões do Canvas SVG
  const svgWidth = 840
  const svgHeight = 220
  const padTop = 25
  const padBottom = 35
  const padLeft = 60
  const padRight = 25

  const plotWidth = svgWidth - padLeft - padRight
  const plotHeight = svgHeight - padTop - padBottom

  // Cálculo da Escala Y
  const scale = useMemo(() => {
    if (points.length === 0) {
      return { maxVal: 1000, getY: () => padTop + plotHeight / 2, zeroY: padTop + plotHeight }
    }

    let maxVal = 0
    if (viewMode === 'cumulative') {
      const lastPoint = processedPoints[processedPoints.length - 1]
      maxVal = Math.max(100, lastPoint ? Math.max(lastPoint.cumIncome, lastPoint.cumExpense) : 100)
    } else {
      maxVal = Math.max(100, ...points.map((p) => Math.max(p.incomes, p.expenses)))
    }

    // Margem de folga superior de 15%
    const maxScale = Math.ceil((maxVal * 1.15) / 100) * 100

    const getY = (val: number) => {
      if (maxScale === 0) return padTop + plotHeight
      const clamped = Math.max(0, val)
      const ratio = clamped / maxScale
      return padTop + plotHeight - ratio * plotHeight
    }

    const zeroY = padTop + plotHeight

    return { maxVal: maxScale, getY, zeroY }
  }, [points, processedPoints, viewMode, plotHeight, padTop])

  // Coordenadas das Linhas
  const { greenPts, redPts, stepX } = useMemo(() => {
    if (points.length === 0) return { greenPts: [], redPts: [], stepX: 0 }

    const step = points.length > 1 ? plotWidth / (points.length - 1) : plotWidth

    const gPts = processedPoints.map((p, i) => {
      const val = viewMode === 'cumulative' ? p.cumIncome : p.incomes
      return {
        x: padLeft + i * step,
        y: scale.getY(val),
        val,
      }
    })

    const rPts = processedPoints.map((p, i) => {
      const val = viewMode === 'cumulative' ? p.cumExpense : p.expenses
      return {
        x: padLeft + i * step,
        y: scale.getY(val),
        val,
      }
    })

    return { greenPts: gPts, redPts: rPts, stepX: step }
  }, [points, processedPoints, viewMode, scale, padLeft, plotWidth])

  // Gerador de curva suave (Catmull-Rom para Bezier Cúbico)
  const createSmoothLine = (pts: { x: number; y: number }[]): string => {
    if (pts.length === 0) return ''
    if (pts.length === 1) return `M ${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`

    let path = `M ${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)]
      const p1 = pts[i]
      const p2 = pts[i + 1]
      const p3 = pts[Math.min(pts.length - 1, i + 2)]

      const cp1x = p1.x + (p2.x - p0.x) / 6
      const cp1y = p1.y + (p2.y - p0.y) / 6
      const cp2x = p2.x - (p3.x - p1.x) / 6
      const cp2y = p2.y - (p3.y - p1.y) / 6

      path += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`
    }
    return path
  }

  const greenLinePath = useMemo(() => createSmoothLine(greenPts), [greenPts])
  const redLinePath = useMemo(() => createSmoothLine(redPts), [redPts])

  const greenAreaPath = useMemo(() => {
    if (greenPts.length < 2) return ''
    const last = greenPts[greenPts.length - 1]
    const first = greenPts[0]
    return `${greenLinePath} L ${last.x.toFixed(1)},${scale.zeroY} L ${first.x.toFixed(1)},${scale.zeroY} Z`
  }, [greenLinePath, greenPts, scale.zeroY])

  const redAreaPath = useMemo(() => {
    if (redPts.length < 2) return ''
    const last = redPts[redPts.length - 1]
    const first = redPts[0]
    return `${redLinePath} L ${last.x.toFixed(1)},${scale.zeroY} L ${first.x.toFixed(1)},${scale.zeroY} Z`
  }, [redLinePath, redPts, scale.zeroY])

  // Formatação compacta para os marcadores do eixo Y
  const formatCompactY = (val: number) => {
    if (val === 0) return 'R$ 0'
    if (val >= 1000) {
      const k = val / 1000
      return `R$ ${k.toFixed(k % 1 === 0 ? 0 : 1)}k`
    }
    return `R$ ${val.toFixed(0)}`
  }

  // Linhas de Grade Horizontais (0%, 33%, 66%, 100%)
  const gridTicks = [
    { label: formatCompactY(scale.maxVal), y: padTop },
    { label: formatCompactY(scale.maxVal * 0.66), y: padTop + plotHeight * 0.34 },
    { label: formatCompactY(scale.maxVal * 0.33), y: padTop + plotHeight * 0.67 },
    { label: 'R$ 0', y: scale.zeroY },
  ]

  const activeDay = hoveredIndex !== null ? processedPoints[hoveredIndex] : null
  const activeGreen = hoveredIndex !== null ? greenPts[hoveredIndex] : null
  const activeRed = hoveredIndex !== null ? redPts[hoveredIndex] : null

  if (points.length === 0) {
    return (
      <div className="h-56 flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 text-xs bg-white dark:bg-zinc-900/60 rounded-2xl border border-zinc-200/90 dark:border-zinc-800/80 p-6">
        <Layers className="w-8 h-8 text-zinc-300 dark:text-zinc-600 mb-2" />
        <span>Nenhum dado temporal registrado no período selecionado.</span>
      </div>
    )
  }

  return (
    <div className="relative w-full rounded-2xl bg-white dark:bg-zinc-900/70 border border-zinc-200/90 dark:border-zinc-800/80 p-5 shadow-sm backdrop-blur-sm transition-all">
      
      {/* Top Header & Legenda & Controles */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800/60">
        
        {/* Título e Status de Auditoria */}
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider font-bold text-zinc-500 dark:text-zinc-400">
              Gráfico Comparativo de Fluxo
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
              2 Linhas: Ganhos vs Gastos
            </span>
          </div>

          <div className="mt-1 flex items-center gap-3">
            {activeDay ? (
              <div className="flex flex-wrap items-center gap-2.5 text-xs">
                <span className="font-semibold text-zinc-900 dark:text-white flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                  {formatDateBR(activeDay.date)}:
                </span>
                <span className="font-mono-numbers text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/50">
                  Ganhos: +{formatCurrency(viewMode === 'cumulative' ? activeDay.cumIncome : activeDay.incomes, privacyMode)}
                </span>
                <span className="font-mono-numbers text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-800/50">
                  Gastos: -{formatCurrency(viewMode === 'cumulative' ? activeDay.cumExpense : activeDay.expenses, privacyMode)}
                </span>
                <span className="text-zinc-500 dark:text-zinc-400 font-medium flex items-center gap-1">
                  {viewMode === 'cumulative' ? 'Saldo Acumulado:' : 'Saldo do Dia:'}
                  {(viewMode === 'cumulative' ? activeDay.cumIncome - activeDay.cumExpense : activeDay.net) >= 0 ? (
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
                  )}
                  <strong
                    className={
                      (viewMode === 'cumulative' ? activeDay.cumIncome - activeDay.cumExpense : activeDay.net) >= 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }
                  >
                    {formatCurrency(
                      viewMode === 'cumulative' ? activeDay.cumIncome - activeDay.cumExpense : activeDay.net,
                      privacyMode
                    )}
                  </strong>
                </span>
              </div>
            ) : (
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Passe o mouse sobre as linhas para auditar a relação entre receitas e despesas dia a dia.
              </p>
            )}
          </div>
        </div>

        {/* Controles de Modo & Legenda */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Seletor Diário / Acumulado */}
          <div className="flex items-center p-0.5 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl border border-zinc-200 dark:border-zinc-700/60 text-xs">
            <button
              onClick={() => setViewMode('daily')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                viewMode === 'daily'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Diário
            </button>
            <button
              onClick={() => setViewMode('cumulative')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                viewMode === 'cumulative'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Evolução Acumulada
            </button>
          </div>

          {/* Legenda com Cores Oficiais */}
          <div className="flex items-center gap-4 text-xs font-medium pl-1">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-1 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500/50" />
              <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                <ArrowUpRight className="w-3.5 h-3.5" />
                Ganhos ({formatCurrency(periodTotals.totalIncomes, privacyMode)})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-3.5 h-1 rounded-full bg-rose-500 shadow-xs shadow-rose-500/50" />
              <span className="text-rose-700 dark:text-rose-400 flex items-center gap-1 font-semibold">
                <ArrowDownRight className="w-3.5 h-3.5" />
                Gastos ({formatCurrency(periodTotals.totalExpenses, privacyMode)})
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* SVG Canvas com 2 Linhas */}
      <div className="relative w-full pt-4 select-none">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-52 sm:h-56 overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Gradiente Verde para Área de Ganhos */}
            <linearGradient id="greenAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.22" />
              <stop offset="85%" stopColor="#10B981" stopOpacity="0.02" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
            </linearGradient>

            {/* Gradiente Vermelho para Área de Gastos */}
            <linearGradient id="redAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EF4444" stopOpacity="0.18" />
              <stop offset="85%" stopColor="#EF4444" stopOpacity="0.02" />
              <stop offset="100%" stopColor="#EF4444" stopOpacity="0.0" />
            </linearGradient>

            {/* Filtros de Sombra / Brilho Suave */}
            <filter id="glowGreen" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#10B981" floodOpacity="0.35" />
            </filter>
            <filter id="glowRed" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#EF4444" floodOpacity="0.35" />
            </filter>
          </defs>

          {/* Linhas de Grade e Marcadores Y */}
          {gridTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1={padLeft}
                y1={tick.y}
                x2={svgWidth - padRight}
                y2={tick.y}
                stroke="currentColor"
                className="text-zinc-200 dark:text-zinc-800"
                strokeWidth={i === gridTicks.length - 1 ? '1.5' : '1'}
                strokeDasharray={i === gridTicks.length - 1 ? undefined : '4 4'}
              />
              <text
                x={padLeft - 8}
                y={tick.y + 3}
                textAnchor="end"
                className="text-[10px] font-mono-numbers fill-zinc-400 dark:fill-zinc-500"
              >
                {tick.label}
              </text>
            </g>
          ))}

          {/* Área sob a Linha de Ganhos (Verde) */}
          {greenAreaPath && <path d={greenAreaPath} fill="url(#greenAreaGradient)" />}

          {/* Área sob a Linha de Gastos (Vermelha) */}
          {redAreaPath && <path d={redAreaPath} fill="url(#redAreaGradient)" />}

          {/* 1. LINHA VERMELHA (Gastos / Despesas) */}
          {redLinePath && (
            <path
              d={redLinePath}
              fill="none"
              stroke="#EF4444"
              strokeWidth="2.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glowRed)"
            />
          )}

          {/* 2. LINHA VERDE (Ganhos / Receitas) */}
          {greenLinePath && (
            <path
              d={greenLinePath}
              fill="none"
              stroke="#10B981"
              strokeWidth="2.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glowGreen)"
            />
          )}

          {/* Pontos nas movimentações (Modo Diário) */}
          {viewMode === 'daily' &&
            processedPoints.map((p, i) => {
              const gPt = greenPts[i]
              const rPt = redPts[i]
              return (
                <g key={`markers-${p.date}`}>
                  {p.incomes > 0 && gPt && (
                    <circle
                      cx={gPt.x}
                      cy={gPt.y}
                      r="3.5"
                      fill="#10B981"
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                      className="cursor-pointer"
                    />
                  )}
                  {p.expenses > 0 && rPt && (
                    <circle
                      cx={rPt.x}
                      cy={rPt.y}
                      r="3.5"
                      fill="#EF4444"
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                      className="cursor-pointer"
                    />
                  )}
                </g>
              )
            })}

          {/* Indicador Vertical e Pontos Destacados de Hover */}
          {hoveredIndex !== null && activeGreen && activeRed && (
            <g className="pointer-events-none">
              {/* Linha vertical tracejada */}
              <line
                x1={activeGreen.x}
                y1={padTop}
                x2={activeGreen.x}
                y2={scale.zeroY}
                stroke="#71717A"
                strokeWidth="1.25"
                strokeDasharray="3 3"
                strokeOpacity="0.7"
              />

              {/* Ponto na Linha Verde (Ganhos) */}
              <circle
                cx={activeGreen.x}
                cy={activeGreen.y}
                r="6"
                fill="#10B981"
                stroke="#FFFFFF"
                strokeWidth="2.5"
                filter="url(#glowGreen)"
              />
              <circle cx={activeGreen.x} cy={activeGreen.y} r="2.5" fill="#FFFFFF" />

              {/* Ponto na Linha Vermelha (Gastos) */}
              <circle
                cx={activeRed.x}
                cy={activeRed.y}
                r="6"
                fill="#EF4444"
                stroke="#FFFFFF"
                strokeWidth="2.5"
                filter="url(#glowRed)"
              />
              <circle cx={activeRed.x} cy={activeRed.y} r="2.5" fill="#FFFFFF" />
            </g>
          )}

          {/* Zonas Invisíveis de Interação Hover por Dia */}
          {processedPoints.map((p, i) => {
            const x = padLeft + i * stepX
            const triggerWidth = Math.max(stepX, 16)
            return (
              <rect
                key={`trigger-${p.date}`}
                x={x - triggerWidth / 2}
                y={padTop}
                width={triggerWidth}
                height={plotHeight}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            )
          })}
        </svg>

        {/* Eixo X com Datas Formatadas */}
        <div className="flex justify-between items-center text-[10px] text-zinc-400 dark:text-zinc-500 font-mono-numbers mt-2 px-1">
          <span>{formatDayMonth(points[0].date)}</span>
          {points.length > 8 && (
            <span>{formatDayMonth(points[Math.floor(points.length * 0.33)].date)}</span>
          )}
          {points.length > 15 && (
            <span>{formatDayMonth(points[Math.floor(points.length * 0.66)].date)}</span>
          )}
          <span>{formatDayMonth(points[points.length - 1].date)}</span>
        </div>

        {/* Mini Tooltip Flutuante de Detalhamento do Dia */}
        {activeDay && hoveredIndex !== null && (
          <div
            className="absolute z-20 pointer-events-none transition-all duration-75"
            style={{
              left: `${Math.min(85, Math.max(15, (hoveredIndex / Math.max(1, points.length - 1)) * 100))}%`,
              bottom: '50px',
              transform: 'translateX(-50%)',
            }}
          >
            <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-xl p-3 border border-zinc-200/90 dark:border-zinc-700/80 shadow-xl text-xs space-y-1.5 min-w-[200px]">
              <div className="font-semibold text-zinc-800 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-800 pb-1 flex items-center justify-between">
                <span>{formatDayMonth(activeDay.date)}</span>
                <span className="text-[10px] text-zinc-400 font-mono-numbers">{activeDay.date}</span>
              </div>
              
              <div className="space-y-1 font-mono-numbers">
                <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Ganhos:
                  </span>
                  <span className="font-bold">
                    +{formatCurrency(viewMode === 'cumulative' ? activeDay.cumIncome : activeDay.incomes, privacyMode)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Gastos:
                  </span>
                  <span className="font-bold">
                    -{formatCurrency(viewMode === 'cumulative' ? activeDay.cumExpense : activeDay.expenses, privacyMode)}
                  </span>
                </div>
              </div>

              {activeDay.transactions.length > 0 && (
                <div className="border-t border-zinc-100 dark:border-zinc-800 pt-1 text-[10px] text-zinc-500 dark:text-zinc-400">
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">
                    {activeDay.transactions.length} lançamento(s):
                  </span>
                  <div className="truncate max-w-[190px]">
                    {activeDay.transactions.map((t) => t.description).join(', ')}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

    </div>
  )
}
